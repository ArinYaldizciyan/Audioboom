import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Get the admin password from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Compare passwords
    if (password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Create a secure session token using JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || nanoid());
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime("1w") // Token expires in 1 week
      .sign(secret);

    // Create response with secure cookie
    const response = NextResponse.json({ success: true });

    // Set a secure session cookie with the JWT
    response.cookies.set("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 1 week
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
