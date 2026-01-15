import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { validateFeedUrl, generateFeedId } from "@/lib/rss/validate";

/**
 * GET /api/platform/feeds
 * Get all platform-wide feeds (feeds without a userId)
 */
export async function GET() {
  try {
    // Platform feeds are public, but still require auth for management
    const feeds = await prisma.feed.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" },
    });

    // Get article counts per feed
    const feedsWithCounts = await Promise.all(
      feeds.map(async (feed) => {
        const count = await prisma.article.count({
          where: {
            OR: [
              { feedId: feed.id },
              { sourceId: feed.id },
              { sourceName: feed.name },
            ],
          },
        });
        return {
          id: feed.id,
          name: feed.name,
          url: feed.url,
          type: feed.type,
          category: feed.category,
          color: feed.color,
          enabled: feed.enabled,
          count,
        };
      })
    );

    return NextResponse.json({ feeds: feedsWithCounts });
  } catch (error) {
    console.error("Error fetching platform feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/feeds
 * Add a new platform-wide RSS feed (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin check here if needed
    // For now, any authenticated user can add platform feeds

    const body = await request.json();
    const { url, name, category, color } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL krävs" },
        { status: 400 }
      );
    }

    // Check if platform feed already exists
    const existing = await prisma.feed.findFirst({
      where: {
        userId: null,
        url: url,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Denna källa finns redan i plattformen" },
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

    // Create the feed without userId (platform-wide)
    const feedName = name || validation.feed?.title || "Okänt flöde";
    const feedId = generateFeedId(feedName);

    const feed = await prisma.feed.create({
      data: {
        id: `platform-${feedId}-${Date.now()}`,
        name: feedName,
        url: url,
        type: validation.feed?.type || "rss",
        category: category || null,
        color: color || null,
        enabled: true,
        userId: null, // Platform-wide feed
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
    console.error("Error creating platform feed:", error);
    return NextResponse.json(
      { error: "Kunde inte lägga till källa" },
      { status: 500 }
    );
  }
}
