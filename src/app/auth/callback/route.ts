import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Use explicit origin to avoid request.url returning wrong host (e.g., 0.0.0.0:8080)
function getOrigin(request: NextRequest): string {
  // Check x-forwarded-host first (set by proxies like Railway)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Fallback to host header
  const host = request.headers.get("host");
  if (host && !host.includes("0.0.0.0") && !host.includes("localhost")) {
    return `https://${host}`;
  }

  // Production fallback
  return "https://loopdesk-production.up.railway.app";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/auth/reset-complete";

  // Get the correct origin for redirects
  const origin = getOrigin(request);
  console.log("[Auth Callback] Origin:", origin, "request.url:", request.url);

  if (!code) {
    // No code provided - redirect to forgot password
    return NextResponse.redirect(new URL("/auth/forgot-password", origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Auth Callback] Supabase not configured");
    return NextResponse.redirect(
      new URL("/auth/forgot-password?error=not_configured", origin)
    );
  }

  const cookieStore = await cookies();

  // Log all cookies for debugging
  const allCookies = cookieStore.getAll();
  console.log("[Auth Callback] Available cookies:", allCookies.map(c => c.name).join(", "));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const value = cookieStore.get(name)?.value;
        console.log("[Auth Callback] Getting cookie:", name, value ? "found" : "NOT FOUND");
        return value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value,
          ...options,
          path: "/",
          secure: true,
          sameSite: "lax",
        });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value: "",
          ...options,
          path: "/",
          maxAge: 0,
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback] Error exchanging code:", error.message);
    return NextResponse.redirect(
      new URL(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  // Successfully authenticated - redirect to password reset form
  console.log("[Auth Callback] Success, redirecting to:", `${origin}${next}`);
  return NextResponse.redirect(new URL(next, origin));
}
