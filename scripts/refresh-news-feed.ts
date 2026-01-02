
import { prisma, createTitleHash } from "../src/lib/db";
import { fetchItemsWithAdapter } from "../src/lib/nyheter/adapters";
import { defaultFeeds } from "../src/lib/nyheter/feeds";
import type { NewsItem } from "../src/lib/nyheter/types";

async function refreshFeeds() {
  const startTime = Date.now();
  console.log("Starting feed refresh...");

  try {
    // Get all enabled feeds (default + user feeds from DB)
    const enabledDefaultFeeds = defaultFeeds.filter(f => f.enabled);
    const userFeeds = await prisma.feed.findMany({
      where: { enabled: true },
    });

    // Combine feeds, avoiding duplicates by URL
    const seenUrls = new Set<string>();
    const allFeeds = [...enabledDefaultFeeds, ...userFeeds].filter(feed => {
      if (seenUrls.has(feed.url)) return false;
      seenUrls.add(feed.url);
      return true;
    });

    console.log(`Refreshing ${allFeeds.length} feeds...`);

    // Fetch all feeds in parallel (with concurrency limit)
    const CONCURRENCY = 5;
    const allItems: NewsItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < allFeeds.length; i += CONCURRENCY) {
      const batch = allFeeds.slice(i, i + CONCURRENCY);
      console.log(`Processing batch ${i / CONCURRENCY + 1}...`);
      
      const results = await Promise.allSettled(
        batch.map(async (feed) => {
          try {
            console.log(`Fetching ${feed.name}...`);
            const items = await fetchItemsWithAdapter({
              id: feed.id,
              name: feed.name,
              url: feed.url,
              type: feed.type as any,
              color: feed.color || undefined,
              enabled: true,
            });
            return items;
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error fetching ${feed.name}: ${msg}`);
            errors.push(`${feed.name}: ${msg}`);
            return [];
          }
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          allItems.push(...result.value);
        }
      }
    }

    // Deduplicate items by URL and similar titles
    const seenItemUrls = new Set<string>();
    const seenTitles = new Set<string>();
    const uniqueItems: NewsItem[] = [];

    for (const item of allItems) {
      // Skip items without proper title
      if (!item.title || item.title === "Ingen titel" || item.title.trim().length < 5) {
        continue;
      }
      if (!item.url) continue;

      const normalizedUrl = item.url.toLowerCase().replace(/\/$/, "");
      if (seenItemUrls.has(normalizedUrl)) continue;
      seenItemUrls.add(normalizedUrl);

      const normalizedTitle = item.title.toLowerCase().replace(/[^\w\s]/g, "").trim();
      if (seenTitles.has(normalizedTitle)) continue;
      seenTitles.add(normalizedTitle);

      uniqueItems.push(item);
    }

    // Filter to last week and sort by date
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sortedItems = uniqueItems
      .filter(item => new Date(item.publishedAt) >= oneWeekAgo)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    console.log(`Found ${sortedItems.length} unique items.`);

    // Batch insert articles into database (for search/history)
    const articlesToInsert = sortedItems.slice(0, 500).map(item => ({
      id: `art_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      externalId: item.id,
      url: item.url,
      title: item.title,
      description: item.description || null,
      imageUrl: item.imageUrl || null,
      publishedAt: new Date(item.publishedAt),
      sourceId: item.source.id,
      sourceName: item.source.name,
      sourceColor: item.source.color || null,
      sourceType: item.source.type,
      titleHash: createTitleHash(item.title),
    }));

    // Use createMany with skipDuplicates for efficient batch insert
    if (articlesToInsert.length > 0) {
      await prisma.article.createMany({
        data: articlesToInsert,
        skipDuplicates: true,
      });
      console.log(`Stored ${articlesToInsert.length} articles in database.`);
    }

    // Update GlobalFeedCache with pre-computed feed
    const now = new Date();
    const feedCacheData = sortedItems.slice(0, 200); // Keep top 200 for instant serving

    await prisma.globalFeedCache.upsert({
      where: { id: "global" },
      create: {
        id: "global",
        items: JSON.stringify(feedCacheData),
        itemCount: sortedItems.length,
        sourceCount: allFeeds.length,
        lastUpdated: now,
      },
      update: {
        items: JSON.stringify(feedCacheData),
        itemCount: sortedItems.length,
        sourceCount: allFeeds.length,
        lastUpdated: now,
      },
    });

    // Also update individual feed caches
    const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
    for (const feed of allFeeds) {
      const feedItems = sortedItems.filter(item => item.source.id === feed.id);
      if (feedItems.length > 0) {
        await prisma.feedCache.upsert({
          where: { url: feed.url },
          create: {
            id: feed.id,
            url: feed.url,
            data: JSON.stringify({ items: feedItems }),
            lastFetched: now,
            expiresAt: new Date(now.getTime() + CACHE_TTL_MS),
          },
          update: {
            data: JSON.stringify({ items: feedItems }),
            lastFetched: now,
            expiresAt: new Date(now.getTime() + CACHE_TTL_MS),
          },
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Completed in ${duration}ms.`);
    
    if (errors.length > 0) {
      console.log(`Encountered ${errors.length} errors:`);
      errors.forEach(e => console.log(`- ${e}`));
    }

  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

refreshFeeds();
