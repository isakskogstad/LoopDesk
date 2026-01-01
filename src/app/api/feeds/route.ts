import { NextRequest, NextResponse } from "next/server";
import { fetchItemsWithAdapter } from "@/lib/nyheter/adapters";
import { prisma, createTitleHash, checkKeywordMatches } from "@/lib/db";
import type { FeedConfig, SourceType, NewsItem } from "@/lib/nyheter/types";

// Serverless configuration
export const dynamic = "force-dynamic";
export const maxDuration = 30; // 30 seconds max for feed fetching

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// GET - Fetch items from a feed with caching
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const id = searchParams.get("id") || "unknown";
  const name = searchParams.get("name") || "Unknown Feed";
  const type = (searchParams.get("type") || "rss") as SourceType;
  const color = searchParams.get("color") || undefined;

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const config: FeedConfig = {
      id,
      name,
      url,
      type,
      color,
      enabled: true,
    };

    // Check cache first
    const cached = await prisma.feedCache.findUnique({
      where: { url },
    });

    const now = new Date();

    if (cached && cached.expiresAt > now) {
      // Return cached data
      const cachedData = JSON.parse(cached.data);
      return NextResponse.json({
        id,
        items: cachedData.items,
        lastUpdated: cached.lastFetched.toISOString(),
        cached: true,
      });
    }

    // Fetch fresh data
    const items = await fetchItemsWithAdapter(config);

    // Store in cache
    await prisma.feedCache.upsert({
      where: { url },
      create: {
        id,
        url,
        data: JSON.stringify({ items }),
        lastFetched: now,
        expiresAt: new Date(now.getTime() + CACHE_TTL_MS),
      },
      update: {
        data: JSON.stringify({ items }),
        lastFetched: now,
        expiresAt: new Date(now.getTime() + CACHE_TTL_MS),
      },
    });

    // Store articles in database for search and history
    await storeArticles(items);

    return NextResponse.json({
      id,
      items,
      lastUpdated: now.toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching feed:", error);

    // Try to return stale cache if available
    const staleCache = await prisma.feedCache.findUnique({
      where: { url },
    });

    if (staleCache) {
      const cachedData = JSON.parse(staleCache.data);
      return NextResponse.json({
        id,
        items: cachedData.items,
        lastUpdated: staleCache.lastFetched.toISOString(),
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch feed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Store articles in database
async function storeArticles(items: NewsItem[]): Promise<void> {
  for (const item of items) {
    try {
      const article = await prisma.article.upsert({
        where: { url: item.url },
        create: {
          externalId: item.id,
          url: item.url,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          publishedAt: new Date(item.publishedAt),
          sourceId: item.source.id,
          sourceName: item.source.name,
          sourceColor: item.source.color,
          sourceType: item.source.type,
          titleHash: createTitleHash(item.title),
        },
        update: {
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
        },
      });

      // Check for keyword matches
      await checkKeywordMatches(article.id, item.title, item.description || null);
    } catch (error) {
      // Ignore duplicate errors
      if (!(error instanceof Error) || !error.message.includes("Unique constraint")) {
        console.error("Error storing article:", error);
      }
    }
  }
}

// POST - Fetch items from multiple feeds
export async function POST(request: NextRequest) {
  try {
    const { feeds } = (await request.json()) as { feeds: FeedConfig[] };

    if (!feeds || !Array.isArray(feeds)) {
      return NextResponse.json(
        { error: "feeds array is required" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const items = await fetchItemsWithAdapter(feed);
          await storeArticles(items);
          return { feedId: feed.id, items, error: null };
        } catch (error) {
          return {
            feedId: feed.id,
            items: [],
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    return NextResponse.json({
      results,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
