/**
 * Folo API Client
 *
 * Client for fetching feeds from shared Folo lists.
 * API documentation: https://api.folo.is
 */

import {
  FoloApiError,
  FoloApiResponse,
  FoloClientConfig,
  FoloEntry,
  FoloFeed,
  FoloList,
  FoloListData,
  ParsedFoloUrl,
} from './types';

// Re-export types for convenience
export type { FoloFeed, FoloList, FoloEntry, FoloListData };

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_CONFIG: Required<FoloClientConfig> = {
  baseUrl: 'https://api.folo.is',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  userAgent: 'LoopDesk/1.0',
};

/**
 * Regex patterns for parsing Folo URLs
 */
const URL_PATTERNS = {
  // https://app.folo.is/share/lists/{id}
  shareList: /^https?:\/\/(?:app\.)?folo\.is\/share\/lists\/(\d+)\/?$/,
  // Direct list ID (numeric string)
  listId: /^(\d+)$/,
} as const;

// =============================================================================
// Utilities
// =============================================================================

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number, baseDelay: number): number {
  // Exponential backoff with jitter: baseDelay * 2^attempt + random(0-500ms)
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 500;
  return Math.min(exponentialDelay + jitter, 30000); // Cap at 30s
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof FoloApiError) {
    // Retry on rate limits and server errors
    return error.statusCode === 429 || (error.statusCode ?? 0) >= 500;
  }
  if (error instanceof Error) {
    // Retry on network errors
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnreset') ||
      message.includes('econnrefused') ||
      message.includes('fetch failed')
    );
  }
  return false;
}

// =============================================================================
// FoloClient Class
// =============================================================================

/**
 * Client for interacting with the Folo API
 *
 * @example
 * ```typescript
 * const client = new FoloClient();
 *
 * // Fetch a list by URL
 * const listId = client.parseListUrl('https://app.folo.is/share/lists/230942183743771648');
 * if (listId) {
 *   const list = await client.fetchList(listId);
 *   console.log(`List "${list.title}" has ${list.feeds.length} feeds`);
 * }
 *
 * // Or fetch feeds directly
 * const feeds = await client.fetchListFeeds('230942183743771648');
 * ```
 */
export class FoloClient {
  private readonly config: Required<FoloClientConfig>;

  constructor(config: FoloClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ===========================================================================
  // URL Parsing
  // ===========================================================================

  /**
   * Extract list ID from a Folo URL or validate a direct ID
   *
   * @param urlOrId - Folo share URL or direct list ID
   * @returns The list ID or null if invalid
   *
   * @example
   * ```typescript
   * client.parseListUrl('https://app.folo.is/share/lists/123'); // '123'
   * client.parseListUrl('123'); // '123'
   * client.parseListUrl('invalid'); // null
   * ```
   */
  parseListUrl(urlOrId: string): string | null {
    const trimmed = urlOrId.trim();

    // Try share list URL pattern
    const shareMatch = trimmed.match(URL_PATTERNS.shareList);
    if (shareMatch) {
      return shareMatch[1];
    }

    // Try direct list ID
    const idMatch = trimmed.match(URL_PATTERNS.listId);
    if (idMatch) {
      return idMatch[1];
    }

    return null;
  }

  /**
   * Parse a Folo URL and return structured information
   *
   * @param url - Folo URL to parse
   * @returns Parsed URL info or null if invalid
   */
  parseUrl(url: string): ParsedFoloUrl | null {
    const listId = this.parseListUrl(url);
    if (listId) {
      return { listId, type: 'list' };
    }
    return null;
  }

  // ===========================================================================
  // API Methods
  // ===========================================================================

  /**
   * Fetch a list with all its feeds and recent entries
   *
   * @param listId - The list ID to fetch
   * @returns The complete list data including feeds and entries
   * @throws {FoloApiError} If the API request fails
   *
   * @example
   * ```typescript
   * const list = await client.fetchList('230942183743771648');
   * console.log(list.title); // List title
   * console.log(list.feeds); // Array of feeds
   * ```
   */
  async fetchList(listId: string): Promise<FoloList> {
    const data = await this.fetchListData(listId);
    return data.list;
  }

  /**
   * Fetch only the feeds from a list
   *
   * @param listId - The list ID to fetch feeds from
   * @returns Array of feeds in the list
   * @throws {FoloApiError} If the API request fails
   *
   * @example
   * ```typescript
   * const feeds = await client.fetchListFeeds('230942183743771648');
   * feeds.forEach(feed => {
   *   console.log(`${feed.title}: ${feed.url}`);
   * });
   * ```
   */
  async fetchListFeeds(listId: string): Promise<FoloFeed[]> {
    const data = await this.fetchListData(listId);
    return data.list.feeds;
  }

  /**
   * Fetch recent entries from a list
   *
   * @param listId - The list ID to fetch entries from
   * @returns Array of recent entries with their feed info
   * @throws {FoloApiError} If the API request fails
   */
  async fetchListEntries(listId: string): Promise<FoloEntry[]> {
    const data = await this.fetchListData(listId);
    return data.entries;
  }

  /**
   * Fetch complete list data including metadata, feeds, and entries
   *
   * @param listId - The list ID to fetch
   * @returns Complete list data
   * @throws {FoloApiError} If the API request fails
   */
  async fetchListData(listId: string): Promise<FoloListData> {
    const url = `${this.config.baseUrl}/lists?listId=${encodeURIComponent(listId)}`;
    const response = await this.fetchWithRetry<FoloApiResponse<FoloListData>>(url);

    if (response.code !== 0) {
      throw new FoloApiError(
        `API returned error code: ${response.code}`,
        response.code
      );
    }

    return response.data;
  }

  // ===========================================================================
  // Internal Methods
  // ===========================================================================

  /**
   * Perform a fetch request with retry logic
   */
  private async fetchWithRetry<T>(url: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        return await this.doFetch<T>(url);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on non-retryable errors
        if (!isRetryableError(error)) {
          throw error;
        }

        // Don't wait after the last attempt
        if (attempt < this.config.retries) {
          const delay = getRetryDelay(attempt, this.config.retryDelay);
          console.warn(
            `[FoloClient] Request failed (attempt ${attempt + 1}/${this.config.retries + 1}), ` +
            `retrying in ${Math.round(delay)}ms: ${lastError.message}`
          );
          await sleep(delay);
        }
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }

  /**
   * Perform a single fetch request
   */
  private async doFetch<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': this.config.userAgent,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new FoloApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.status
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FoloApiError(
          `Request timeout after ${this.config.timeout}ms`,
          0,
          408
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

/**
 * Default client instance with standard configuration
 */
export const foloClient = new FoloClient();

/**
 * Create a new client with custom configuration
 */
export function createFoloClient(config?: FoloClientConfig): FoloClient {
  return new FoloClient(config);
}
