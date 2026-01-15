import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleBookmark } from "@/lib/nyheter";

/**
 * POST /api/nyheter/[id]/bookmark
 *
 * Toggle bookmark status for an article
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const article = await toggleBookmark(id);

    return NextResponse.json({
      success: true,
      isBookmarked: article.isBookmarked,
    });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}
