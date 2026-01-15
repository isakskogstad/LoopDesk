import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/feeds
 * Get all global feeds with user's ignore status
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get global feeds (userId = null)
    const feeds = await prisma.feed.findMany({
      where: {
        userId: null,
        enabled: true,
      },
      orderBy: { name: "asc" },
    });

    // Get user's ignored sources
    const ignoredSources = await prisma.ignoredSource.findMany({
      where: { userId: session.user.id },
      select: { sourceId: true },
    });
    const ignoredSourceIds = ignoredSources.map((s) => s.sourceId);

    // Add isHidden status to each feed
    const feedsWithStatus = feeds.map((feed) => ({
      ...feed,
      isHidden: ignoredSourceIds.includes(feed.id),
    }));

    return NextResponse.json({ feeds: feedsWithStatus });
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}

// POST removed - feeds are now global and managed via Supabase Dashboard
