/**
 * Protocols Module
 *
 * Provides functionality for fetching protocol searches and analyzed protocols.
 * - ProtocolSearch: Discovered protocols from Bolagsverket
 * - ProtocolPurchase: Purchased and AI-analyzed protocols from LoopLoot
 */

export interface ProtocolSearchItem {
  id: number;
  orgNumber: string;
  companyName: string;
  companyId: string;
  latestProtocolDate: Date | null;
  protocolCount: number;
  lastSearch: Date | null;
  createdAt: Date;
}

export interface ProtocolPurchaseItem {
  id: number;
  orgNumber: string;
  companyName: string | null;
  protocolDate: Date;
  purchaseDate: Date;
  pdfUrl: string | null;
  eventType: string | null;
  aiSummary: string | null;
  aiDetails: {
    score?: number;
    severity?: string;
    confidence?: number;
    notis?: { titel?: string; sammanfattning?: string };
    faktaruta?: {
      stämmoDatum?: string;
      tid?: string;
      plats?: string;
      stämmoTyp?: string;
      händelse?: string;
      belopp?: string;
      pris_per_aktie?: string;
      nya_aktier?: string;
      utspädning?: string;
      investerare?: string[];
      personer?: string[];
    };
    signals?: string[];
    källa?: {
      typ?: string;
      bolag?: string;
      datum?: string;
      referens?: string;
    };
    artikel?: string;
    shareholderCount?: number;
    analyzedAt?: string;
  } | null;
}

export interface ProtocolSearchFilter {
  query?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  cursor?: string;
}

/**
 * Get protocol searches (discovered protocols) from database
 * These are protocols found in Bolagsverket's database for watched companies
 */
export async function getProtocolSearches(filter: ProtocolSearchFilter = {}): Promise<{
  protocolSearches: ProtocolSearchItem[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const { prisma } = await import("@/lib/db");

  const limit = filter.limit || 50;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  // Only show items with a protocol date (actual protocols found)
  where.latestProtocolDate = { not: null };

  if (filter.query) {
    where.OR = [
      { companyName: { contains: filter.query, mode: "insensitive" } },
      { orgNumber: { contains: filter.query } },
    ];
  }

  if (filter.fromDate || filter.toDate) {
    where.latestProtocolDate = { ...where.latestProtocolDate };
    if (filter.fromDate) {
      where.latestProtocolDate.gte = filter.fromDate;
    }
    if (filter.toDate) {
      where.latestProtocolDate.lte = filter.toDate;
    }
  }

  // Cursor-based pagination
  let cursorObj: { id: number } | undefined;
  if (filter.cursor) {
    cursorObj = { id: parseInt(filter.cursor, 10) };
  }

  const [searches, total] = await Promise.all([
    prisma.protocolSearch.findMany({
      where,
      orderBy: { latestProtocolDate: "desc" },
      take: limit + 1,
      cursor: cursorObj,
      skip: cursorObj ? 1 : 0,
      select: {
        id: true,
        orgNumber: true,
        companyName: true,
        companyId: true,
        latestProtocolDate: true,
        protocolCount: true,
        lastSearch: true,
        createdAt: true,
      },
    }),
    prisma.protocolSearch.count({ where }),
  ]);

  const hasMore = searches.length > limit;
  const items = hasMore ? searches.slice(0, limit) : searches;
  const nextCursor = hasMore ? String(items[items.length - 1].id) : null;

  return {
    protocolSearches: items.map((s) => ({
      ...s,
      protocolCount: s.protocolCount ? Number(s.protocolCount) : 0,
    })),
    total,
    nextCursor,
    hasMore,
  };
}

/**
 * Get analyzed protocols (purchased from Bolagsverket and AI-analyzed by LoopLoot)
 * These are protocols that have been purchased, downloaded, and analyzed for news value
 */
export async function getProtocolPurchases(filter: ProtocolSearchFilter = {}): Promise<{
  protocols: ProtocolPurchaseItem[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const { prisma } = await import("@/lib/db");

  const limit = filter.limit || 50;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (filter.query) {
    where.OR = [
      { companyName: { contains: filter.query, mode: "insensitive" } },
      { orgNumber: { contains: filter.query } },
      { aiSummary: { contains: filter.query, mode: "insensitive" } },
    ];
  }

  if (filter.fromDate || filter.toDate) {
    where.protocolDate = {};
    if (filter.fromDate) {
      where.protocolDate.gte = filter.fromDate;
    }
    if (filter.toDate) {
      where.protocolDate.lte = filter.toDate;
    }
  }

  // Cursor-based pagination
  let cursorObj: { id: number } | undefined;
  if (filter.cursor) {
    cursorObj = { id: parseInt(filter.cursor, 10) };
  }

  const [purchases, total] = await Promise.all([
    prisma.protocolPurchase.findMany({
      where,
      orderBy: { protocolDate: "desc" },
      take: limit + 1,
      cursor: cursorObj,
      skip: cursorObj ? 1 : 0,
      select: {
        id: true,
        orgNumber: true,
        companyName: true,
        protocolDate: true,
        purchaseDate: true,
        pdfUrl: true,
        eventType: true,
        aiSummary: true,
        aiDetails: true,
      },
    }),
    prisma.protocolPurchase.count({ where }),
  ]);

  const hasMore = purchases.length > limit;
  const items = hasMore ? purchases.slice(0, limit) : purchases;
  const nextCursor = hasMore ? String(items[items.length - 1].id) : null;

  return {
    protocols: items.map((p) => ({
      ...p,
      aiDetails: p.aiDetails as ProtocolPurchaseItem["aiDetails"],
    })),
    total,
    nextCursor,
    hasMore,
  };
}
