import type { SourceAdapter, FeedConfig, NewsItem } from "@/lib/nyheter/types";
import Parser from "rss-parser";

// RSSHub instance URLs (public instances as fallback)
// Note: rsshub.app has restrictions, so we prioritize other instances
const RSSHUB_PUBLIC_INSTANCES = [
  "https://rsshub.rssforever.com",
  "https://hub.slarker.me",
  "https://rsshub.liumingye.cn",
  "https://rsshub.app", // Last resort - has rate limits
];

// Get local RSSHub URL from environment
function getLocalRSSHubUrl(): string | null {
  // Server-side: check environment variable
  if (typeof process !== "undefined" && process.env?.RSSHUB_URL) {
    return process.env.RSSHUB_URL;
  }
  return null;
}

// Get all available RSSHub instances (local first, then public)
function getRSSHubInstances(): string[] {
  const localUrl = getLocalRSSHubUrl();
  if (localUrl) {
    return [localUrl, ...RSSHUB_PUBLIC_INSTANCES];
  }
  return RSSHUB_PUBLIC_INSTANCES;
}

// Get configured RSSHub instance or use default (local preferred)
function getRSSHubInstance(config: FeedConfig): string {
  // If explicitly configured in feed options, use that
  if (config.options?.instance) {
    return config.options.instance as string;
  }
  // Otherwise prefer local, then fall back to public
  const instances = getRSSHubInstances();
  return instances[0];
}

// Get access key if configured
function getRSSHubAccessKey(): string | null {
  if (typeof process !== "undefined" && process.env?.RSSHUB_ACCESS_KEY) {
    return process.env.RSSHUB_ACCESS_KEY;
  }
  return null;
}

// RSSHub route builders for different platforms
export const rsshubRoutes = {
  // Twitter/X
  twitter: {
    user: (username: string) => `/twitter/user/${username}`,
    keyword: (keyword: string) => `/twitter/keyword/${encodeURIComponent(keyword)}`,
    list: (userId: string, listId: string) => `/twitter/list/${userId}/${listId}`,
  },

  // LinkedIn
  linkedin: {
    company: (company: string) => `/linkedin/company/${company}/posts`,
    jobs: (company: string) => `/linkedin/jobs/${company}`,
  },

  // Instagram (via Picuki for privacy)
  instagram: {
    user: (username: string) => `/picuki/profile/${username}`,
    tag: (tag: string) => `/picuki/tag/${tag}`,
  },

  // Telegram
  telegram: {
    channel: (username: string) => `/telegram/channel/${username}`,
  },

  // YouTube
  youtube: {
    user: (username: string) => `/youtube/user/@${username}`,
    channel: (channelId: string) => `/youtube/channel/${channelId}`,
    playlist: (playlistId: string) => `/youtube/playlist/${playlistId}`,
  },

  // TikTok
  tiktok: {
    user: (username: string) => `/tiktok/user/@${username}`,
    tag: (tag: string) => `/tiktok/tag/${tag}`,
  },

  // Facebook
  facebook: {
    page: (page: string) => `/facebook/page/${page}`,
    group: (group: string) => `/facebook/group/${group}`,
  },

  // Reddit
  reddit: {
    subreddit: (sub: string, sort = "hot") => `/reddit/subreddit/${sub}/${sort}`,
    user: (username: string) => `/reddit/user/${username}`,
  },

  // GitHub
  github: {
    trending: (language?: string) => `/github/trending/${language || "all"}/daily`,
    repo: (owner: string, repo: string) => `/github/repos/${owner}/${repo}`,
    user: (username: string) => `/github/user/${username}`,
    issues: (owner: string, repo: string) => `/github/issue/${owner}/${repo}`,
  },

  // Mastodon
  mastodon: {
    user: (instance: string, username: string) => `/mastodon/user/${instance}/${username}`,
    timeline: (instance: string) => `/mastodon/timeline/${instance}/public`,
  },

  // News sites
  news: {
    hackernews: {
      best: () => "/hackernews/best",
      new: () => "/hackernews/newest",
    },
    producthunt: () => "/producthunt/today",
  },
};

// Platform color mapping
const platformColors: Record<string, string> = {
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  instagram: "#E4405F",
  facebook: "#1877F2",
  telegram: "#0088CC",
  youtube: "#FF0000",
  tiktok: "#000000",
  reddit: "#FF4500",
  github: "#181717",
  mastodon: "#6364FF",
};

// Build the full RSSHub URL with optional access key
function buildRSSHubUrl(instance: string, route: string): string {
  // Remove leading slash if present
  const cleanRoute = route.startsWith("/") ? route : `/${route}`;
  let url = `${instance}${cleanRoute}`;

  // Add access key if configured and using local instance
  const accessKey = getRSSHubAccessKey();
  const localUrl = getLocalRSSHubUrl();
  if (accessKey && localUrl && instance === localUrl) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}key=${accessKey}`;
  }

  return url;
}

// Parse the RSSHub route to determine platform
function detectPlatform(route: string): string {
  const platforms = ["twitter", "linkedin", "instagram", "telegram", "youtube", "tiktok", "reddit", "github", "mastodon", "picuki"];
  for (const platform of platforms) {
    if (route.includes(platform)) {
      // picuki is Instagram
      return platform === "picuki" ? "instagram" : platform;
    }
  }
  return "rsshub";
}

export const rsshubAdapter: SourceAdapter = {
  type: "rsshub",
  name: "RSSHub",
  description: "Universal RSS feed generator for social media and websites",
  params: [
    {
      name: "route",
      label: "RSSHub Route",
      type: "text",
      required: true,
      placeholder: "/twitter/user/elonmusk",
      description: "RSSHub route path (e.g., /twitter/user/username)",
    },
    {
      name: "instance",
      label: "RSSHub Instance",
      type: "select",
      required: false,
      default: getRSSHubInstances()[0],
      options: getRSSHubInstances().map((url) => ({
        label: url.includes("localhost") ? `${url} (lokal)` : url,
        value: url,
      })),
      description: "RSSHub instance att använda (lokal föredras om tillgänglig)",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    const parser = new Parser({
      customFields: {
        item: [
          ["media:content", "mediaContent"],
          ["media:thumbnail", "mediaThumbnail"],
        ],
      },
    });

    const route = (config.options?.route as string) || config.url;
    const platform = detectPlatform(route);

    // Get instances to try (configured first, then fallbacks)
    const configuredInstance = config.options?.instance as string;
    const instances = configuredInstance
      ? [configuredInstance]
      : getRSSHubInstances();

    let lastError: Error | null = null;

    // Try each instance until one works
    for (const instance of instances) {
      const fullUrl = buildRSSHubUrl(instance, route);

      try {
        const feed = await parser.parseURL(fullUrl);

        return (feed.items || []).map((item) => {
          // Extract image from various sources
          let imageUrl: string | undefined;

          // Check media:content
          const mediaContent = item.mediaContent as { $?: { url?: string } } | undefined;
          if (mediaContent?.$?.url) {
            imageUrl = mediaContent.$.url;
          }

          // Check enclosure
          if (!imageUrl && item.enclosure?.url) {
            imageUrl = item.enclosure.url;
          }

          // Check content for images
          if (!imageUrl && item.content) {
            const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          }

          return {
            id: `rsshub-${config.id}-${item.guid || item.link || Date.now()}`,
            title: item.title || "Untitled",
            description: item.contentSnippet || item.content?.substring(0, 200),
            content: item.content,
            url: item.link || fullUrl,
            imageUrl,
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            author: item.creator || (item as unknown as Record<string, string | undefined>).author,
            source: {
              id: config.id,
              name: config.name,
              type: "rsshub",
              url: fullUrl,
              color: config.color || platformColors[platform] || "#FF6600",
            },
            category: config.category || "other",
          };
        });
      } catch (error) {
        console.warn(`RSSHub instance ${instance} failed for route ${route}:`, error);
        lastError = error as Error;
        // Continue to next instance
      }
    }

    // All instances failed - graceful degradation
    console.warn(`[RSSHub] All instances failed for route ${route}:`, lastError?.message || "Unknown error");
    // Return empty array instead of throwing to allow other feeds to continue
    return [];
  },

  validate(config: FeedConfig): boolean {
    const route = (config.options?.route as string) || config.url;
    return Boolean(route && route.startsWith("/"));
  },

  getIcon(): string {
    return "🧡";
  },
};

// Convenience adapters for specific platforms using RSSHub
export const twitterAdapter: SourceAdapter = {
  type: "twitter",
  name: "Twitter/X",
  description: "Follow Twitter/X users and keywords via RSSHub",
  params: [
    {
      name: "username",
      label: "Username",
      type: "text",
      required: true,
      placeholder: "elonmusk",
      description: "Twitter username without @",
    },
    {
      name: "type",
      label: "Feed Type",
      type: "select",
      required: false,
      default: "user",
      options: [
        { label: "User Timeline", value: "user" },
        { label: "Keyword Search", value: "keyword" },
      ],
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    // Get username from options, or extract from URL if it's a route
    let username = config.options?.username as string;
    if (!username) {
      // Check if URL is a route like /twitter/user/username
      const match = config.url.match(/\/twitter\/(?:user|keyword)\/(.+)/);
      username = match ? match[1] : config.url;
    }

    const type = (config.options?.type as string) || "user";
    const route = type === "keyword"
      ? rsshubRoutes.twitter.keyword(username)
      : rsshubRoutes.twitter.user(username);

    const hubConfig: FeedConfig = {
      ...config,
      options: { ...config.options, route },
    };

    return rsshubAdapter.fetchItems(hubConfig);
  },

  getIcon(): string {
    return "𝕏";
  },
};

export const linkedinAdapter: SourceAdapter = {
  type: "linkedin",
  name: "LinkedIn",
  description: "Follow LinkedIn company pages via RSSHub",
  params: [
    {
      name: "company",
      label: "Company Name/Slug",
      type: "text",
      required: true,
      placeholder: "microsoft",
      description: "LinkedIn company URL slug",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    let company = config.options?.company as string;
    if (!company) {
      const match = config.url.match(/\/linkedin\/company\/([^/]+)/);
      company = match ? match[1] : config.url;
    }
    const route = rsshubRoutes.linkedin.company(company);

    const hubConfig: FeedConfig = {
      ...config,
      options: { ...config.options, route },
    };

    return rsshubAdapter.fetchItems(hubConfig);
  },

  getIcon(): string {
    return "💼";
  },
};

export const instagramAdapter: SourceAdapter = {
  type: "instagram",
  name: "Instagram",
  description: "Follow Instagram profiles via Picuki (privacy-friendly)",
  params: [
    {
      name: "username",
      label: "Username",
      type: "text",
      required: true,
      placeholder: "natgeo",
      description: "Instagram username without @",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    let username = config.options?.username as string;
    if (!username) {
      const match = config.url.match(/\/(?:picuki\/profile|instagram\/user)\/(.+)/);
      username = match ? match[1] : config.url;
    }
    const route = rsshubRoutes.instagram.user(username);

    const hubConfig: FeedConfig = {
      ...config,
      options: { ...config.options, route },
    };

    return rsshubAdapter.fetchItems(hubConfig);
  },

  getIcon(): string {
    return "📸";
  },
};

export const telegramAdapter: SourceAdapter = {
  type: "telegram",
  name: "Telegram",
  description: "Follow public Telegram channels via RSSHub",
  params: [
    {
      name: "channel",
      label: "Channel Username",
      type: "text",
      required: true,
      placeholder: "duaborgnews",
      description: "Telegram channel username without @",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    let channel = config.options?.channel as string;
    if (!channel) {
      const match = config.url.match(/\/telegram\/channel\/(.+)/);
      channel = match ? match[1] : config.url;
    }
    const route = rsshubRoutes.telegram.channel(channel);

    const hubConfig: FeedConfig = {
      ...config,
      options: { ...config.options, route },
    };

    return rsshubAdapter.fetchItems(hubConfig);
  },

  getIcon(): string {
    return "✈️";
  },
};

export const tiktokAdapter: SourceAdapter = {
  type: "tiktok",
  name: "TikTok",
  description: "Follow TikTok users via RSSHub",
  params: [
    {
      name: "username",
      label: "Username",
      type: "text",
      required: true,
      placeholder: "username",
      description: "TikTok username without @",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    let username = config.options?.username as string;
    if (!username) {
      const match = config.url.match(/\/tiktok\/user\/@?(.+)/);
      username = match ? match[1] : config.url;
    }
    const route = rsshubRoutes.tiktok.user(username);

    const hubConfig: FeedConfig = {
      ...config,
      options: { ...config.options, route },
    };

    return rsshubAdapter.fetchItems(hubConfig);
  },

  getIcon(): string {
    return "🎵";
  },
};

export const facebookAdapter: SourceAdapter = {
  type: "facebook",
  name: "Facebook",
  description: "Follow Facebook pages and groups via RSSHub",
  params: [
    {
      name: "page",
      label: "Page/Group ID or Name",
      type: "text",
      required: true,
      placeholder: "meta",
      description: "Facebook page name or ID",
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: false,
      default: "page",
      options: [
        { label: "Page", value: "page" },
        { label: "Group", value: "group" },
      ],
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    let page = config.options?.page as string;
    if (!page) {
      const match = config.url.match(/\/facebook\/(?:page|group)\/(.+)/);
      page = match ? match[1] : config.url;
    }

    const type = (config.options?.type as string) || "page";
    const route = type === "group"
      ? rsshubRoutes.facebook.group(page)
      : rsshubRoutes.facebook.page(page);

    const hubConfig: FeedConfig = {
      ...config,
      options: { ...config.options, route },
    };

    return rsshubAdapter.fetchItems(hubConfig);
  },

  getIcon(): string {
    return "📘";
  },
};

export const mastodonAdapter: SourceAdapter = {
  type: "mastodon",
  name: "Mastodon",
  description: "Follow Mastodon users via RSSHub",
  params: [
    {
      name: "instance",
      label: "Instance",
      type: "text",
      required: true,
      placeholder: "mastodon.social",
      description: "Mastodon instance domain",
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      required: true,
      placeholder: "username",
      description: "Mastodon username without @",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    let instance = config.options?.instance as string;
    let username = config.options?.username as string;
    if (!username) {
      const match = config.url.match(/\/mastodon\/user\/([^/]+)\/(.+)/);
      if (match) {
        instance = match[1];
        username = match[2];
      } else {
        username = config.url;
      }
    }
    instance = instance || "mastodon.social";
    const route = rsshubRoutes.mastodon.user(instance, username);

    const hubConfig: FeedConfig = {
      ...config,
      options: { ...config.options, route },
    };

    return rsshubAdapter.fetchItems(hubConfig);
  },

  getIcon(): string {
    return "🐘";
  },
};
