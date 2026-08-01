import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const restaurant = await db.getRestaurantByEmail(email);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const inputHash = hashPassword(password);
    if (restaurant.passwordHash !== inputHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Prepare response & set session cookie
    const response = NextResponse.json({ success: true, restaurant });
    setSessionCookie(response, {
      restaurantId: restaurant.id,
      email: restaurant.email,
      ownerName: restaurant.ownerName,
    });

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign in: " + (error as Error).message },
      { status: 500 }
    );
  }
}
