/**
 * Folo API Client
 *
 * Client for fetching feeds from shared Folo lists (app.folo.is).
 *
 * @example
 * ```typescript
 * import { foloClient } from '@/lib/folo';
 *
 * // Parse a share URL
 * const listId = foloClient.parseListUrl('https://app.folo.is/share/lists/123');
 *
 * // Fetch the list
 * const list = await foloClient.fetchList(listId);
 * console.log(list.title, list.feeds);
 *
 * // Or just get the feeds
 * const feeds = await foloClient.fetchListFeeds('123');
 * ```
 */

// Types
export type {
  FoloApiResponse,
  FoloAttachment,
  FoloClientConfig,
  FoloEntry,
  FoloFeed,
  FoloList,
  FoloListData,
  FoloMedia,
  FoloOwner,
  ParsedFoloUrl,
} from './types';

export { FoloApiError, FoloErrorCode } from './types';

// Client
export { FoloClient, createFoloClient, foloClient } from './client';

// Sync
export {
  syncFoloList,
  syncAllFoloLists,
  extractListIdFromUrl,
  type SyncResult,
  type SyncAllResult,
} from './sync';
