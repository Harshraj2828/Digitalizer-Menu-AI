import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menu = await db.getMenu(id);

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error(`API menu GET error:`, error);
    return NextResponse.json({ error: "Failed to retrieve menu" }, { status: 500 });
  }
}

export async function PUT(
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

    // Verify ownership: restaurantId must match session or be in Demo Mode
    const isOwner = menu.restaurantId === session.restaurantId;
    const isDemoMode = session.isDemo;

    if (!isOwner && !isDemoMode) {
      return NextResponse.json({ error: "Forbidden: You do not own this menu." }, { status: 403 });
    }

    const body = await request.json();
    const { title, sections } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Menu title is required" }, { status: 400 });
    }

    const updatedMenu = await db.updateMenu(id, { title, sections });
    return NextResponse.json({ success: true, menu: updatedMenu });
  } catch (error) {
    console.error(`API menu PUT error:`, error);
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 });
  }
}
