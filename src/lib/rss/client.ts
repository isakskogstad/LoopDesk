import Parser from "rss-parser";

export interface RSSItem {
  id: string;
  title: string;
  link: string;
  description?: string;
  content?: string;
  author?: string;
  pubDate: Date;
  categories?: string[];
  imageUrl?: string;
}

export interface RSSFeed {
  title: string;
  description?: string;
  link?: string;
  items: RSSItem[];
  lastBuildDate?: Date;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: "rss" | "rsshub" | "atom";
  category?: string;
  color?: string;
}

// No default feeds - users add their own
export const DEFAULT_FEEDS: FeedSource[] = [];

/**
 * RSS/RSSHub Client for fetching news feeds
 */
export class RSSClient {
  private parser: Parser;
  private rsshubUrl: string;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "LoopDesk/1.0 (RSS Reader)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      customFields: {
        item: [
          ["media:content", "mediaContent"],
          ["media:thumbnail", "mediaThumbnail"],
          ["enclosure", "enclosure"],
        ],
      },
    });
    this.rsshubUrl = process.env.RSSHUB_URL || "https://rsshub.rssforever.com";
  }

  /**
   * Fetch and parse an RSS feed
   */
  async fetchFeed(url: string): Promise<RSSFeed> {
    try {
      const feed = await this.parser.parseURL(url);

      return {
        title: feed.title || "Unknown",
        description: feed.description,
        link: feed.link,
        lastBuildDate: feed.lastBuildDate ? new Date(feed.lastBuildDate) : undefined,
        items: (feed.items || []).map((item) => this.transformItem(item)),
      };
    } catch (error) {
      console.error(`Error fetching feed ${url}:`, error);
      throw error;
    }
  }

  /**
   * Transform RSS parser item to our format
   */
  private transformItem(item: Parser.Item): RSSItem {
    // Extract image URL from various possible sources
    let imageUrl: string | undefined;

    // Custom fields from RSS parser (cast via unknown for type safety)
    const itemAny = item as unknown as Record<string, unknown>;

    // Check media:content
    const mediaContent = itemAny.mediaContent as { $?: { url?: string } } | undefined;
    if (mediaContent?.$?.url) {
      imageUrl = mediaContent.$.url;
    }

    // Check media:thumbnail
    const mediaThumbnail = itemAny.mediaThumbnail as { $?: { url?: string } } | undefined;
    if (!imageUrl && mediaThumbnail?.$?.url) {
      imageUrl = mediaThumbnail.$.url;
    }

    // Check enclosure
    const enclosure = itemAny.enclosure as { url?: string; type?: string } | undefined;
    if (!imageUrl && enclosure?.url && enclosure.type?.startsWith("image/")) {
      imageUrl = enclosure.url;
    }

    // Try to extract from content
    if (!imageUrl && item.content) {
      const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }

    return {
      id: item.guid || item.link || `${item.title}-${item.pubDate}`,
      title: item.title || "Untitled",
      link: item.link || "",
      description: item.contentSnippet || item.summary,
      content: item.content || (itemAny["content:encoded"] as string | undefined),
      author: item.creator || (itemAny.author as string | undefined),
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      categories: item.categories,
      imageUrl,
    };
  }

  /**
   * Fetch from RSSHub
   * RSSHub provides RSS feeds for various social platforms
   */
  async fetchRSSHub(route: string): Promise<RSSFeed> {
    const url = `${this.rsshubUrl}${route.startsWith("/") ? route : "/" + route}`;
    return this.fetchFeed(url);
  }

  /**
   * Fetch Twitter/X feed via RSSHub
   */
  async fetchTwitterUser(username: string): Promise<RSSFeed> {
    return this.fetchRSSHub(`/twitter/user/${username}`);
  }

  /**
   * Fetch LinkedIn company feed via RSSHub
   */
  async fetchLinkedInCompany(companyId: string): Promise<RSSFeed> {
    return this.fetchRSSHub(`/linkedin/company/${companyId}`);
  }

  /**
   * Fetch YouTube channel via RSSHub
   */
  async fetchYouTubeChannel(channelId: string): Promise<RSSFeed> {
    return this.fetchRSSHub(`/youtube/channel/${channelId}`);
  }

  /**
   * Fetch multiple feeds concurrently
   */
  async fetchMultiple(sources: FeedSource[]): Promise<Map<string, RSSFeed>> {
    const results = new Map<string, RSSFeed>();

    await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const feed = await this.fetchFeed(source.url);
          results.set(source.id, feed);
        } catch (error) {
          console.error(`Failed to fetch ${source.name}:`, error);
        }
      })
    );

    return results;
  }

  /**
   * Check if RSSHub is available
   */
  async checkHealth(): Promise<{ available: boolean; url: string; error?: string }> {
    try {
      const response = await fetch(this.rsshubUrl, { method: "HEAD" });
      return {
        available: response.ok,
        url: this.rsshubUrl,
      };
    } catch (error) {
      return {
        available: false,
        url: this.rsshubUrl,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Create RSS client instance
 */
export function createRSSClient(): RSSClient {
  return new RSSClient();
}
