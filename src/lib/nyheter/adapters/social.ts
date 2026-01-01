import type { SourceAdapter, FeedConfig, NewsItem } from "@/lib/nyheter/types";

// ============================================
// SERVICE URLS (Docker or localhost)
// ============================================

const LINKEDIN_MCP_URL = process.env.LINKEDIN_MCP_URL || "http://localhost:8100/mcp";
const SOCIAL_SCRAPER_URL = process.env.SOCIAL_SCRAPER_URL || "http://localhost:8101";

// Helper to extract usernames from URLs
function extractUsername(input: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return input.replace(/^@/, "").trim();
}

// ============================================
// LINKEDIN ADAPTER (via MCP Server)
// ============================================

interface LinkedInMCPResponse {
  result?: {
    content?: Array<{ text?: string }>;
  };
}

export const linkedinProfileAdapter: SourceAdapter = {
  type: "linkedin",
  name: "LinkedIn",
  description: "Follow LinkedIn profiles and companies via MCP server",
  params: [
    {
      name: "profile",
      label: "Profile URL or Username",
      type: "text",
      required: true,
      placeholder: "https://www.linkedin.com/in/antonosika or antonosika",
      description: "LinkedIn profile URL or username",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    const input = (config.options?.profile as string) || config.url;
    const isCompany = input.includes("/company/");

    // Extract identifier
    const identifier = extractUsername(input, [
      /linkedin\.com\/in\/([^/?#]+)/i,
      /linkedin\.com\/company\/([^/?#]+)/i,
    ]);

    try {
      // Call LinkedIn MCP server
      const toolName = isCompany ? "get_company_profile" : "get_person_profile";
      const params = isCompany
        ? { company_name: identifier }
        : { profile_url: `https://www.linkedin.com/in/${identifier}` };

      const response = await fetch(LINKEDIN_MCP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: { name: toolName, arguments: params },
          id: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`MCP server returned ${response.status}`);
      }

      const data: LinkedInMCPResponse = await response.json();
      const content = data.result?.content?.[0]?.text;

      if (content) {
        // Parse the profile data
        const profileData = JSON.parse(content);

        return [{
          id: `linkedin-${config.id}-${identifier}`,
          title: profileData.name || profileData.title || `LinkedIn: ${identifier}`,
          description: profileData.about || profileData.headline || profileData.description || "",
          url: isCompany
            ? `https://www.linkedin.com/company/${identifier}`
            : `https://www.linkedin.com/in/${identifier}`,
          imageUrl: profileData.profile_picture || profileData.logo,
          publishedAt: new Date().toISOString(),
          author: profileData.name || identifier,
          source: {
            id: config.id,
            name: config.name,
            type: "linkedin",
            url: isCompany
              ? `https://www.linkedin.com/company/${identifier}`
              : `https://www.linkedin.com/in/${identifier}`,
            color: config.color || "#0A66C2",
          },
          category: config.category || "business",
        }];
      }

      throw new Error("No content in MCP response");
    } catch (error) {
      console.warn("LinkedIn MCP error:", error);

      // Fallback: return a link to the profile
      return [{
        id: `linkedin-${config.id}-${identifier}-link`,
        title: `LinkedIn: ${identifier}`,
        description: isCompany
          ? `View ${identifier}'s company page on LinkedIn`
          : `View ${identifier}'s profile on LinkedIn`,
        url: isCompany
          ? `https://www.linkedin.com/company/${identifier}`
          : `https://www.linkedin.com/in/${identifier}`,
        publishedAt: new Date().toISOString(),
        author: identifier,
        source: {
          id: config.id,
          name: config.name,
          type: "linkedin",
          url: isCompany
            ? `https://www.linkedin.com/company/${identifier}`
            : `https://www.linkedin.com/in/${identifier}`,
          color: config.color || "#0A66C2",
        },
        category: config.category || "business",
      }];
    }
  },

  getIcon(): string {
    return "💼";
  },
};

// ============================================
// TWITTER ADAPTER (via Social Scraper Service)
// ============================================

interface SocialScraperPost {
  id: string;
  text: string;
  author: string;
  author_id?: string;
  url: string;
  image_url?: string;
  published_at: string;
  likes: number;
  shares: number;
  comments: number;
  platform: string;
}

export const nitterAdapter: SourceAdapter = {
  type: "twitter",
  name: "Twitter/X",
  description: "Follow Twitter/X users via social scraper service",
  params: [
    {
      name: "username",
      label: "Twitter Username",
      type: "text",
      required: true,
      placeholder: "elonmusk or https://twitter.com/elonmusk",
      description: "Twitter username or profile URL",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    const input = (config.options?.username as string) || config.url;
    const username = extractUsername(input, [
      /(?:twitter\.com|x\.com)\/([^/?#]+)/i,
    ]);

    try {
      // Call social scraper service
      const response = await fetch(`${SOCIAL_SCRAPER_URL}/twitter/user/${username}?limit=20`);

      if (!response.ok) {
        throw new Error(`Scraper returned ${response.status}`);
      }

      const posts: SocialScraperPost[] = await response.json();

      return posts.map((post) => ({
        id: `twitter-${config.id}-${post.id}`,
        title: post.text.substring(0, 100) + (post.text.length > 100 ? "..." : ""),
        description: post.text,
        url: post.url,
        imageUrl: post.image_url,
        publishedAt: post.published_at,
        author: post.author,
        source: {
          id: config.id,
          name: config.name,
          type: "twitter",
          url: `https://twitter.com/${username}`,
          color: config.color || "#1DA1F2",
        },
        category: config.category || "other",
      }));
    } catch (error) {
      console.warn("Twitter scraper error:", error);

      // Fallback: Try Nitter instances
      const nitterInstances = [
        "https://nitter.net",
        "https://nitter.privacydev.net",
      ];

      for (const instance of nitterInstances) {
        try {
          const rssUrl = `${instance}/${username}/rss`;
          const response = await fetch(rssUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          if (!response.ok) continue;

          const text = await response.text();
          if (!text.includes("<rss") && !text.includes("<feed")) continue;

          const Parser = (await import("rss-parser")).default;
          const parser = new Parser();
          const feed = await parser.parseString(text);

          return (feed.items || []).slice(0, 20).map((item) => {
            let imageUrl: string | undefined;
            if (item.content) {
              const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch) imageUrl = imgMatch[1];
            }

            return {
              id: `twitter-${config.id}-${item.guid || Date.now()}`,
              title: item.title || item.contentSnippet?.substring(0, 100) || "Tweet",
              description: item.contentSnippet || item.content?.substring(0, 280),
              url: item.link?.replace(instance, "https://twitter.com") || `https://twitter.com/${username}`,
              imageUrl,
              publishedAt: item.pubDate || new Date().toISOString(),
              author: username,
              source: {
                id: config.id,
                name: config.name,
                type: "twitter",
                url: `https://twitter.com/${username}`,
                color: config.color || "#1DA1F2",
              },
            };
          });
        } catch {
          continue;
        }
      }

      // All methods failed - return placeholder
      return [{
        id: `twitter-${config.id}-${username}-link`,
        title: `@${username} on Twitter/X`,
        description: `View ${username}'s Twitter profile`,
        url: `https://twitter.com/${username}`,
        publishedAt: new Date().toISOString(),
        author: username,
        source: {
          id: config.id,
          name: config.name,
          type: "twitter",
          url: `https://twitter.com/${username}`,
          color: config.color || "#1DA1F2",
        },
      }];
    }
  },

  getIcon(): string {
    return "𝕏";
  },
};

// ============================================
// INSTAGRAM ADAPTER
// ============================================

export const instagramDirectAdapter: SourceAdapter = {
  type: "instagram",
  name: "Instagram",
  description: "Follow Instagram profiles",
  params: [
    {
      name: "username",
      label: "Instagram Username",
      type: "text",
      required: true,
      placeholder: "natgeo or https://instagram.com/natgeo",
      description: "Instagram username or profile URL",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    const input = (config.options?.username as string) || config.url;
    const username = extractUsername(input, [
      /instagram\.com\/([^/?#]+)/i,
    ]);

    // Try RSSHub instances for Picuki
    const rsshubInstances = [
      process.env.RSSHUB_URL,
      "https://rsshub.rssforever.com",
      "https://hub.slarker.me",
    ].filter(Boolean) as string[];

    for (const instance of rsshubInstances) {
      try {
        const response = await fetch(`${instance}/picuki/profile/${username}`, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (response.ok) {
          const Parser = (await import("rss-parser")).default;
          const parser = new Parser();
          const feed = await parser.parseString(await response.text());

          return (feed.items || []).slice(0, 20).map((item) => {
            let imageUrl: string | undefined;
            if (item.enclosure?.url) imageUrl = item.enclosure.url;
            if (!imageUrl && item.content) {
              const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch) imageUrl = imgMatch[1];
            }

            return {
              id: `instagram-${config.id}-${item.guid || Date.now()}`,
              title: item.title || item.contentSnippet?.substring(0, 100) || "Instagram Post",
              description: item.contentSnippet || item.content?.substring(0, 200),
              url: item.link || `https://instagram.com/${username}`,
              imageUrl,
              publishedAt: item.pubDate || new Date().toISOString(),
              author: username,
              source: {
                id: config.id,
                name: config.name,
                type: "instagram",
                url: `https://instagram.com/${username}`,
                color: config.color || "#E4405F",
              },
            };
          });
        }
      } catch (e) {
        console.warn(`RSSHub instance ${instance} failed for Instagram:`, e);
      }
    }

    // Return placeholder
    return [{
      id: `instagram-${config.id}-${username}-link`,
      title: `@${username} on Instagram`,
      description: `View ${username}'s Instagram profile`,
      url: `https://instagram.com/${username}`,
      publishedAt: new Date().toISOString(),
      author: username,
      source: {
        id: config.id,
        name: config.name,
        type: "instagram",
        url: `https://instagram.com/${username}`,
        color: config.color || "#E4405F",
      },
    }];
  },

  getIcon(): string {
    return "📸";
  },
};

// ============================================
// FACEBOOK ADAPTER (via Social Scraper Service)
// ============================================

export const facebookDirectAdapter: SourceAdapter = {
  type: "facebook",
  name: "Facebook",
  description: "Follow Facebook pages via social scraper service",
  params: [
    {
      name: "page",
      label: "Facebook Page",
      type: "text",
      required: true,
      placeholder: "meta or https://facebook.com/meta",
      description: "Facebook page name or URL",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    const input = (config.options?.page as string) || config.url;
    const page = extractUsername(input, [
      /facebook\.com\/([^/?#]+)/i,
    ]);

    try {
      // Call social scraper service
      const response = await fetch(`${SOCIAL_SCRAPER_URL}/facebook/page/${page}?pages=2`);

      if (!response.ok) {
        throw new Error(`Scraper returned ${response.status}`);
      }

      const posts: SocialScraperPost[] = await response.json();

      return posts.map((post) => ({
        id: `facebook-${config.id}-${post.id}`,
        title: post.text.substring(0, 100) + (post.text.length > 100 ? "..." : ""),
        description: post.text,
        url: post.url,
        imageUrl: post.image_url,
        publishedAt: post.published_at,
        author: post.author || page,
        source: {
          id: config.id,
          name: config.name,
          type: "facebook",
          url: `https://facebook.com/${page}`,
          color: config.color || "#1877F2",
        },
        category: config.category || "other",
      }));
    } catch (error) {
      console.warn("Facebook scraper error:", error);

      // Try RSSHub as fallback
      const rsshubUrl = process.env.RSSHUB_URL || "https://rsshub.rssforever.com";
      try {
        const response = await fetch(`${rsshubUrl}/facebook/page/${page}`, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (response.ok) {
          const Parser = (await import("rss-parser")).default;
          const parser = new Parser();
          const feed = await parser.parseString(await response.text());

          return (feed.items || []).slice(0, 20).map((item) => ({
            id: `facebook-${config.id}-${item.guid || Date.now()}`,
            title: item.title || "Facebook Post",
            description: item.contentSnippet || item.content?.substring(0, 200),
            url: item.link || `https://facebook.com/${page}`,
            publishedAt: item.pubDate || new Date().toISOString(),
            author: page,
            source: {
              id: config.id,
              name: config.name,
              type: "facebook",
              url: `https://facebook.com/${page}`,
              color: config.color || "#1877F2",
            },
          }));
        }
      } catch {
        // Ignore RSSHub errors
      }

      // Return placeholder
      return [{
        id: `facebook-${config.id}-${page}-link`,
        title: `${page} on Facebook`,
        description: `View ${page}'s Facebook page`,
        url: `https://facebook.com/${page}`,
        publishedAt: new Date().toISOString(),
        author: page,
        source: {
          id: config.id,
          name: config.name,
          type: "facebook",
          url: `https://facebook.com/${page}`,
          color: config.color || "#1877F2",
        },
      }];
    }
  },

  getIcon(): string {
    return "📘";
  },
};

// Export all adapters
export const socialAdapters = {
  linkedinProfile: linkedinProfileAdapter,
  nitter: nitterAdapter,
  instagramDirect: instagramDirectAdapter,
  facebookDirect: facebookDirectAdapter,
};
