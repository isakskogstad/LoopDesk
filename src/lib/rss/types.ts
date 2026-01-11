/**
 * RSS/Atom Feed Types
 *
 * Shared type definitions for RSS feed handling in LoopDesk.
 * Used by both client.ts and validate.ts.
 */

// Media types that can be extracted from feeds
export type MediaType = "image" | "video" | "audio" | "podcast" | "youtube" | "twitter" | "linkedin";

// Media metadata for rich display
export interface MediaInfo {
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  duration?: string;        // For video/audio (e.g., "12:34")
  width?: number;
  height?: number;
  mimeType?: string;
  embedUrl?: string;        // For embeddable content (YouTube, etc.)
  platform?: string;        // Platform name (YouTube, Spotify, etc.)
}

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
  // Enhanced media support
  mediaType?: MediaType;
  media?: MediaInfo;
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
