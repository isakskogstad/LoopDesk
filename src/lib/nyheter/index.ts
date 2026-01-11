import { prisma } from "@/lib/db";
import { createTitleHash, checkKeywordMatches } from "@/lib/db";
import { RSSClient, DEFAULT_FEEDS, type FeedSource } from "@/lib/rss/client";
import type { Article, Prisma } from "@prisma/client";

// Types
export interface ArticleFilter {
  query?: string;
  sourceId?: string;
  category?: string;
  companyId?: string;
  fromDate?: Date;
  toDate?: Date;
  isRead?: boolean;
  isBookmarked?: boolean;
  limit?: number;
  cursor?: string;
}

export interface ArticlesResult {
  articles: Article[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SyncResult {
  synced: number;
  errors: number;
  lastItemId: number;
}

/**
 * Get articles with filtering and cursor-based pagination
 */
export async function getArticles(filter: ArticleFilter): Promise<ArticlesResult> {
  const limit = Math.min(filter.limit || 50, 100);

  const where: Prisma.ArticleWhereInput = {};

  // Text search
  if (filter.query) {
    where.OR = [
      { title: { contains: filter.query, mode: "insensitive" } },
      { description: { contains: filter.query, mode: "insensitive" } },
    ];
  }

  // Source filter
  if (filter.sourceId) {
    where.sourceId = filter.sourceId;
  }

  // Date range
  if (filter.fromDate || filter.toDate) {
    where.publishedAt = {};
    if (filter.fromDate) {
      where.publishedAt.gte = filter.fromDate;
    }
    if (filter.toDate) {
      where.publishedAt.lte = filter.toDate;
    }
  }

  // Read status
  if (filter.isRead !== undefined) {
    where.isRead = filter.isRead;
  }

  // Bookmark status
  if (filter.isBookmarked !== undefined) {
    where.isBookmarked = filter.isBookmarked;
  }

  // Company filter (via companyMatches)
  if (filter.companyId) {
    where.companyMatches = {
      some: {
        companyId: filter.companyId,
      },
    };
  }

  // Build query options
  const queryOptions: Prisma.ArticleFindManyArgs = {
    where,
    orderBy: { publishedAt: "desc" },
    take: limit + 1, // Fetch one extra to check for more
    include: {
      keywordMatches: {
        include: {
          keyword: true,
        },
      },
      companyMatches: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              orgNumber: true,
            },
          },
        },
      },
    },
  };

  // Add cursor-based pagination if cursor is provided
  if (filter.cursor) {
    queryOptions.cursor = { id: filter.cursor };
    queryOptions.skip = 1;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany(queryOptions),
    prisma.article.count({ where }),
  ]);

  const hasMore = articles.length > limit;
  const resultArticles = hasMore ? articles.slice(0, -1) : articles;
  const nextCursor = hasMore ? resultArticles[resultArticles.length - 1]?.id : null;

  return {
    articles: resultArticles,
    total,
    nextCursor,
    hasMore,
  };
}

/**
 * Get a single article by ID
 */
export async function getArticle(id: string): Promise<Article | null> {
  return prisma.article.findUnique({
    where: { id },
    include: {
      keywordMatches: {
        include: {
          keyword: true,
        },
      },
      companyMatches: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              orgNumber: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get all feeds with article counts for management
 * Returns feeds directly from Feed table, with article counts merged in
 * @param userId - Optional user ID to filter feeds by owner
 */
export async function getSources(userId?: string): Promise<
  { sourceId: string; sourceName: string; count: number; feedId: string; url: string; category?: string | null; color?: string | null }[]
> {
  // Get all feeds from database (filtered by userId if provided)
  const feeds = await prisma.feed.findMany({
    where: {
      enabled: true,
      ...(userId ? { userId } : {}),
    },
    select: {
      id: true,
      name: true,
      url: true,
      category: true,
      color: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Get article counts by feedId
  const articleCounts = await prisma.article.groupBy({
    by: ["feedId"],
    _count: {
      id: true,
    },
  });

  // Create count lookup
  const countMap = new Map(articleCounts.map(a => [a.feedId, a._count.id]));

  // Return feeds with counts
  return feeds.map((f) => ({
    sourceId: f.id,
    sourceName: f.name,
    count: countMap.get(f.id) || 0,
    feedId: f.id,  // Always use Feed.id for deletion
    url: f.url,
    category: f.category,
    color: f.color,
  }));
}

/**
 * Get article stats
 */
export async function getArticleStats(): Promise<{
  total: number;
  unread: number;
  bookmarked: number;
  today: number;
  sources: number;
}> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [total, unread, bookmarked, today, sources] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { isRead: false } }),
    prisma.article.count({ where: { isBookmarked: true } }),
    prisma.article.count({ where: { publishedAt: { gte: startOfDay } } }),
    prisma.article.groupBy({ by: ["sourceId"] }).then((r) => r.length),
  ]);

  return { total, unread, bookmarked, today, sources };
}

/**
 * Mark article as read
 */
export async function markAsRead(id: string): Promise<Article> {
  return prisma.article.update({
    where: { id },
    data: { isRead: true },
  });
}

/**
 * Toggle bookmark status
 */
export async function toggleBookmark(id: string): Promise<Article> {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw new Error("Article not found");

  return prisma.article.update({
    where: { id },
    data: { isBookmarked: !article.isBookmarked },
  });
}

/**
 * Get feed sources - either from database or defaults
 */
async function getFeedSources(): Promise<FeedSource[]> {
  // Try to get user-defined feeds from database
  const dbFeeds = await prisma.feed.findMany({
    where: { enabled: true },
  });

  if (dbFeeds.length > 0) {
    return dbFeeds.map((f) => ({
      id: f.id,
      name: f.name,
      url: f.url,
      type: f.type as "rss" | "rsshub" | "atom",
      category: f.category || undefined,
      color: f.color || undefined,
    }));
  }

  // Fall back to default feeds
  return DEFAULT_FEEDS;
}

/**
 * Sync articles from RSS feeds
 */
export async function syncFromRSS(): Promise<SyncResult> {
  const client = new RSSClient();

  // Get sync state
  let syncState = await prisma.syncState.findUnique({
    where: { id: "rss" },
  });

  if (!syncState) {
    syncState = await prisma.syncState.create({
      data: { id: "rss" },
    });
  }

  // Get feed sources
  const sources = await getFeedSources();

  let synced = 0;
  let errors = 0;

  // Fetch all feeds
  for (const source of sources) {
    try {
      const feed = await client.fetchFeed(source.url);

      for (const item of feed.items) {
        try {
          // Skip if we've already seen this article (by URL)
          const existing = await prisma.article.findUnique({
            where: { url: item.link },
            select: { id: true },
          });

          if (existing) continue;

          // Create title hash for deduplication
          const titleHash = createTitleHash(item.title);

          // Create article with media info
          const article = await prisma.article.create({
            data: {
              externalId: item.id,
              feedId: source.id,
              url: item.link,
              title: item.title,
              description: item.description?.slice(0, 1000) || null,
              content: item.content || null,
              author: item.author || null,
              imageUrl: item.imageUrl || null,
              publishedAt: item.pubDate,
              sourceName: source.name,
              sourceId: source.id,
              sourceType: source.type,
              sourceColor: source.color || null,
              titleHash,
              isRead: false,
              isBookmarked: false,
              // Enhanced media info
              mediaType: item.mediaType || null,
              mediaUrl: item.media?.url || null,
              mediaThumbnail: item.media?.thumbnailUrl || null,
              mediaDuration: item.media?.duration || null,
              mediaEmbed: item.media?.embedUrl || null,
              mediaPlatform: item.media?.platform || null,
            },
          });

          // Check keyword matches
          await checkKeywordMatches(article.id, article.title, article.description);

          synced++;
        } catch (itemError) {
          // Skip duplicate URL errors
          if (
            itemError instanceof Error &&
            itemError.message.includes("Unique constraint")
          ) {
            continue;
          }
          console.error(`Error syncing item from ${source.name}:`, itemError);
          errors++;
        }
      }
    } catch (feedError) {
      console.error(`Error fetching feed ${source.name}:`, feedError);
      errors++;
    }
  }

  // Update sync state
  await prisma.syncState.update({
    where: { id: "rss" },
    data: {
      lastSyncAt: new Date(),
      totalSynced: { increment: synced },
      errorCount: errors > 0 ? { increment: errors } : undefined,
      lastError: errors > 0 ? `${errors} errors during sync` : null,
    },
  });

  // Regenerate global feed cache
  await regenerateGlobalCache();

  return { synced, errors, lastItemId: 0 };
}

/**
 * Sync articles from FreshRSS (deprecated - use syncFromRSS)
 * @deprecated
 */
export async function syncFromFreshRSS(): Promise<SyncResult> {
  return syncFromRSS();
}

/**
 * Regenerate the global feed cache
 */
export async function regenerateGlobalCache(): Promise<void> {
  // Get latest 500 articles with media info
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    take: 500,
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
      imageUrl: true,
      publishedAt: true,
      sourceName: true,
      sourceId: true,
      sourceType: true,
      sourceColor: true,
      isRead: true,
      isBookmarked: true,
      // Media fields
      mediaType: true,
      mediaUrl: true,
      mediaThumbnail: true,
      mediaDuration: true,
      mediaEmbed: true,
      mediaPlatform: true,
    },
  });

  // Get unique source count
  const sourceCount = new Set(articles.map((a) => a.sourceId)).size;

  // Upsert global cache
  await prisma.globalFeedCache.upsert({
    where: { id: "global" },
    update: {
      items: JSON.stringify(articles),
      itemCount: articles.length,
      sourceCount,
      lastUpdated: new Date(),
    },
    create: {
      id: "global",
      items: JSON.stringify(articles),
      itemCount: articles.length,
      sourceCount,
      lastUpdated: new Date(),
    },
  });
}

/**
 * Get articles from global cache (fast path)
 */
export async function getGlobalFeed(): Promise<{
  items: Partial<Article>[];
  itemCount: number;
  sourceCount: number;
  lastUpdated: Date;
} | null> {
  const cache = await prisma.globalFeedCache.findUnique({
    where: { id: "global" },
  });

  if (!cache) return null;

  return {
    items: JSON.parse(cache.items),
    itemCount: cache.itemCount,
    sourceCount: cache.sourceCount,
    lastUpdated: cache.lastUpdated,
  };
}

/**
 * Get sync state
 */
export async function getSyncState() {
  return prisma.syncState.findUnique({
    where: { id: "freshrss" },
  });
}
