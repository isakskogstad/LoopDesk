/**
 * Protocols Module
 *
 * Provides functionality for fetching protocol purchases from Bolagsverket
 * that have been analyzed by the Bolagsnotiser desktop app.
 */

export interface Protocol {
  id: number;
  orgNumber: string;
  companyName: string | null;
  protocolDate: Date;
  purchaseDate: Date;
  pdfPath: string | null;
  pdfUrl: string | null;
  eventType: string | null;
  aiSummary: string | null;
  aiDetails: Record<string, unknown> | null;
  notified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProtocolFilter {
  query?: string;
  orgNumber?: string;
  eventType?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  cursor?: string;
}

/**
 * Get protocols from database with cursor-based pagination
 */
export async function getProtocols(filter: ProtocolFilter = {}): Promise<{
  protocols: Protocol[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const { prisma } = await import("@/lib/db");

  const limit = filter.limit || 50;
  const where: Record<string, unknown> = {};

  // Only show protocols with AI analysis (interesting ones)
  where.aiSummary = { not: null };

  if (filter.query) {
    where.OR = [
      { companyName: { contains: filter.query, mode: "insensitive" } },
      { aiSummary: { contains: filter.query, mode: "insensitive" } },
    ];
  }

  if (filter.orgNumber) {
    where.orgNumber = filter.orgNumber;
  }

  if (filter.eventType) {
    where.eventType = filter.eventType;
  }

  if (filter.fromDate || filter.toDate) {
    where.protocolDate = {};
    if (filter.fromDate) {
      (where.protocolDate as Record<string, Date>).gte = filter.fromDate;
    }
    if (filter.toDate) {
      (where.protocolDate as Record<string, Date>).lte = filter.toDate;
    }
  }

  // Cursor-based pagination
  let cursorObj: { id: number } | undefined;
  if (filter.cursor) {
    cursorObj = { id: parseInt(filter.cursor, 10) };
  }

  const [protocols, total] = await Promise.all([
    prisma.protocolPurchase.findMany({
      where,
      orderBy: { protocolDate: "desc" },
      take: limit + 1, // Fetch one extra to check if there's more
      cursor: cursorObj,
      skip: cursorObj ? 1 : 0, // Skip the cursor itself
    }),
    prisma.protocolPurchase.count({ where }),
  ]);

  const hasMore = protocols.length > limit;
  const items = hasMore ? protocols.slice(0, limit) : protocols;
  const nextCursor = hasMore ? String(items[items.length - 1].id) : null;

  return {
    protocols: items as Protocol[],
    total,
    nextCursor,
    hasMore,
  };
}

/**
 * Get distinct event types from protocols
 */
export async function getProtocolEventTypes(): Promise<string[]> {
  const { prisma } = await import("@/lib/db");

  const result = await prisma.protocolPurchase.findMany({
    where: { eventType: { not: null } },
    select: { eventType: true },
    distinct: ["eventType"],
  });

  return result
    .map((r) => r.eventType)
    .filter((t): t is string => t !== null)
    .sort();
}

/**
 * Get protocol stats
 */
export async function getProtocolStats(): Promise<{
  total: number;
  analyzed: number;
  byEventType: Record<string, number>;
}> {
  const { prisma } = await import("@/lib/db");

  const [total, analyzed, eventTypeCounts] = await Promise.all([
    prisma.protocolPurchase.count(),
    prisma.protocolPurchase.count({ where: { aiSummary: { not: null } } }),
    prisma.protocolPurchase.groupBy({
      by: ["eventType"],
      _count: true,
      where: { eventType: { not: null } },
    }),
  ]);

  const byEventType: Record<string, number> = {};
  for (const item of eventTypeCounts) {
    if (item.eventType) {
      byEventType[item.eventType] = item._count;
    }
  }

  return { total, analyzed, byEventType };
}

// ==========================================
// Protocol Searches (discovered protocols)
// ==========================================

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

export interface ProtocolSearchFilter {
  query?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  cursor?: string;
}

/**
 * Get protocol searches (newly discovered protocols) from database
 * These are protocols that have been found but may not yet be analyzed
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
