import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { nanoid } from "nanoid";

// Paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

async function verifyAuth(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || nanoid());
    const { payload } = await jwtVerify(token, secret);
    return !!payload;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths
  if (PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get("auth")?.value;
  const isAuthenticated = token && (await verifyAuth(token));

  if (!isAuthenticated) {
    // If it's an API route, return 401 Unauthorized
    if (path.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // For non-API routes, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/login (auth endpoint)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth/login|login|_next/static|_next/image|favicon.ico).*)",
  ],
};
