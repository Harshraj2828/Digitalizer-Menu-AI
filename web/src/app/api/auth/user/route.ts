import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = getSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: No active session found." },
        { status: 401 }
      );
    }

    const restaurant = await db.getRestaurant(session.restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      restaurant,
      isDemo: session.isDemo,
    });
  } catch (error) {
    console.error("Auth User API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user session: " + (error as Error).message },
      { status: 500 }
    );
  }
}
