import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { validateFeedUrl, generateFeedId } from "@/lib/rss/validate";

/**
 * GET /api/feeds
 * Get all feeds for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feeds = await prisma.feed.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ feeds });
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feeds
 * Add a new RSS feed with validation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, name, category, color } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL krävs" },
        { status: 400 }
      );
    }

    // Check if feed already exists for this user
    const existing = await prisma.feed.findFirst({
      where: {
        userId: session.user.id,
        url: url,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Du följer redan denna källa" },
        { status: 409 }
      );
    }

    // Validate the feed URL
    const validation = await validateFeedUrl(url);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Ogiltig RSS-källa" },
        { status: 400 }
      );
    }

    // Create the feed
    const feedName = name || validation.feed?.title || "Okänt flöde";
    const feedId = generateFeedId(feedName);

    const feed = await prisma.feed.create({
      data: {
        id: `${feedId}-${Date.now()}`,
        name: feedName,
        url: url,
        type: validation.feed?.type || "rss",
        category: category || null,
        color: color || null,
        enabled: true,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      feed: {
        id: feed.id,
        name: feed.name,
        url: feed.url,
        type: feed.type,
        category: feed.category,
        color: feed.color,
      },
      validation: {
        itemCount: validation.feed?.itemCount || 0,
        description: validation.feed?.description,
      },
    });
  } catch (error) {
    console.error("Error creating feed:", error);
    return NextResponse.json(
      { error: "Kunde inte lägga till källa" },
      { status: 500 }
    );
  }
}
