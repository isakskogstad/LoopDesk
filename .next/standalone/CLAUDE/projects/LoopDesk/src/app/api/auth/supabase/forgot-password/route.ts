import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const RESET_REDIRECT_URL = "https://loopdesk-production.up.railway.app/auth/callback?next=/auth/reset-complete";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-postadress krävs" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase är inte konfigurerat" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value,
            ...options,
            // Ensure cookies work across the whole site
            path: "/",
            // Use secure cookies in production
            secure: true,
            // Allow cookies to be sent with cross-site requests (needed for redirects)
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

    console.log("[Supabase Forgot Password] Sending reset email to:", email);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: RESET_REDIRECT_URL,
    });

    if (error) {
      console.error("[Supabase Forgot Password] Error:", error.message);
      // Don't reveal if email exists or not - always return success
    } else {
      console.log("[Supabase Forgot Password] Reset email sent successfully");
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Supabase Forgot Password] Unexpected error:", e);
    return NextResponse.json(
      { error: "Ett oväntat fel inträffade" },
      { status: 500 }
    );
  }
}
