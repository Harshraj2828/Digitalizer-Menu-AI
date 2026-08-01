import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(request);
    
    // Allow public access to QR codes if they need to fetch it, but require a session for security
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const menu = await db.getMenu(id);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;
    const qrData = `${origin}/menu/${id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(qrData)}`;

    return NextResponse.json({ qrCodeUrl });
  } catch (error) {
    console.error("QR Code API error:", error);
    return NextResponse.json({ error: "Failed to generate QR Code" }, { status: 500 });
  }
}
