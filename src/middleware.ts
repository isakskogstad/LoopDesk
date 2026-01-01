import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register"];

// Routes that should redirect to home if user is logged in
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isStaticAsset =
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/favicon") ||
    nextUrl.pathname.includes(".");

  // Always allow API auth routes and static assets
  if (isApiAuthRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // If logged in and trying to access auth pages, redirect to home
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/nyheter", nextUrl));
  }

  // If not logged in and trying to access protected route, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
