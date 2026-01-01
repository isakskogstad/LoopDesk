import type { FeedConfig, Tag } from "@/lib/nyheter/types";

// Default feeds with various source types
export const defaultFeeds: FeedConfig[] = [
  // =============================================
  // SWEDISH NEWS (RSS)
  // =============================================
  {
    id: "di",
    name: "Dagens Industri",
    url: "https://www.di.se/rss",
    type: "rss",
    category: "business",
    color: "#e31837",
    enabled: true,
    tags: ["nyheter", "ekonomi"],
  },
  {
    id: "svd",
    name: "SvD",
    url: "https://www.svd.se/feed/articles.rss",
    type: "rss",
    category: "business",
    color: "#1a1a1a",
    enabled: true,
    tags: ["nyheter", "ekonomi"],
  },
  {
    id: "breakit",
    name: "Breakit",
    url: "https://www.breakit.se/feed/artiklar",
    type: "rss",
    category: "startup",
    color: "#ff6b35",
    enabled: true,
    tags: ["startup", "tech"],
  },
  {
    id: "dn-ekonomi",
    name: "DN Ekonomi",
    url: "https://www.dn.se/rss/ekonomi/",
    type: "rss",
    category: "business",
    color: "#0066cc",
    enabled: true,
    tags: ["nyheter", "ekonomi"],
  },

  // =============================================
  // SOCIAL MEDIA (via RSSHub)
  // =============================================
  {
    id: "twitter-example",
    name: "Twitter: @breakikiansen",
    url: "/twitter/user/breakitiasen",
    type: "twitter",
    category: "general",
    color: "#1DA1F2",
    enabled: false,
    tags: ["sociala-medier"],
    options: { username: "breakitiasen", type: "user" },
  },
  {
    id: "linkedin-microsoft",
    name: "LinkedIn: Microsoft",
    url: "/linkedin/company/microsoft/posts",
    type: "linkedin",
    category: "technology",
    color: "#0A66C2",
    enabled: false,
    tags: ["sociala-medier", "tech"],
    options: { company: "microsoft" },
  },
  {
    id: "linkedin-spotify",
    name: "LinkedIn: Spotify",
    url: "/linkedin/company/spotify/posts",
    type: "linkedin",
    category: "technology",
    color: "#1DB954",
    enabled: false,
    tags: ["sociala-medier", "tech"],
    options: { company: "spotify" },
  },
  {
    id: "instagram-natgeo",
    name: "Instagram: National Geographic",
    url: "/picuki/profile/natgeo",
    type: "instagram",
    category: "general",
    color: "#E4405F",
    enabled: false,
    tags: ["sociala-medier"],
    options: { username: "natgeo" },
  },
  {
    id: "telegram-durov",
    name: "Telegram: Durov's Channel",
    url: "/telegram/channel/durov",
    type: "telegram",
    category: "technology",
    color: "#0088CC",
    enabled: false,
    tags: ["sociala-medier", "tech"],
    options: { channel: "durov" },
  },

  // =============================================
  // YOUTUBE (via RSSHub)
  // =============================================
  {
    id: "youtube-yt-tech",
    name: "YouTube: Fireship",
    url: "UCsBjURrPoezykLs9EqgamOA",
    type: "youtube",
    category: "technology",
    color: "#FF0000",
    enabled: false,
    tags: ["tech", "video"],
    options: { channelId: "UCsBjURrPoezykLs9EqgamOA" },
  },

  // =============================================
  // REDDIT
  // =============================================
  {
    id: "reddit-tech",
    name: "r/technology",
    url: "technology",
    type: "reddit",
    category: "technology",
    color: "#FF4500",
    enabled: false,
    tags: ["tech", "reddit"],
    options: { sort: "hot" },
  },
  {
    id: "reddit-sweden",
    name: "r/sweden",
    url: "sweden",
    type: "reddit",
    category: "general",
    color: "#FF4500",
    enabled: false,
    tags: ["nyheter", "reddit"],
    options: { sort: "hot" },
  },

  // =============================================
  // GITHUB
  // =============================================
  {
    id: "github-trending",
    name: "GitHub Trending",
    url: "trending",
    type: "github",
    category: "technology",
    color: "#181717",
    enabled: false,
    tags: ["tech", "utveckling"],
    options: { type: "trending" },
  },

  // =============================================
  // MASTODON
  // =============================================
  {
    id: "mastodon-gargron",
    name: "Mastodon: @Gargron",
    url: "/mastodon/user/mastodon.social/Gargron",
    type: "mastodon",
    category: "technology",
    color: "#6364FF",
    enabled: false,
    tags: ["sociala-medier", "tech"],
    options: { instance: "mastodon.social", username: "Gargron" },
  },
];

// Default tags
export const defaultTags: Tag[] = [
  {
    id: "nyheter",
    name: "Nyheter",
    color: "#3b82f6",
    feedIds: ["di", "svd", "dn-ekonomi", "reddit-sweden"],
  },
  {
    id: "ekonomi",
    name: "Ekonomi",
    color: "#10b981",
    feedIds: ["di", "svd", "dn-ekonomi"],
  },
  {
    id: "startup",
    name: "Startup",
    color: "#f59e0b",
    feedIds: ["breakit"],
  },
  {
    id: "tech",
    name: "Tech",
    color: "#8b5cf6",
    feedIds: [
      "breakit",
      "reddit-tech",
      "linkedin-microsoft",
      "linkedin-spotify",
      "telegram-durov",
      "youtube-yt-tech",
      "github-trending",
      "mastodon-gargron",
    ],
  },
  {
    id: "sociala-medier",
    name: "Sociala Medier",
    color: "#ec4899",
    feedIds: [
      "twitter-example",
      "linkedin-microsoft",
      "linkedin-spotify",
      "instagram-natgeo",
      "telegram-durov",
      "mastodon-gargron",
    ],
  },
  {
    id: "video",
    name: "Video",
    color: "#ef4444",
    feedIds: ["youtube-yt-tech"],
  },
  {
    id: "utveckling",
    name: "Utveckling",
    color: "#06b6d4",
    feedIds: ["github-trending", "reddit-tech"],
  },
];

/**
 * Get feeds by tag
 */
export function getFeedsByTag(feeds: FeedConfig[], tagId: string): FeedConfig[] {
  return feeds.filter((feed) => feed.tags?.includes(tagId));
}

/**
 * Get enabled feeds
 */
export function getEnabledFeeds(feeds: FeedConfig[]): FeedConfig[] {
  return feeds.filter((feed) => feed.enabled);
}

/**
 * Generate a unique feed ID
 */
export function generateFeedId(): string {
  return `feed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique tag ID
 */
export function generateTagId(): string {
  return `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a social media feed config
 */
export function createSocialMediaFeed(
  platform: "twitter" | "linkedin" | "instagram" | "telegram" | "tiktok" | "mastodon",
  identifier: string,
  name: string
): FeedConfig {
  const platformConfigs: Record<string, Partial<FeedConfig>> = {
    twitter: {
      type: "twitter",
      color: "#1DA1F2",
      options: { username: identifier, type: "user" },
    },
    linkedin: {
      type: "linkedin",
      color: "#0A66C2",
      options: { company: identifier },
    },
    instagram: {
      type: "instagram",
      color: "#E4405F",
      options: { username: identifier },
    },
    telegram: {
      type: "telegram",
      color: "#0088CC",
      options: { channel: identifier },
    },
    tiktok: {
      type: "tiktok",
      color: "#000000",
      options: { username: identifier },
    },
    mastodon: {
      type: "mastodon",
      color: "#6364FF",
      options: { instance: "mastodon.social", username: identifier },
    },
  };

  const config = platformConfigs[platform];

  return {
    id: generateFeedId(),
    name,
    url: identifier,
    type: config.type as FeedConfig["type"],
    category: "general",
    color: config.color,
    enabled: true,
    tags: ["sociala-medier"],
    options: config.options,
  };
}
