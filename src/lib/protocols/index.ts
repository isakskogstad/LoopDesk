/**
 * Protocols Module
 *
 * Provides functionality for fetching protocol searches from Bolagsverket.
 * Uses the protocol_searches table which tracks discovered protocols.
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
