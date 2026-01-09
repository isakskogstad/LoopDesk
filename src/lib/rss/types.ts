/**
 * RSS/Atom Feed Types
 *
 * Shared type definitions for RSS feed handling in LoopDesk.
 * Used by both client.ts and validate.ts.
 */

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

export interface FeedValidationResult {
  valid: boolean;
  error?: string;
  feed?: {
    title: string;
    description?: string;
    type: "rss" | "atom";
    itemCount: number;
    lastBuildDate?: Date;
  };
}
