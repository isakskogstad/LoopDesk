/**
 * Kungörelser Scheduler - Optimized for 1210+ companies
 *
 * Features:
 * - Parallel processing (3 concurrent)
 * - Smart cache invalidation (24h stale threshold)
 * - Priority ordering (oldest scraped first)
 * - Circuit breaker pattern
 * - Database-persisted state for Railway restarts
 */

import { prisma } from '@/lib/db';
import { searchAndSaveAnnouncements } from './index';

// Configuration limits
const LIMITS = {
  SCRAPER_TIMEOUT_MS: 5 * 60 * 1000,           // 5 min max per scrape
  SCHEDULE_MAX_RUNTIME_MS: 8 * 60 * 60 * 1000, // 8 hours max for scheduled runs
  MAX_CONSECUTIVE_FAILURES: 10,                 // Circuit breaker threshold
  CACHE_STALE_HOURS: 24,                        // Re-scrape if cache older than this
  SCHEDULE_CONCURRENCY: 3,                      // Process multiple companies in parallel
  DELAY_BETWEEN_COMPANIES_MS: 1500,             // 1.5 sec delay
  DELAY_BETWEEN_BATCHES_MS: 30000,              // 30 sec between batches
};

// Schedule intervals in milliseconds
const INTERVALS: Record<string, number> = {
  hourly: 60 * 60 * 1000,
  every2h: 2 * 60 * 60 * 1000,
  every4h: 4 * 60 * 60 * 1000,
  every6h: 6 * 60 * 60 * 1000,
  every8h: 8 * 60 * 60 * 1000,
  every12h: 12 * 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

// In-memory state (resets on restart, but DB state is persistent)
let scheduleTimer: NodeJS.Timeout | null = null;
let isRunning = false;
let shouldStop = false;
let runProgress = {
  currentBatch: 0,
  totalBatches: 0,
  companiesProcessed: 0,
  companiesSkipped: 0,
  newAnnouncementsFound: 0,
  startTime: null as Date | null,
  consecutiveFailures: 0,
};

export interface ScheduleState {
  enabled: boolean;
  interval: string;
  lastRun: Date | null;
  nextRun: Date | null;
  isRunning: boolean;
  currentBatch: number;
  totalBatches: number;
  companiesProcessed: number;
  companiesSkipped: number;
  newAnnouncementsFound: number;
  estimatedTimeRemaining: number | null;
}

/**
 * Get schedule state from database
 */
export async function getScheduleState(): Promise<ScheduleState> {
  const stats = await prisma.announcementScrapeStats.findUnique({
    where: { id: 'stats' },
  });

  const now = new Date();
  const interval = stats?.delayMs ? getIntervalName(stats.delayMs) : 'daily';
  const intervalMs = INTERVALS[interval] || INTERVALS.daily;
  const nextRun = stats?.lastSearchAt
    ? new Date(stats.lastSearchAt.getTime() + intervalMs)
    : null;

  // Calculate estimated time remaining
  let estimatedTimeRemaining: number | null = null;
  if (isRunning && runProgress.startTime && runProgress.companiesProcessed > 0) {
    const elapsedMs = now.getTime() - runProgress.startTime.getTime();
    const avgTimePerCompany = elapsedMs / runProgress.companiesProcessed;
    const remainingCompanies = (runProgress.totalBatches * LIMITS.SCHEDULE_CONCURRENCY) - runProgress.companiesProcessed;
    estimatedTimeRemaining = Math.round((avgTimePerCompany * remainingCompanies) / 60000); // minutes
  }

  return {
    enabled: stats?.isRunning ?? false,
    interval,
    lastRun: stats?.lastSearchAt ?? null,
    nextRun,
    isRunning,
    currentBatch: runProgress.currentBatch,
    totalBatches: runProgress.totalBatches,
    companiesProcessed: runProgress.companiesProcessed,
    companiesSkipped: runProgress.companiesSkipped,
    newAnnouncementsFound: runProgress.newAnnouncementsFound,
    estimatedTimeRemaining,
  };
}

/**
 * Get interval name from milliseconds
 */
function getIntervalName(ms: number): string {
  for (const [name, value] of Object.entries(INTERVALS)) {
    if (value === ms) return name;
  }
  return 'daily';
}

/**
 * Update schedule configuration
 */
export async function updateScheduleConfig(config: { enabled?: boolean; interval?: string }): Promise<ScheduleState> {
  const intervalMs = config.interval ? (INTERVALS[config.interval] || INTERVALS.daily) : undefined;

  await prisma.announcementScrapeStats.upsert({
    where: { id: 'stats' },
    create: {
      id: 'stats',
      totalSearches: 0,
      totalAnnouncements: 0,
      isRunning: config.enabled ?? false,
      delayMs: intervalMs ?? INTERVALS.daily,
    },
    update: {
      isRunning: config.enabled,
      delayMs: intervalMs,
    },
  });

  // Handle timer based on enabled state
  if (config.enabled === false) {
    stopScheduleTimer();
  } else if (config.enabled === true) {
    startScheduleTimer();
  }

  return getScheduleState();
}

/**
 * Start schedule timer
 */
function startScheduleTimer() {
  if (scheduleTimer) clearInterval(scheduleTimer);

  // Check every minute if it's time to run
  scheduleTimer = setInterval(async () => {
    try {
      const state = await getScheduleState();
      if (state.enabled && !isRunning && state.nextRun && new Date() >= state.nextRun) {
        await runScheduledScrape();
      }
    } catch (error) {
      console.error('[Scheduler] Timer check error:', error);
    }
  }, 60000);
}

/**
 * Stop schedule timer
 */
function stopScheduleTimer() {
  if (scheduleTimer) {
    clearInterval(scheduleTimer);
    scheduleTimer = null;
  }
}

/**
 * Stop current running scrape
 */
export async function stopScheduledRun(): Promise<{ success: boolean; message: string }> {
  if (!isRunning) {
    return { success: false, message: 'No scheduled run is currently running' };
  }

  shouldStop = true;
  return { success: true, message: 'Stop signal sent, will stop after current batch' };
}

/**
 * Run scheduled scrape immediately
 */
export async function runScheduledScrape(): Promise<{ success: boolean; message: string }> {
  if (isRunning) {
    return { success: false, message: 'Scheduled run already in progress' };
  }

  // Reset progress
  isRunning = true;
  shouldStop = false;
  runProgress = {
    currentBatch: 0,
    totalBatches: 0,
    companiesProcessed: 0,
    companiesSkipped: 0,
    newAnnouncementsFound: 0,
    startTime: new Date(),
    consecutiveFailures: 0,
  };

  // Run asynchronously
  runScrapeLoop().catch((error) => {
    console.error('[Scheduler] Scrape loop error:', error);
    isRunning = false;
  });

  return { success: true, message: 'Scheduled run started' };
}

/**
 * Main scrape loop - processes all watched companies
 */
async function runScrapeLoop() {
  const startTime = Date.now();
  console.log('[Scheduler] Starting scheduled run...');

  try {
    // Get watched companies ordered by last scraped (oldest first)
    const companies = await prisma.watchedCompany.findMany({
      select: {
        orgNumber: true,
        name: true,
        lastScraped: true,
      },
      orderBy: [
        { lastScraped: 'asc' },  // Oldest first (nulls first in Postgres)
        { createdAt: 'asc' },
      ],
    });

    console.log(`[Scheduler] Found ${companies.length} watched companies`);

    // Calculate batches
    const totalBatches = Math.ceil(companies.length / LIMITS.SCHEDULE_CONCURRENCY);
    runProgress.totalBatches = totalBatches;

    // Process in parallel batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      // Check stop conditions
      if (shouldStop) {
        console.log('[Scheduler] Stop requested, finishing...');
        break;
      }

      if (Date.now() - startTime > LIMITS.SCHEDULE_MAX_RUNTIME_MS) {
        console.log('[Scheduler] Max runtime reached, stopping...');
        break;
      }

      if (runProgress.consecutiveFailures >= LIMITS.MAX_CONSECUTIVE_FAILURES) {
        console.log('[Scheduler] Circuit breaker triggered, stopping...');
        break;
      }

      runProgress.currentBatch = batchIndex + 1;
      const batchStart = batchIndex * LIMITS.SCHEDULE_CONCURRENCY;
      const batchEnd = Math.min(batchStart + LIMITS.SCHEDULE_CONCURRENCY, companies.length);
      const batch = companies.slice(batchStart, batchEnd);

      console.log(`[Scheduler] Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} companies)`);

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map((company) => processCompany(company))
      );

      // Update progress based on results
      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value.skipped) {
            runProgress.companiesSkipped++;
          } else {
            runProgress.newAnnouncementsFound += result.value.newAnnouncements;
          }
          runProgress.consecutiveFailures = 0;
        } else {
          runProgress.consecutiveFailures++;
        }
        runProgress.companiesProcessed++;
      }

      // Delay between batches
      if (batchIndex < totalBatches - 1) {
        await new Promise((r) => setTimeout(r, LIMITS.DELAY_BETWEEN_BATCHES_MS));
      }
    }

    // Update stats
    await prisma.announcementScrapeStats.update({
      where: { id: 'stats' },
      data: {
        lastSearchAt: new Date(),
        totalSearches: { increment: runProgress.companiesProcessed - runProgress.companiesSkipped },
      },
    });

    console.log(`[Scheduler] Completed: ${runProgress.companiesProcessed} processed, ${runProgress.companiesSkipped} skipped, ${runProgress.newAnnouncementsFound} new announcements`);
  } finally {
    isRunning = false;
  }
}

/**
 * Process a single company
 */
async function processCompany(company: { orgNumber: string; name: string; lastScraped: Date | null }): Promise<{ skipped: boolean; newAnnouncements: number }> {
  const { orgNumber, lastScraped } = company;

  // Check if cache is fresh enough
  if (lastScraped) {
    const ageHours = (Date.now() - lastScraped.getTime()) / (1000 * 60 * 60);
    if (ageHours < LIMITS.CACHE_STALE_HOURS) {
      console.log(`[Scheduler] Skipping ${orgNumber} - cache fresh (${ageHours.toFixed(1)}h old)`);
      return { skipped: true, newAnnouncements: 0 };
    }
  }

  try {
    // Get existing announcement count
    const existingCount = await prisma.announcement.count({
      where: { orgNumber },
    });

    // Scrape with timeout
    const announcements = await Promise.race([
      searchAndSaveAnnouncements(orgNumber, { forceRefresh: true }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Scrape timeout')), LIMITS.SCRAPER_TIMEOUT_MS)
      ),
    ]);

    // Update lastScraped on WatchedCompany
    await prisma.watchedCompany.update({
      where: { orgNumber },
      data: { lastScraped: new Date() },
    });

    const newAnnouncements = Math.max(0, announcements.length - existingCount);
    console.log(`[Scheduler] ${orgNumber}: ${announcements.length} total, ${newAnnouncements} new`);

    // Small delay between companies
    await new Promise((r) => setTimeout(r, LIMITS.DELAY_BETWEEN_COMPANIES_MS));

    return { skipped: false, newAnnouncements };
  } catch (error) {
    console.error(`[Scheduler] Error scraping ${orgNumber}:`, error);
    throw error;
  }
}

/**
 * Get scheduler limits configuration
 */
export function getSchedulerLimits() {
  return {
    cacheStaleHours: LIMITS.CACHE_STALE_HOURS,
    concurrency: LIMITS.SCHEDULE_CONCURRENCY,
    maxRuntimeHours: LIMITS.SCHEDULE_MAX_RUNTIME_MS / (60 * 60 * 1000),
    delayBetweenCompaniesMs: LIMITS.DELAY_BETWEEN_COMPANIES_MS,
    delayBetweenBatchesMs: LIMITS.DELAY_BETWEEN_BATCHES_MS,
  };
}
