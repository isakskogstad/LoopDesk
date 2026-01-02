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
    name: "Anton Osika (Lovable)",
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
  {
    id: "dagens-etc",
    name: "Dagens ETC",
    url: "https://www.etc.se/rss.xml",
    type: "rss",
    category: "science",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "klimat"],
  },
  {
    id: "svt-nyheter",
    name: "SVT Nyheter",
    url: "https://www.svt.se/rss.xml",
    type: "rss",
    category: "science",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "klimat"],
  },
  {
    id: "affarsvarlden",
    name: "Affärsvärlden",
    url: "https://feed.pod.space/affarsvarldenanalys",
    type: "rss",
    category: "business",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "ekonomi", "podcast"],
  },
  {
    id: "miljo--utveckling",
    name: "Miljö & Utveckling",
    url: "https://miljo-utveckling.se/feed/",
    type: "rss",
    category: "business",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "ekonomi"],
  },
  {
    id: "dagens-media",
    name: "Dagens Media",
    url: "https://www.dagensmedia.se/feed/",
    type: "rss",
    category: "entertainment",
    color: "#666666",
    enabled: true,
    tags: ["nyheter"],
  },
  {
    id: "aktuell-energi",
    name: "Aktuell Energi",
    url: "https://aktuellenergi.se/feed/",
    type: "rss",
    category: "science",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "klimat"],
  },
  {
    id: "energinyheter",
    name: "ENERGInyheter",
    url: "https://www.energinyheter.se/rss",
    type: "rss",
    category: "science",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "klimat"],
  },
  {
    id: "sifted-climate",
    name: "Sifted Climate",
    url: "https://sifted.eu/sector/climate-tech/feed/",
    type: "rss",
    category: "startup",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "startup"],
  },
  {
    id: "tech-funding-news",
    name: "Tech Funding News",
    url: "https://techfundingnews.com/feed/",
    type: "rss",
    category: "startup",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "startup"],
  },
  {
    id: "nextbillion",
    name: "NextBillion",
    url: "https://nextbillion.net/feed/",
    type: "rss",
    category: "business",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "ekonomi"],
  },
  {
    id: "inside-climate-news",
    name: "Inside Climate News",
    url: "https://insideclimatenews.org/feed/",
    type: "rss",
    category: "science",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "klimat"],
  },
  {
    id: "greenbiz",
    name: "GreenBiz",
    url: "https://www.greenbiz.com/rss/all",
    type: "rss",
    category: "science",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "klimat"],
  },
  {
    id: "klimatpodden",
    name: "Klimatpodden",
    url: "https://feeds.soundcloud.com/users/soundcloud:users:172102448/sounds.rss",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "breakit-podcast",
    name: "Breakit Podcast",
    url: "https://rss.acast.com/breakit-daily",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "affarsvarlden-analys",
    name: "Affärsvärlden Analys",
    url: "https://feed.pod.space/affarsvarldenanalys",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "affarsvarlden-magasinet",
    name: "Affärsvärlden Magasinet",
    url: "https://feed.pod.space/affarsvarldenmagasin",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "finansieringspodden",
    name: "Finansieringspodden",
    url: "https://anchor.fm/s/eac7e8c8/podcast/rss",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech"],
  },
  {
    id: "forvarvspodden",
    name: "Förvärvspodden",
    url: "https://anchor.fm/s/e78646a0/podcast/rss",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech"],
  },
  {
    id: "i-huvudet-pa-en-entreprenor",
    name: "I huvudet på en entreprenör",
    url: "https://feeds.acast.com/public/shows/5ef2159aff817105aac33b06",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech", "podcast"],
  },
  {
    id: "svd-tech-brief",
    name: "SvD Tech Brief",
    url: "https://podcast.stream.schibsted.media/svd/267316224?podcast",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech"],
  },
  {
    id: "techskaparna",
    name: "Techskaparna",
    url: "https://feed.podbean.com/techskaparna/feed.xml",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech", "podcast"],
  },
  {
    id: "heja-framtiden",
    name: "Heja Framtiden",
    url: "https://anchor.fm/s/4a2d6bcc/podcast/rss",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech"],
  },
  {
    id: "impact-10x",
    name: "Impact 10x",
    url: "https://feeds.captivate.fm/impact-10x/",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech"],
  },
  {
    id: "det-var-en-gang-en-startup",
    name: "Det var en gång en startup",
    url: "https://anchor.fm/s/430cca54/podcast/rss",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech"],
  },
  {
    id: "techrekpodden",
    name: "Techrekpodden",
    url: "https://rss.libsyn.com/shows/113950/destinations/642089.xml",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech", "podcast"],
  },
  {
    id: "the-saasiest-podcast",
    name: "The SaaSiest Podcast",
    url: "https://feed.podbean.com/saasnordic/feed.xml",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech", "podcast"],
  },
  {
    id: "levler",
    name: "Levler",
    url: "https://rss.buzzsprout.com/2043569.rss",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech", "podcast"],
  },
  {
    id: "euvc-the-european-vc",
    name: "EUVC (The European VC)",
    url: "https://anchor.fm/s/108357574/podcast/rss",
    type: "rss",
    category: "technology",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "tech"],
  },
  {
    id: "framgangspodden",
    name: "Framgångspodden",
    url: "https://feeds.acast.com/public/shows/61d557da47aaaf00131bbbb2",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "investerarens-podcast",
    name: "Investerarens Podcast",
    url: "https://feeds.soundcloud.com/users/soundcloud:users:353209343/sounds.rss",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "rikatillsammans",
    name: "RikaTillsammans",
    url: "https://feeds.acast.com/public/shows/639fd050ca72510011cc7692",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "aktiesnack",
    name: "Aktiesnack",
    url: "https://feeds.acast.com/public/shows/6298bb4969dd1e001299c059",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "kvalitetsaktiepodden",
    name: "Kvalitetsaktiepodden",
    url: "https://feeds.acast.com/public/shows/60c356060f75f600192eac7f",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "game-of-stocks",
    name: "Game of Stocks",
    url: "https://feeds.acast.com/public/shows/fceaade8-cb09-4b94-9138-385e59475fcb",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "podcast"],
  },
  {
    id: "inevitable-fd-my-climate-journey",
    name: "Inevitable (f.d. My Climate Journey)",
    url: "https://feeds.simplecast.com/XFfCG1w8",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter"],
  },
  {
    id: "climate-tech-vc",
    name: "Climate Tech VC",
    url: "https://anchor.fm/s/aafc565c/podcast/rss",
    type: "rss",
    category: "other",
    color: "#666666",
    enabled: true,
    tags: ["nyheter"],
  },
  {
    id: "impactalpha",
    name: "ImpactAlpha",
    url: "https://impactalpha.com/feed/",
    type: "rss",
    category: "business",
    color: "#666666",
    enabled: true,
    tags: ["nyheter", "ekonomi"],
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
