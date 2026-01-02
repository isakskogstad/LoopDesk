import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only these routes are accessible without authentication
const publicPaths = ["/login", "/register", "/nyheter"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie (Auth.js uses these cookie names)
  const sessionCookie = request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");
  const isLoggedIn = !!sessionCookie;

  // Always allow auth API routes, health check, and public endpoints
  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/api/health" ||
    pathname === "/api/debug/ip" ||
    pathname === "/api/bevakning/seed" ||
    pathname.startsWith("/api/bevakning/enrich") ||
    pathname === "/api/cron/refresh" ||
    pathname === "/api/feed/global"
  ) {
    return NextResponse.next();
  }

  // Protect all other API routes
  if (pathname.startsWith("/api")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Check if current path is public
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"));

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/nyheter", request.url));
  }

  // Redirect non-logged-in users to login for protected routes
  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("X-Middleware-Active", "true");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/",
    "/nyheter/:path*",
    "/bolag/:path*",
    "/bevakning/:path*",
    "/kungorelser/:path*",
    "/konto/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
};
