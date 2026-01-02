import type { FeedConfig, Tag } from "@/lib/nyheter/types";

// Default feeds with various source types
export const defaultFeeds: FeedConfig[] = [
  // =============================================
  // SWEDISH NEWS (RSS) - Verified working feeds
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
    name: "Svenska Dagbladet",
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
    id: "dn",
    name: "Dagens Nyheter",
    url: "https://www.dn.se/rss/",
    type: "rss",
    category: "business",
    color: "#0066cc",
    enabled: true,
    tags: ["nyheter"],
  },
  {
    id: "nyteknik",
    name: "Ny Teknik",
    url: "https://www.nyteknik.se/?lab_viewport=rss",
    type: "rss",
    category: "technology",
    color: "#00A0D2",
    enabled: true,
    tags: ["tech", "nyheter"],
  },
  {
    id: "computersweden",
    name: "Computer Sweden",
    url: "https://computersweden.se/feed/",
    type: "rss",
    category: "technology",
    color: "#E91E63",
    enabled: true,
    tags: ["tech", "it"],
  },
  {
    id: "realtid",
    name: "Realtid",
    url: "https://www.realtid.se/feed",
    type: "rss",
    category: "business",
    color: "#1E3A5F",
    enabled: true,
    tags: ["ekonomi", "finans"],
  },
  {
    id: "tn",
    name: "Tidningen Näringsliv",
    url: "https://www.tn.se/feed/",
    type: "rss",
    category: "business",
    color: "#333333",
    enabled: true,
    tags: ["näringsliv", "ekonomi"],
  },

  // =============================================
  // EUROPEAN STARTUP NEWS (RSS)
  // =============================================
  {
    id: "sifted",
    name: "Sifted",
    url: "https://sifted.eu/feed",
    type: "rss",
    category: "startup",
    color: "#FF6B00",
    enabled: true,
    tags: ["startup", "europa"],
  },
  {
    id: "eu-startups",
    name: "EU-Startups",
    url: "https://www.eu-startups.com/feed/",
    type: "rss",
    category: "startup",
    color: "#1E88E5",
    enabled: true,
    tags: ["startup", "europa"],
  },
  {
    id: "arcticstartup",
    name: "ArcticStartup",
    url: "https://arcticstartup.com/feed/",
    type: "rss",
    category: "startup",
    color: "#00BCD4",
    enabled: true,
    tags: ["startup", "nordics"],
  },
  {
    id: "techfundingnews",
    name: "Tech Funding News",
    url: "https://techfundingnews.com/feed/",
    type: "rss",
    category: "startup",
    color: "#4CAF50",
    enabled: true,
    tags: ["startup", "funding"],
  },

  // =============================================
  // EVENTS & CONFERENCES
  // =============================================
  {
    id: "eventbrite-investment",
    name: "Eventbrite: Investment Conferences",
    url: "https://www.eventbrite.se/d/sweden--stockholm/investment-conference/",
    type: "eventbrite",
    category: "events",
    color: "#F05537",
    enabled: true,
    tags: ["events", "konferens", "investment"],
    options: { category: "investment" },
  },
  {
    id: "di-events",
    name: "DI Events",
    url: "https://www.di.se/event/",
    type: "di-events",
    category: "events",
    color: "#e31837",
    enabled: true,
    tags: ["events", "konferens", "di"],
  },

  // =============================================
  // SWEDISH TABLOIDS (RSS) - Optional
  // =============================================
  {
    id: "aftonbladet",
    name: "Aftonbladet",
    url: "https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/",
    type: "rss",
    category: "general",
    color: "#FFEB00",
    enabled: false,
    tags: ["nyheter"],
  },
  {
    id: "expressen",
    name: "Expressen",
    url: "https://feeds.expressen.se/nyheter",
    type: "rss",
    category: "general",
    color: "#E30613",
    enabled: false,
    tags: ["nyheter"],
  },

  // =============================================
  // SOCIAL MEDIA - Disabled by default
  // Requires Docker services for full functionality
  // =============================================

  // LinkedIn Profiles (via direct API call)
  {
    id: "linkedin-antonosika",
    name: "LinkedIn: Anton Osika",
    url: "https://www.linkedin.com/in/antonosika",
    type: "linkedin",
    category: "business",
    color: "#0A66C2",
    enabled: true,
    tags: ["sociala-medier", "startup"],
    options: { profile: "antonosika" },
  },
  {
    id: "linkedin-microsoft",
    name: "LinkedIn: Microsoft",
    url: "https://www.linkedin.com/company/microsoft",
    type: "linkedin",
    category: "technology",
    color: "#0A66C2",
    enabled: false,
    tags: ["sociala-medier", "tech"],
    options: { profile: "https://www.linkedin.com/company/microsoft" },
  },

  // Twitter/X (via twscrape or Nitter)
  {
    id: "twitter-breakit",
    name: "Twitter: @breakit",
    url: "https://twitter.com/breakit",
    type: "twitter",
    category: "startup",
    color: "#1DA1F2",
    enabled: false,
    tags: ["sociala-medier", "startup"],
    options: { username: "breakit" },
  },
  {
    id: "twitter-elonmusk",
    name: "Twitter: @elonmusk",
    url: "https://twitter.com/elonmusk",
    type: "twitter",
    category: "technology",
    color: "#1DA1F2",
    enabled: false,
    tags: ["sociala-medier", "tech"],
    options: { username: "elonmusk" },
  },

  // Facebook (via facebook-scraper)
  {
    id: "facebook-meta",
    name: "Facebook: Meta",
    url: "https://facebook.com/meta",
    type: "facebook",
    category: "technology",
    color: "#1877F2",
    enabled: false,
    tags: ["sociala-medier", "tech"],
    options: { page: "meta" },
  },

  // Instagram (via RSSHub/Picuki)
  {
    id: "instagram-natgeo",
    name: "Instagram: @natgeo",
    url: "https://instagram.com/natgeo",
    type: "instagram",
    category: "general",
    color: "#E4405F",
    enabled: false,
    tags: ["sociala-medier"],
    options: { username: "natgeo" },
  },

  // =============================================
  // REDDIT (Disabled by default)
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
  // GITHUB (Disabled by default)
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
];

// Default tags
export const defaultTags: Tag[] = [
  {
    id: "nyheter",
    name: "Nyheter",
    color: "#3b82f6",
    feedIds: ["di", "svd", "dn", "aftonbladet", "expressen", "reddit-sweden"],
  },
  {
    id: "ekonomi",
    name: "Ekonomi",
    color: "#10b981",
    feedIds: ["di", "svd", "realtid", "tn"],
  },
  {
    id: "startup",
    name: "Startup",
    color: "#f59e0b",
    feedIds: ["breakit", "sifted", "eu-startups", "arcticstartup", "techfundingnews"],
  },
  {
    id: "tech",
    name: "Tech",
    color: "#8b5cf6",
    feedIds: [
      "breakit",
      "nyteknik",
      "computersweden",
      "reddit-tech",
      "github-trending",
    ],
  },
  {
    id: "europa",
    name: "Europa",
    color: "#0ea5e9",
    feedIds: ["sifted", "eu-startups", "arcticstartup"],
  },
  {
    id: "sociala-medier",
    name: "Sociala Medier",
    color: "#ec4899",
    feedIds: ["linkedin-antonosika", "linkedin-microsoft", "twitter-breakit", "twitter-elonmusk", "facebook-meta", "instagram-natgeo"],
  },
  {
    id: "utveckling",
    name: "Utveckling",
    color: "#06b6d4",
    feedIds: ["github-trending", "reddit-tech"],
  },
  {
    id: "events",
    name: "Events & Konferenser",
    color: "#f43f5e",
    feedIds: ["eventbrite-investment", "di-events"],
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
  platform: "twitter" | "linkedin" | "instagram" | "telegram" | "tiktok" | "mastodon" | "facebook",
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
    facebook: {
      type: "facebook",
      color: "#1877F2",
      options: { page: identifier },
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
