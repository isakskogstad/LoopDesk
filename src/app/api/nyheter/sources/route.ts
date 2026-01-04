import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSources } from "@/lib/nyheter";
import { FreshRSSClient, checkFreshRSSHealth } from "@/lib/freshrss";

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

    // Get local sources from database
    const localSources = await getSources();

    // Try to get sources from FreshRSS
    let freshRssSources: {
      id: string;
      name: string;
      url: string;
      category: string | null;
    }[] = [];

    const health = await checkFreshRSSHealth();
    if (health.connected) {
      try {
        const client = new FreshRSSClient();
        const { feeds, groups, feedsGroups } = await client.getFeedsWithGroups();

        freshRssSources = feeds.map((feed) =>
          client.transformFeed(feed, groups, feedsGroups)
        );
      } catch (error) {
        console.error("Error fetching FreshRSS sources:", error);
      }
    }

    // Merge local article counts with FreshRSS feed info
    const sources = localSources.map((local) => {
      const freshRss = freshRssSources.find((f) => f.id === local.sourceId);
      return {
        ...local,
        url: freshRss?.url,
        category: freshRss?.category,
      };
    });

    // Add FreshRSS sources that don't have local articles yet
    const localSourceIds = new Set(localSources.map((s) => s.sourceId));
    const newSources = freshRssSources
      .filter((f) => !localSourceIds.has(f.id))
      .map((f) => ({
        sourceId: f.id,
        sourceName: f.name,
        count: 0,
        url: f.url,
        category: f.category,
      }));

    return NextResponse.json({
      sources: [...sources, ...newSources],
      freshRssConnected: health.connected,
    });
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}
