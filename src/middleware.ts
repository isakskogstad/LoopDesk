import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that are accessible without authentication
const publicPaths = ["/login", "/register"];

// Routes that logged-in users should be redirected away from
const authPaths = ["/login", "/register"];

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
    pathname === "/api/feed/global" ||
    pathname === "/api/sources" ||
    pathname === "/api/article"
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

  // Check path types
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"));
  const isAuthPath = authPaths.some(path => pathname === path || pathname.startsWith(path + "/"));

  // Redirect logged-in users away from auth pages (login/register)
  if (isLoggedIn && isAuthPath) {
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
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|avatars/).*)",
  ],
};
