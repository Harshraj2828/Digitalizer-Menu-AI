import crypto from "crypto";
import { NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET || "digidish-extremely-long-secret-key-32-chars-long!";
const ALGORITHM = "aes-256-cbc";
const COOKIE_NAME = "digidish_session";

// Salt for password hashing
const PASSWORD_SALT = "digidish-salt-123456789";

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", PASSWORD_SALT).update(password).digest("hex");
}

export function encryptSession(payload: any): string {
  const iv = crypto.randomBytes(16);
  // Ensure secret is exactly 32 bytes
  const key = crypto.createHash("sha256").update(SECRET).digest();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(payload), "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptSession(token: string): any | null {
  try {
    const [ivHex, encrypted] = token.split(":");
    if (!ivHex || !encrypted) return null;
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.createHash("sha256").update(SECRET).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

/**
 * Parses the Cookie header to find a specific cookie value.
 */
function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

/**
 * Retrieve session payload from active Request.
 * If the demo query or demo header is active, returns a mock session.
 */
export function getSession(req: Request): { restaurantId: string; email: string; isDemo: boolean } | null {
  // Check URL query parameters for demo mode
  const url = new URL(req.url);
  const isDemoQuery = url.searchParams.get("demo") === "true";
  
  if (isDemoQuery) {
    return {
      restaurantId: "r1",
      email: "chef@spicesymphony.com",
      isDemo: true,
    };
  }

  const cookieHeader = req.headers.get("cookie");
  const token = parseCookie(cookieHeader, COOKIE_NAME);
  if (!token) return null;

  const session = decryptSession(token);
  if (!session) return null;

  return {
    restaurantId: session.restaurantId,
    email: session.email,
    isDemo: false,
  };
}

/**
 * Sets session token in Response cookies.
 */
export function setSessionCookie(res: NextResponse, payload: any) {
  const token = encryptSession(payload);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

/**
 * Clears session token from Response cookies.
 */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
