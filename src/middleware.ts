import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only these routes are accessible without authentication
const publicRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // Check for session cookie (Auth.js uses this cookie name)
  const sessionCookie = request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");
  const isLoggedIn = !!sessionCookie;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthApiRoute = nextUrl.pathname.startsWith("/api/auth");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isStaticAsset =
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/favicon") ||
    nextUrl.pathname.includes(".");

  // Always allow auth API routes and static assets
  if (isAuthApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // Protect all API routes (except auth)
  if (isApiRoute && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/nyheter", nextUrl));
  }

  // If not logged in and trying to access protected route, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", nextUrl);
    // Don't add callback for root, just go to nyheter after login
    if (nextUrl.pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
