/**
 * Kungörelser (Company Announcements) Module
 *
 * Provides functionality for searching and managing company announcements
 * from Bolagsverket POIT.
 */

export * from './types';
export * from './scraper';
export { proxyManager } from './proxy-manager';
export { sessionManager } from './session-manager';

import { searchAnnouncements, formatTextAsMarkdown } from './scraper';
import type { Announcement, AnnouncementFilter, SearchOptions } from './types';

/**
 * Search for announcements and optionally save to database
 */
export async function searchAndSaveAnnouncements(
  query: string,
  options: SearchOptions = {}
): Promise<Announcement[]> {
  const { prisma } = await import('@/lib/db');

  const announcements = await searchAnnouncements(query, options);

  // Save to database
  for (const announcement of announcements) {
    try {
      await prisma.announcement.upsert({
        where: { id: announcement.id },
        create: {
          id: announcement.id,
          query: announcement.query,
          reporter: announcement.reporter,
          type: announcement.type,
          subject: announcement.subject,
          pubDate: announcement.pubDate,
          publishedAt: announcement.publishedAt,
          detailText: announcement.detailText,
          fullText: announcement.fullText,
          url: announcement.url,
          orgNumber: extractOrgNumber(announcement.subject, announcement.query),
          scrapedAt: announcement.scrapedAt || new Date(),
        },
        update: {
          detailText: announcement.detailText,
          fullText: announcement.fullText,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.error(`Failed to save announcement ${announcement.id}:`, err);
    }
  }

  // Update stats
  try {
    await prisma.announcementScrapeStats.upsert({
      where: { id: 'stats' },
      create: {
        id: 'stats',
        totalSearches: 1,
        totalAnnouncements: announcements.length,
        lastSearchAt: new Date(),
      },
      update: {
        totalSearches: { increment: 1 },
        totalAnnouncements: { increment: announcements.length },
        lastSearchAt: new Date(),
      },
    });
  } catch (err) {
    console.error('Failed to update stats:', err);
  }

  return announcements;
}

/**
 * Get announcements from database
 */
export async function getAnnouncements(filter: AnnouncementFilter = {}): Promise<{
  announcements: Announcement[];
  total: number;
}> {
  const { prisma } = await import('@/lib/db');

  const where: Record<string, unknown> = {};

  if (filter.query) {
    where.OR = [
      { subject: { contains: filter.query, mode: 'insensitive' } },
      { query: { contains: filter.query, mode: 'insensitive' } },
      { detailText: { contains: filter.query, mode: 'insensitive' } },
    ];
  }

  if (filter.orgNumber) {
    where.orgNumber = filter.orgNumber;
  }

  if (filter.type) {
    where.type = filter.type;
  }

  if (filter.fromDate || filter.toDate) {
    where.publishedAt = {};
    if (filter.fromDate) {
      (where.publishedAt as Record<string, Date>).gte = filter.fromDate;
    }
    if (filter.toDate) {
      (where.publishedAt as Record<string, Date>).lte = filter.toDate;
    }
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: filter.offset || 0,
      take: filter.limit || 50,
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    announcements: announcements.map((a) => ({
      id: a.id,
      query: a.query,
      reporter: a.reporter || undefined,
      type: a.type || undefined,
      subject: a.subject,
      pubDate: a.pubDate || undefined,
      publishedAt: a.publishedAt || undefined,
      detailText: a.detailText || undefined,
      fullText: a.fullText || undefined,
      url: a.url || undefined,
      orgNumber: a.orgNumber || undefined,
      scrapedAt: a.scrapedAt,
    })),
    total,
  };
}

/**
 * Get announcement by ID
 */
export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const { prisma } = await import('@/lib/db');

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) return null;

  return {
    id: announcement.id,
    query: announcement.query,
    reporter: announcement.reporter || undefined,
    type: announcement.type || undefined,
    subject: announcement.subject,
    pubDate: announcement.pubDate || undefined,
    publishedAt: announcement.publishedAt || undefined,
    detailText: announcement.detailText || undefined,
    fullText: announcement.fullText || undefined,
    url: announcement.url || undefined,
    orgNumber: announcement.orgNumber || undefined,
    scrapedAt: announcement.scrapedAt,
  };
}

/**
 * Get announcements for a specific company
 */
export async function getCompanyAnnouncements(
  orgNumber: string
): Promise<Announcement[]> {
  const { prisma } = await import('@/lib/db');

  const announcements = await prisma.announcement.findMany({
    where: { orgNumber },
    orderBy: { publishedAt: 'desc' },
  });

  return announcements.map((a) => ({
    id: a.id,
    query: a.query,
    reporter: a.reporter || undefined,
    type: a.type || undefined,
    subject: a.subject,
    pubDate: a.pubDate || undefined,
    publishedAt: a.publishedAt || undefined,
    detailText: a.detailText || undefined,
    fullText: a.fullText || undefined,
    url: a.url || undefined,
    orgNumber: a.orgNumber || undefined,
    scrapedAt: a.scrapedAt,
  }));
}

/**
 * Get scrape statistics
 */
export async function getScrapeStats() {
  const { prisma } = await import('@/lib/db');

  const stats = await prisma.announcementScrapeStats.findUnique({
    where: { id: 'stats' },
  });

  if (!stats) {
    return {
      totalSearches: 0,
      totalAnnouncements: 0,
      lastSearchAt: null,
      captchaSolves: 0,
      errors: 0,
      isRunning: false,
      concurrentSearches: 5,
      delayMs: 3000,
    };
  }

  return {
    totalSearches: stats.totalSearches,
    totalAnnouncements: stats.totalAnnouncements,
    lastSearchAt: stats.lastSearchAt,
    captchaSolves: stats.captchaSolves,
    errors: stats.errors,
    isRunning: stats.isRunning,
    concurrentSearches: stats.concurrentSearches,
    delayMs: stats.delayMs,
  };
}

/**
 * Get unique announcement types
 */
export async function getAnnouncementTypes(): Promise<string[]> {
  const { prisma } = await import('@/lib/db');

  const types = await prisma.announcement.findMany({
    select: { type: true },
    distinct: ['type'],
    where: { type: { not: null } },
  });

  return types.map((t) => t.type).filter((t): t is string => t !== null);
}

/**
 * Extract org number from text
 */
function extractOrgNumber(subject: string, query: string): string | undefined {
  const combined = `${subject} ${query}`;
  const match = combined.match(/(\d{6}[-]?\d{4})/);
  if (match) {
    return match[1].replace('-', '');
  }
  return undefined;
}

export { formatTextAsMarkdown };
