import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(request);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const menu = await db.getMenu(id);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const isOwner = menu.restaurantId === session.restaurantId;
    const isDemoMode = session.isDemo;

    if (!isOwner && !isDemoMode) {
      return NextResponse.json({ error: "Forbidden: You do not own this menu." }, { status: 403 });
    }

    const publishedMenu = await db.publishMenu(id);
    return NextResponse.json({ success: true, menu: publishedMenu });
  } catch (error) {
    console.error(`API menu publish POST error:`, error);
    return NextResponse.json({ error: "Failed to publish menu" }, { status: 500 });
  }
}
