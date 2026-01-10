import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/auth/reset-complete";

  if (!code) {
    // No code provided - redirect to forgot password
    return NextResponse.redirect(new URL("/auth/forgot-password", request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Auth Callback] Supabase not configured");
    return NextResponse.redirect(
      new URL("/auth/forgot-password?error=not_configured", request.url)
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback] Error exchanging code:", error.message);
    return NextResponse.redirect(
      new URL(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  // Successfully authenticated - redirect to password reset form
  return NextResponse.redirect(new URL(next, request.url));
}
