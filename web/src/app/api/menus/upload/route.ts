import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/storage";
import { extractMenu } from "@/lib/ai-extractor";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let fileBuffer: Buffer;
    let fileName = "menu.jpg";
    let contentType = "image/jpeg";
    let title = "New Digitized Menu";
    let restaurantId = session.restaurantId;

    const contentTypeHeader = request.headers.get("content-type") || "";

    if (contentTypeHeader.includes("application/json")) {
      const body = await request.json();
      const { file, fileName: name, title: menuTitle } = body;

      if (!file) {
        return NextResponse.json({ error: "File data (base64) is required" }, { status: 400 });
      }

      if (name) fileName = name;
      if (menuTitle) title = menuTitle;

      // Extract mime type from base64 string (e.g. application/pdf, image/png)
      const mimeMatch = file.match(/^data:([a-zA-Z0-9/-]+);base64,/);
      if (mimeMatch) {
        contentType = mimeMatch[1];
      }

      // Clean base64 prefix if present (handles any file type)
      const base64Data = file.replace(/^data:[a-zA-Z0-9/-]+;base64,/, "");
      fileBuffer = Buffer.from(base64Data, "base64");
    } else {
      // Form data multipart upload
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const menuTitle = formData.get("title") as string | null;

      if (!file) {
        return NextResponse.json({ error: "File upload is required" }, { status: 400 });
      }

      fileName = file.name;
      contentType = file.type;
      if (menuTitle) title = menuTitle;

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    }

    // 1. Upload the image to storage (Supabase or Local Fallback)
    let sourceImageUrl = null;
    try {
      sourceImageUrl = await uploadImage(fileBuffer, fileName, contentType);
    } catch (uploadErr) {
      console.error("Storage upload failed, proceeding without image url:", uploadErr);
    }

    // 2. Create the menu record in 'processing' state
    const menuRecord = await db.createMenu(restaurantId, title, sourceImageUrl, "processing");

    // 3. Trigger AI extraction (OpenAI Vision + Tesseract.js / Mock Fallback)
    let extractedData;
    try {
      extractedData = await extractMenu(fileBuffer, contentType, fileName);
    } catch (aiErr) {
      console.error("AI menu extraction failed:", aiErr);
      extractedData = {
        menuTitle: title,
        currency: "INR",
        sections: [
          {
            name: "Starters & Mains",
            items: [
              {
                name: "Paneer Tikka (Fallback)",
                description: "AI extraction encountered an error. Edit fields manually.",
                price: 249,
                isVeg: true,
              },
            ],
          },
        ],
      };
    }

    // 4. Update the menu with extracted sections and items, transitioning status to 'ready'
    const finalMenu = await db.updateMenu(menuRecord.id, {
      title: extractedData.menuTitle || title,
      sections: extractedData.sections.map((sec, secIdx) => ({
        name: sec.name,
        displayOrder: secIdx,
        items: sec.items.map((item, itemIdx) => ({
          name: item.name,
          description: item.description || "",
          price: item.price,
          currency: extractedData.currency || "INR",
          isVeg: item.isVeg,
          isAvailable: true,
          displayOrder: itemIdx,
        })),
      })),
    });

    // If sourceImageUrl wasn't set earlier because updateMenu doesn't update it, let's attach it to final response
    if (finalMenu && sourceImageUrl) {
      finalMenu.sourceImageUrl = sourceImageUrl;
      
      // Update Prisma or MockDB directly to persist sourceImageUrl if needed
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.menu.update({
          where: { id: finalMenu.id },
          data: { sourceImageUrl },
        });
      } catch (dbErr) {
        // Fallback for mockDB (update local file)
        try {
          const { readMockDB, writeMockDB } = await import("@/lib/mock-db");
          const mockData = readMockDB();
          const itemIdx = mockData.menus.findIndex(m => m.id === finalMenu.id);
          if (itemIdx !== -1) {
            mockData.menus[itemIdx].sourceImageUrl = sourceImageUrl;
            writeMockDB(mockData);
          }
        } catch {}
      }
    }

    return NextResponse.json({ success: true, menu: finalMenu });
  } catch (error) {
    console.error("API menus upload handler failed:", error);
    return NextResponse.json(
      { error: "Failed to process menu upload: " + (error as Error).message },
      { status: 500 }
    );
  }
}
