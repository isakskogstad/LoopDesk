import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSources } from "@/lib/nyheter";
import { prisma } from "@/lib/db";
import { DEFAULT_FEEDS } from "@/lib/rss/client";

/**
 * GET /api/nyheter/sources
 *
 * Get all news sources (feeds) with article counts
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get local sources from database (with article counts)
    const localSources = await getSources();

    // Get configured feeds from database or use defaults
    const dbFeeds = await prisma.feed.findMany({
      where: { enabled: true },
    });

    const configuredFeeds =
      dbFeeds.length > 0
        ? dbFeeds.map((f) => ({
            id: f.id,
            name: f.name,
            url: f.url,
            category: f.category,
            color: f.color,
          }))
        : DEFAULT_FEEDS.map((f) => ({
            id: f.id,
            name: f.name,
            url: f.url,
            category: f.category || null,
            color: f.color || null,
          }));

    // Merge local article counts with feed info
    const sources = localSources.map((local) => {
      const feed = configuredFeeds.find((f) => f.id === local.sourceId);
      return {
        ...local,
        url: feed?.url,
        category: feed?.category,
        color: feed?.color,
      };
    });

    // Add configured feeds that don't have local articles yet
    const localSourceIds = new Set(localSources.map((s) => s.sourceId));
    const newSources = configuredFeeds
      .filter((f) => !localSourceIds.has(f.id))
      .map((f) => ({
        sourceId: f.id,
        sourceName: f.name,
        count: 0,
        url: f.url,
        category: f.category,
        color: f.color,
      }));

    return NextResponse.json({
      sources: [...sources, ...newSources],
      feedCount: configuredFeeds.length,
    });
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}
