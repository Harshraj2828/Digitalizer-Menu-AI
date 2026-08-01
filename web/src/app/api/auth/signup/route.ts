import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, ownerName, email, mobileNumber, password, address, gstNumber } = body;

    // Validation
    if (!name || !ownerName || !email || !mobileNumber || !password || !address) {
      return NextResponse.json(
        { error: "Missing required fields: name, ownerName, email, mobileNumber, password, address are required." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db.getRestaurantByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "A restaurant with this email address already exists." },
        { status: 400 }
      );
    }

    // Hash password & create restaurant
    const passwordHash = hashPassword(password);
    const restaurant = await db.createRestaurant(
      name,
      ownerName,
      email,
      mobileNumber,
      passwordHash,
      address,
      gstNumber
    );

    // Set session cookie
    const response = NextResponse.json({ success: true, restaurant });
    setSessionCookie(response, {
      restaurantId: restaurant.id,
      email: restaurant.email,
      ownerName: restaurant.ownerName,
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign up: " + (error as Error).message },
      { status: 500 }
    );
  }
}
