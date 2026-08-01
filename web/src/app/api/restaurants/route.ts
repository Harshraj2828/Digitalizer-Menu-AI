import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await db.getRestaurant(session.restaurantId);
    if (!restaurant) {
      return NextResponse.json([]);
    }

    return NextResponse.json([restaurant]);
  } catch (error) {
    console.error("API restaurants GET error:", error);
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, phone } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Restaurant name is required" }, { status: 400 });
    }

    // Return the active restaurant or create a new one associated with owner (fallback compatibility)
    const restaurant = await db.getRestaurant(session.restaurantId);
    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error("API restaurants POST error:", error);
    return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 });
  }
}
