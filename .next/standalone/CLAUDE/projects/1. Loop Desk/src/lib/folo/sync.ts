/**
 * Folo List Sync
 *
 * Sync feeds from Folo lists into LoopDesk.
 * Supports automatic syncing via cron jobs.
 */

import { prisma } from "@/lib/db";
import { validateFeedUrl, generateFeedId } from "@/lib/rss/validate";
import { regenerateGlobalCache } from "@/lib/nyheter";
import { foloClient } from "./client";
import type { FoloFeed } from "./types";

// =============================================================================
// Types
// =============================================================================

export interface SyncResult {
  listId: string;
  listName: string | null;
  added: number;
  updated: number;
  disabled: number;
  errors: string[];
  duration: number;
}

export interface SyncAllResult {
  results: SyncResult[];
  totalAdded: number;
  totalUpdated: number;
  totalDisabled: number;
  totalErrors: number;
  duration: number;
}

// =============================================================================
// Sync Functions
// =============================================================================

/**
 * Sync a single Folo list for a user
 *
 * @param listConfigId - The ID of the FoloListConfig to sync
 * @returns Sync result with statistics
 */
export async function syncFoloList(listConfigId: string): Promise<SyncResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  // Get list config
  const listConfig = await prisma.foloListConfig.findUnique({
    where: { id: listConfigId },
    include: { user: true },
  });

  if (!listConfig) {
    throw new Error(`FoloListConfig not found: ${listConfigId}`);
  }

  const { listId, userId, listName } = listConfig;

  console.log(
    `[folo-sync] Starting sync for list ${listId} (user: ${listConfig.user.email})`
  );

  // Fetch list from Folo API using the client
  let foloList;
  try {
    foloList = await foloClient.fetchList(listId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[folo-sync] Failed to fetch list ${listId}:`, message);
    throw new Error(`Failed to fetch Folo list: ${message}`);
  }

  const foloFeeds = foloList.feeds;
  const foloListName = foloList.title;

  // Get existing feeds for this list
  const existingFeeds = await prisma.feed.findMany({
    where: {
      userId,
      foloListId: listId,
    },
  });

  const existingFeedUrls = new Set(existingFeeds.map((f) => f.url));
  const foloFeedUrls = new Set(foloFeeds.map((f) => f.url));

  let added = 0;
  let updated = 0;
  let disabled = 0;

  // Add new feeds and update existing
  for (const foloFeed of foloFeeds) {
    if (existingFeedUrls.has(foloFeed.url)) {
      // Update existing feed
      try {
        await prisma.feed.updateMany({
          where: {
            userId,
            url: foloFeed.url,
          },
          data: {
            name: foloFeed.title,
            foloId: foloFeed.id,
            foloListId: listId,
            syncedAt: new Date(),
            enabled: true, // Re-enable if it was disabled
          },
        });
        updated++;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to update feed ${foloFeed.url}: ${message}`);
      }
    } else {
      // Add new feed
      try {
        // Validate the feed URL first
        const validation = await validateFeedUrl(foloFeed.url);

        if (!validation.valid) {
          errors.push(`Invalid feed URL ${foloFeed.url}: ${validation.error}`);
          continue;
        }

        const feedId = generateFeedId(foloFeed.title);

        await prisma.feed.create({
          data: {
            id: `${feedId}-${Date.now()}`,
            name: foloFeed.title,
            url: foloFeed.url,
            type: validation.feed?.type || "rss",
            category: "folo-sync",
            color: null,
            enabled: true,
            foloId: foloFeed.id,
            foloListId: listId,
            syncSource: "folo",
            syncedAt: new Date(),
            userId,
          },
        });
        added++;
      } catch (error) {
        // Skip duplicate URL errors
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          continue;
        }
        const message =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to add feed ${foloFeed.url}: ${message}`);
      }
    }
  }

  // Disable feeds that were removed from Folo list (don't delete)
  for (const existingFeed of existingFeeds) {
    if (!foloFeedUrls.has(existingFeed.url)) {
      try {
        await prisma.feed.update({
          where: { id: existingFeed.id },
          data: { enabled: false },
        });
        disabled++;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to disable feed ${existingFeed.url}: ${message}`);
      }
    }
  }

  // Update list config
  await prisma.foloListConfig.update({
    where: { id: listConfigId },
    data: {
      lastSyncAt: new Date(),
      feedCount: foloFeeds.length,
      listName: foloListName,
    },
  });

  const duration = Date.now() - startTime;
  console.log(
    `[folo-sync] Completed list ${listId}: +${added} ~${updated} -${disabled} (${duration}ms)`
  );

  return {
    listId,
    listName: foloListName || listName,
    added,
    updated,
    disabled,
    errors,
    duration,
  };
}

/**
 * Sync all Folo lists that have autoSync enabled
 *
 * @returns Aggregated sync results for all lists
 */
export async function syncAllFoloLists(): Promise<SyncAllResult> {
  const startTime = Date.now();

  // Get all lists with autoSync enabled
  const lists = await prisma.foloListConfig.findMany({
    where: { autoSync: true },
    include: { user: true },
  });

  console.log(`[folo-sync] Found ${lists.length} lists to sync`);

  if (lists.length === 0) {
    return {
      results: [],
      totalAdded: 0,
      totalUpdated: 0,
      totalDisabled: 0,
      totalErrors: 0,
      duration: Date.now() - startTime,
    };
  }

  const results: SyncResult[] = [];
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalDisabled = 0;
  let totalErrors = 0;

  // Sync each list (sequentially to avoid rate limiting)
  for (const list of lists) {
    try {
      const result = await syncFoloList(list.id);
      results.push(result);
      totalAdded += result.added;
      totalUpdated += result.updated;
      totalDisabled += result.disabled;
      totalErrors += result.errors.length;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[folo-sync] Error syncing list ${list.listId}:`, message);
      results.push({
        listId: list.listId,
        listName: list.listName,
        added: 0,
        updated: 0,
        disabled: 0,
        errors: [message],
        duration: 0,
      });
      totalErrors++;
    }

    // Small delay between lists to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Regenerate global feed cache if any feeds were added
  if (totalAdded > 0 || totalUpdated > 0 || totalDisabled > 0) {
    console.log("[folo-sync] Regenerating global feed cache...");
    try {
      await regenerateGlobalCache();
    } catch (error) {
      console.error("[folo-sync] Failed to regenerate cache:", error);
    }
  }

  const duration = Date.now() - startTime;
  console.log(
    `[folo-sync] All syncs complete: +${totalAdded} ~${totalUpdated} -${totalDisabled} errors:${totalErrors} (${duration}ms)`
  );

  return {
    results,
    totalAdded,
    totalUpdated,
    totalDisabled,
    totalErrors,
    duration,
  };
}

/**
 * Extract list ID from a Folo list URL
 * Wrapper around foloClient.parseListUrl for convenience
 *
 * @param url - Folo share URL or direct list ID
 * @returns The list ID or null if invalid
 */
export function extractListIdFromUrl(url: string): string | null {
  return foloClient.parseListUrl(url);
}

// Re-export types for convenience
export type { FoloFeed };
