import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(request);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (id !== session.restaurantId && !session.isDemo) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const menus = await db.getRestaurantMenus(id);
    return NextResponse.json(menus);
  } catch (error) {
    console.error("API restaurant menus GET error:", error);
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 });
  }
}
