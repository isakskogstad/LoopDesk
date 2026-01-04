import type {
  FreshRSSClientOptions,
  FeverAuthResponse,
  FeverGroupsResponse,
  FeverFeedsResponse,
  FeverItemsResponse,
  FeverUnreadResponse,
  FeverSavedResponse,
  FeverItem,
  FeverFeed,
  FeverGroup,
  GetItemsOptions,
  TransformedArticle,
  TransformedFeed,
} from "./types";

/**
 * FreshRSS Fever API Client
 *
 * Communicates with FreshRSS via the Fever API.
 * API key is MD5 hash of "username:password"
 */
export class FreshRSSClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(options?: Partial<FreshRSSClientOptions>) {
    this.baseUrl = options?.baseUrl || process.env.FRESHRSS_URL || "";
    this.apiKey = options?.apiKey || process.env.FRESHRSS_API_KEY || "";

    if (!this.baseUrl) {
      throw new Error("FreshRSS URL is required (FRESHRSS_URL)");
    }
    if (!this.apiKey) {
      throw new Error("FreshRSS API key is required (FRESHRSS_API_KEY)");
    }
  }

  /**
   * Make a request to the Fever API
   */
  private async request<T extends FeverAuthResponse>(
    params: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    const url = new URL("/api/fever.php", this.baseUrl);
    url.searchParams.set("api", "");

    // Add query params
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `api_key=${this.apiKey}`,
    });

    if (!response.ok) {
      throw new Error(`FreshRSS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.auth !== 1) {
      throw new Error("FreshRSS authentication failed. Check your API key.");
    }

    return data as T;
  }

  /**
   * Test authentication
   */
  async authenticate(): Promise<boolean> {
    try {
      const response = await this.request<FeverAuthResponse>();
      return response.auth === 1;
    } catch {
      return false;
    }
  }

  /**
   * Get all groups (categories)
   */
  async getGroups(): Promise<FeverGroup[]> {
    const response = await this.request<FeverGroupsResponse>({ groups: "" });
    return response.groups || [];
  }

  /**
   * Get all feeds
   */
  async getFeeds(): Promise<FeverFeed[]> {
    const response = await this.request<FeverFeedsResponse>({ feeds: "" });
    return response.feeds || [];
  }

  /**
   * Get feeds with their group mappings
   */
  async getFeedsWithGroups(): Promise<{
    feeds: FeverFeed[];
    groups: FeverGroup[];
    feedsGroups: { group_id: number; feed_ids: string }[];
  }> {
    const [feedsResponse, groupsResponse] = await Promise.all([
      this.request<FeverFeedsResponse>({ feeds: "" }),
      this.request<FeverGroupsResponse>({ groups: "" }),
    ]);

    return {
      feeds: feedsResponse.feeds || [],
      groups: groupsResponse.groups || [],
      feedsGroups: feedsResponse.feeds_groups || [],
    };
  }

  /**
   * Get items (articles)
   */
  async getItems(options: GetItemsOptions = {}): Promise<FeverItem[]> {
    const params: Record<string, string | number | undefined> = {
      items: "",
    };

    if (options.since_id !== undefined) {
      params.since_id = options.since_id;
    }
    if (options.max_id !== undefined) {
      params.max_id = options.max_id;
    }
    if (options.with_ids?.length) {
      params.with_ids = options.with_ids.join(",");
    }

    const response = await this.request<FeverItemsResponse>(params);
    let items = response.items || [];

    // Apply limit if specified
    if (options.limit && items.length > options.limit) {
      items = items.slice(0, options.limit);
    }

    return items;
  }

  /**
   * Get unread item IDs
   */
  async getUnreadIds(): Promise<number[]> {
    const response = await this.request<FeverUnreadResponse>({
      unread_item_ids: "",
    });
    if (!response.unread_item_ids) return [];
    return response.unread_item_ids.split(",").map(Number).filter(Boolean);
  }

  /**
   * Get saved/favorited item IDs
   */
  async getSavedIds(): Promise<number[]> {
    const response = await this.request<FeverSavedResponse>({
      saved_item_ids: "",
    });
    if (!response.saved_item_ids) return [];
    return response.saved_item_ids.split(",").map(Number).filter(Boolean);
  }

  /**
   * Mark an item as read
   */
  async markAsRead(itemId: number): Promise<void> {
    await this.request({
      mark: "item",
      as: "read",
      id: itemId,
    });
  }

  /**
   * Mark an item as unread
   */
  async markAsUnread(itemId: number): Promise<void> {
    await this.request({
      mark: "item",
      as: "unread",
      id: itemId,
    });
  }

  /**
   * Save/favorite an item
   */
  async saveItem(itemId: number): Promise<void> {
    await this.request({
      mark: "item",
      as: "saved",
      id: itemId,
    });
  }

  /**
   * Unsave/unfavorite an item
   */
  async unsaveItem(itemId: number): Promise<void> {
    await this.request({
      mark: "item",
      as: "unsaved",
      id: itemId,
    });
  }

  /**
   * Mark all items in a feed as read
   */
  async markFeedAsRead(feedId: number, before?: number): Promise<void> {
    await this.request({
      mark: "feed",
      as: "read",
      id: feedId,
      before: before,
    });
  }

  /**
   * Mark all items in a group as read
   */
  async markGroupAsRead(groupId: number, before?: number): Promise<void> {
    await this.request({
      mark: "group",
      as: "read",
      id: groupId,
      before: before,
    });
  }

  /**
   * Get new items since a specific ID
   */
  async getNewItems(sinceId: number, limit?: number): Promise<FeverItem[]> {
    return this.getItems({ since_id: sinceId, limit });
  }

  /**
   * Transform a Fever item to LoopDesk article format
   */
  transformItem(item: FeverItem, feeds: FeverFeed[]): TransformedArticle {
    const feed = feeds.find((f) => f.id === item.feed_id);

    // Strip HTML tags for description
    const description = item.html
      ? item.html
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 500)
      : null;

    return {
      externalId: String(item.id),
      freshRssId: item.id,
      feedId: String(item.feed_id),
      url: item.url,
      title: item.title,
      description,
      content: item.html || null,
      author: item.author || null,
      publishedAt: new Date(item.created_on_time * 1000),
      sourceName: feed?.title || "Unknown",
      sourceId: String(item.feed_id),
      sourceType: "rss",
      isRead: item.is_read === 1,
      isBookmarked: item.is_saved === 1,
    };
  }

  /**
   * Transform a Fever feed to LoopDesk feed format
   */
  transformFeed(feed: FeverFeed, groups: FeverGroup[], feedsGroups: { group_id: number; feed_ids: string }[]): TransformedFeed {
    // Find the group for this feed
    const feedGroup = feedsGroups.find((fg) =>
      fg.feed_ids.split(",").includes(String(feed.id))
    );
    const group = feedGroup
      ? groups.find((g) => g.id === feedGroup.group_id)
      : null;

    return {
      id: String(feed.id),
      name: feed.title,
      url: feed.url,
      siteUrl: feed.site_url,
      category: group?.title || null,
      lastUpdated: new Date(feed.last_updated_on_time * 1000),
    };
  }
}

/**
 * Create a FreshRSS client instance
 */
export function createFreshRSSClient(
  options?: Partial<FreshRSSClientOptions>
): FreshRSSClient {
  return new FreshRSSClient(options);
}

/**
 * Check if FreshRSS is configured and available
 */
export async function checkFreshRSSHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  error?: string;
}> {
  const url = process.env.FRESHRSS_URL;
  const apiKey = process.env.FRESHRSS_API_KEY;

  if (!url || !apiKey) {
    return {
      configured: false,
      connected: false,
      error: "FRESHRSS_URL or FRESHRSS_API_KEY not configured",
    };
  }

  try {
    const client = new FreshRSSClient({ baseUrl: url, apiKey });
    const authenticated = await client.authenticate();

    return {
      configured: true,
      connected: authenticated,
      error: authenticated ? undefined : "Authentication failed",
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
