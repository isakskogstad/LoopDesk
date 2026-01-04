import { prisma } from "@/lib/db";
import { createTitleHash, checkKeywordMatches } from "@/lib/db";
import { FreshRSSClient } from "@/lib/freshrss";
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
 * Get unique sources from articles
 */
export async function getSources(): Promise<
  { sourceId: string; sourceName: string; count: number }[]
> {
  const sources = await prisma.article.groupBy({
    by: ["sourceId", "sourceName"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
  });

  return sources.map((s) => ({
    sourceId: s.sourceId,
    sourceName: s.sourceName,
    count: s._count.id,
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
 * Sync articles from FreshRSS
 */
export async function syncFromFreshRSS(): Promise<SyncResult> {
  const client = new FreshRSSClient();

  // Get sync state
  let syncState = await prisma.syncState.findUnique({
    where: { id: "freshrss" },
  });

  if (!syncState) {
    syncState = await prisma.syncState.create({
      data: { id: "freshrss" },
    });
  }

  // Get feeds for source names
  const feeds = await client.getFeeds();

  // Get new items since last sync
  const items = await client.getNewItems(syncState.lastItemId, 500);

  let synced = 0;
  let errors = 0;
  let lastItemId = syncState.lastItemId;

  for (const item of items) {
    try {
      const transformed = client.transformItem(item, feeds);

      // Create title hash for deduplication
      const titleHash = createTitleHash(transformed.title);

      // Upsert article
      const article = await prisma.article.upsert({
        where: { url: transformed.url },
        update: {
          isRead: transformed.isRead,
          isBookmarked: transformed.isBookmarked,
        },
        create: {
          externalId: transformed.externalId,
          freshRssId: transformed.freshRssId,
          feedId: transformed.feedId,
          url: transformed.url,
          title: transformed.title,
          description: transformed.description,
          content: transformed.content,
          author: transformed.author,
          publishedAt: transformed.publishedAt,
          sourceName: transformed.sourceName,
          sourceId: transformed.sourceId,
          sourceType: transformed.sourceType,
          titleHash,
          isRead: transformed.isRead,
          isBookmarked: transformed.isBookmarked,
        },
      });

      // Check keyword matches
      await checkKeywordMatches(article.id, article.title, article.description);

      synced++;
      lastItemId = Math.max(lastItemId, item.id);
    } catch (error) {
      console.error(`Error syncing item ${item.id}:`, error);
      errors++;
    }
  }

  // Update sync state
  await prisma.syncState.update({
    where: { id: "freshrss" },
    data: {
      lastItemId,
      lastSyncAt: new Date(),
      totalSynced: { increment: synced },
      errorCount: errors > 0 ? { increment: errors } : undefined,
      lastError: errors > 0 ? `${errors} errors during sync` : null,
    },
  });

  // Regenerate global feed cache
  await regenerateGlobalCache();

  return { synced, errors, lastItemId };
}

/**
 * Regenerate the global feed cache
 */
export async function regenerateGlobalCache(): Promise<void> {
  // Get latest 500 articles
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
