import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateFeedUrl } from "@/lib/rss/validate";

/**
 * POST /api/feeds/validate
 * Validate an RSS feed URL without saving it
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { valid: false, error: "URL krävs" },
        { status: 400 }
      );
    }

    const result = await validateFeedUrl(url);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error validating feed:", error);
    return NextResponse.json(
      { valid: false, error: "Kunde inte validera flödet" },
      { status: 500 }
    );
  }
}
