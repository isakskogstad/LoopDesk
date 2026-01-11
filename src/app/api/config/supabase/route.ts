import { NextResponse } from "next/server";

/**
 * Public endpoint that returns Supabase configuration.
 * These are public values (anon key) - safe to expose.
 *
 * This enables runtime config for NEXT_PUBLIC_* variables
 * that aren't baked in at build time on Railway.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      { configured: false },
      { status: 200 }
    );
  }

  return NextResponse.json({
    configured: true,
    url,
    anonKey,
  });
}
