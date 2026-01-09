/**
 * RSS/Atom Feed Client
 *
 * Handles fetching and parsing of RSS/Atom feeds using feedsmith.
 * Supports direct RSS feeds and RSSHub routes.
 */

import { parseFeed } from "feedsmith";
import type { Rss, Atom } from "feedsmith/types";
import type { RSSItem, RSSFeed, FeedSource } from "./types";

// Re-export types for backward compatibility
export type { RSSItem, RSSFeed, FeedSource } from "./types";

// No default feeds - users add their own
export const DEFAULT_FEEDS: FeedSource[] = [];

/**
 * RSS/RSSHub Client for fetching news feeds
 */
export class RSSClient {
  private rsshubUrl: string;
  private timeout: number = 10000;
  private userAgent: string = "LoopDesk/1.0 (RSS Reader)";
  private acceptHeader: string =
    "application/rss+xml, application/atom+xml, application/xml, text/xml";

  constructor() {
    this.rsshubUrl = process.env.RSSHUB_URL || "https://rsshub.rssforever.com";
  }

  /**
   * Fetch and parse an RSS/Atom feed from URL
   */
  async fetchFeed(url: string): Promise<RSSFeed> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": this.userAgent,
          Accept: this.acceptHeader,
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      const { format, feed } = parseFeed(text);

      if (format === "atom") {
        return this.transformAtomFeed(feed as Atom.Feed<string>);
      }

      return this.transformRssFeed(feed as Rss.Feed<string>);
    } catch (error) {
      console.error(`Error fetching feed ${url}:`, error);
      throw error;
    }
  }

  /**
   * Transform feedsmith RSS feed to our format
   */
  private transformRssFeed(feed: Rss.Feed<string>): RSSFeed {
    return {
      title: feed.title || "Unknown",
      description: feed.description,
      link: feed.link,
      lastBuildDate: feed.lastBuildDate
        ? new Date(feed.lastBuildDate)
        : undefined,
      items: (feed.items || []).map((item) => this.transformRssItem(item)),
    };
  }

  /**
   * Transform feedsmith Atom feed to our format
   */
  private transformAtomFeed(feed: Atom.Feed<string>): RSSFeed {
    return {
      title: feed.title || "Unknown",
      description: feed.subtitle,
      link: feed.links?.[0]?.href,
      lastBuildDate: feed.updated ? new Date(feed.updated) : undefined,
      items: (feed.entries || []).map((entry) =>
        this.transformAtomEntry(entry)
      ),
    };
  }

  /**
   * Transform RSS item to our format
   */
  private transformRssItem(item: Rss.Item<string>): RSSItem {
    return {
      id: item.guid?.value || item.link || `${item.title}-${item.pubDate}`,
      title: item.title || "Untitled",
      link: item.link || "",
      description: item.description,
      content: item.content?.encoded || item.description,
      author: item.dc?.creators?.[0] || item.authors?.[0],
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      categories: item.categories?.map((c) => c.name).filter(Boolean),
      imageUrl: this.extractRssImageUrl(item),
    };
  }

  /**
   * Transform Atom entry to our format
   */
  private transformAtomEntry(entry: Atom.Entry<string>): RSSItem {
    return {
      id:
        entry.id ||
        entry.links?.[0]?.href ||
        `${entry.title}-${entry.updated}`,
      title: entry.title || "Untitled",
      link:
        entry.links?.find((l) => l.rel === "alternate")?.href ||
        entry.links?.[0]?.href ||
        "",
      description: entry.summary,
      content: entry.content || entry.summary,
      author: entry.authors?.[0]?.name,
      pubDate: entry.published
        ? new Date(entry.published)
        : entry.updated
          ? new Date(entry.updated)
          : new Date(),
      categories: entry.categories
        ?.map((c) => c.term)
        .filter((c): c is string => c !== undefined),
      imageUrl: this.extractAtomImageUrl(entry),
    };
  }

  /**
   * Extract image URL from RSS item
   * Checks multiple sources in priority order
   */
  private extractRssImageUrl(item: Rss.Item<string>): string | undefined {
    // 1. Media RSS content
    const mediaContent = item.media?.contents?.[0];
    if (mediaContent?.url) return mediaContent.url;

    // 2. Media RSS thumbnail
    const thumbnail = item.media?.thumbnails?.[0];
    if (thumbnail?.url) return thumbnail.url;

    // 3. Enclosure (if image type)
    const enclosure = item.enclosures?.find((e) =>
      e.type?.startsWith("image/")
    );
    if (enclosure?.url) return enclosure.url;

    // 4. iTunes image (for podcasts)
    if (item.itunes?.image) return item.itunes.image;

    // 5. Extract from content HTML
    const content = item.content?.encoded || item.description;
    if (content) {
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) return imgMatch[1];
    }

    return undefined;
  }

  /**
   * Extract image URL from Atom entry
   */
  private extractAtomImageUrl(entry: Atom.Entry<string>): string | undefined {
    // 1. Media content
    const mediaContent = entry.media?.contents?.[0];
    if (mediaContent?.url) return mediaContent.url;

    // 2. Media thumbnail
    const thumbnail = entry.media?.thumbnails?.[0];
    if (thumbnail?.url) return thumbnail.url;

    // 3. Enclosure link
    const enclosure = entry.links?.find(
      (l) => l.rel === "enclosure" && l.type?.startsWith("image/")
    );
    if (enclosure?.href) return enclosure.href;

    // 4. Extract from content HTML
    const content = entry.content || entry.summary;
    if (content) {
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) return imgMatch[1];
    }

    return undefined;
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
  async checkHealth(): Promise<{
    available: boolean;
    url: string;
    error?: string;
  }> {
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
