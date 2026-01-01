import type { SourceAdapter, FeedConfig, NewsItem } from "@/lib/nyheter/types";

// Helper to extract usernames from URLs
function extractUsername(input: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return input.replace(/^@/, "").trim();
}

// ============================================
// LINKEDIN ADAPTER (Direct API call)
// ============================================

interface LinkedInProfile {
  firstName: string;
  lastName: string;
  headline?: string;
  summary?: string;
  location?: string;
  premium?: boolean;
  profilePicture?: string;
}

class LinkedInClient {
  private cookie: string;
  private csrfToken: string | null = null;

  constructor(cookie: string) {
    this.cookie = cookie.startsWith("li_at=") ? cookie.substring(6) : cookie;
  }

  private async initSession(): Promise<void> {
    if (this.csrfToken) return;

    // Fetch LinkedIn homepage to get JSESSIONID
    const response = await fetch("https://www.linkedin.com/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Cookie": `li_at=${this.cookie}`,
      },
    });

    // Extract JSESSIONID from Set-Cookie headers
    const setCookies = response.headers.get("set-cookie") || "";
    const jsessionMatch = setCookies.match(/JSESSIONID="?([^";]+)"?/);
    if (jsessionMatch) {
      this.csrfToken = jsessionMatch[1];
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/vnd.linkedin.normalized+json+2.1",
      "x-li-lang": "en_US",
      "x-restli-protocol-version": "2.0.0",
      "csrf-token": this.csrfToken || "",
      "Cookie": `li_at=${this.cookie}; JSESSIONID="${this.csrfToken}"`,
    };
  }

  async getProfile(username: string): Promise<LinkedInProfile | null> {
    await this.initSession();

    const url = `https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=${username}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.WebTopCardCore-16`;

    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      console.warn(`LinkedIn API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Extract profile from included items
    let profileData: LinkedInProfile | null = null;
    let location: string | undefined;
    let profilePicture: string | undefined;

    for (const item of data.included || []) {
      const itemType = item.$type || "";

      // Get the primary profile (with objectUrn)
      if (itemType.includes("profile.Profile") && item.objectUrn) {
        profileData = {
          firstName: item.multiLocaleFirstName?.en_US || "",
          lastName: item.lastName || "",
          headline: item.headline || "",
          summary: item.summary || "",
          premium: item.premium || false,
        };
      }

      if (itemType.includes("common.Geo") && item.defaultLocalizedName) {
        location = item.defaultLocalizedName;
      }

      if ((itemType.includes("ProfilePhoto") || itemType.includes("VectorImage")) && item.rootUrl) {
        profilePicture = item.rootUrl;
      }
    }

    if (profileData) {
      profileData.location = location;
      profileData.profilePicture = profilePicture;
    }

    return profileData;
  }

  async getCompany(companyName: string): Promise<Record<string, unknown> | null> {
    await this.initSession();

    const url = `https://www.linkedin.com/voyager/api/organization/companies?decorationId=com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-12&q=universalName&universalName=${companyName}`;

    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Extract company data
    for (const item of data.included || []) {
      const itemType = item.$type || "";
      if (itemType.includes("Organization") || itemType.includes("Company")) {
        return {
          name: item.name || companyName,
          description: item.description || "",
          website: item.companyPageUrl || "",
          staffCount: item.staffCount || 0,
          industries: item.industries || [],
        };
      }
    }

    // Check elements
    if (data.elements?.[0]) {
      return data.elements[0];
    }

    return null;
  }
}

// Global client instance (created lazily)
let linkedInClient: LinkedInClient | null = null;

function getLinkedInClient(): LinkedInClient | null {
  if (linkedInClient) return linkedInClient;

  const cookie = process.env.LINKEDIN_COOKIE;
  if (!cookie) {
    console.warn("LINKEDIN_COOKIE not set");
    return null;
  }

  linkedInClient = new LinkedInClient(cookie);
  return linkedInClient;
}

export const linkedinProfileAdapter: SourceAdapter = {
  type: "linkedin",
  name: "LinkedIn",
  description: "Follow LinkedIn profiles and companies",
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

    const client = getLinkedInClient();

    if (client) {
      try {
        if (isCompany) {
          const company = await client.getCompany(identifier);
          if (company) {
            return [{
              id: `linkedin-${config.id}-${identifier}`,
              title: (company.name as string) || identifier,
              description: (company.description as string) || `${identifier} on LinkedIn`,
              url: `https://www.linkedin.com/company/${identifier}`,
              publishedAt: new Date().toISOString(),
              author: identifier,
              source: {
                id: config.id,
                name: config.name,
                type: "linkedin",
                url: `https://www.linkedin.com/company/${identifier}`,
                color: config.color || "#0A66C2",
              },
              category: config.category || "business",
            }];
          }
        } else {
          const profile = await client.getProfile(identifier);
          if (profile) {
            const fullName = `${profile.firstName} ${profile.lastName}`.trim();
            return [{
              id: `linkedin-${config.id}-${identifier}`,
              title: fullName || identifier,
              description: profile.headline || profile.summary || `${fullName} on LinkedIn`,
              url: `https://www.linkedin.com/in/${identifier}`,
              imageUrl: profile.profilePicture,
              publishedAt: new Date().toISOString(),
              author: fullName || identifier,
              source: {
                id: config.id,
                name: config.name,
                type: "linkedin",
                url: `https://www.linkedin.com/in/${identifier}`,
                color: config.color || "#0A66C2",
              },
              category: config.category || "business",
            }];
          }
        }
      } catch (error) {
        console.warn("LinkedIn API error:", error);
      }
    }

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
  },

  getIcon(): string {
    return "💼";
  },
};

// ============================================
// TWITTER ADAPTER (via Nitter RSS)
// ============================================

export const nitterAdapter: SourceAdapter = {
  type: "twitter",
  name: "Twitter/X",
  description: "Follow Twitter/X users via Nitter RSS",
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

    // Try Nitter RSS instances
    const nitterInstances = [
      "https://nitter.privacydev.net",
      "https://nitter.poast.org",
      "https://nitter.net",
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

    // All Nitter instances failed - return placeholder
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
  },

  getIcon(): string {
    return "𝕏";
  },
};

// ============================================
// INSTAGRAM ADAPTER (via RSSHub/Picuki)
// ============================================

export const instagramDirectAdapter: SourceAdapter = {
  type: "instagram",
  name: "Instagram",
  description: "Follow Instagram profiles via Picuki",
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
      "https://rsshub.app",
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
// FACEBOOK ADAPTER (via RSSHub)
// ============================================

export const facebookDirectAdapter: SourceAdapter = {
  type: "facebook",
  name: "Facebook",
  description: "Follow Facebook pages",
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

    // Try RSSHub as primary method
    const rsshubInstances = [
      process.env.RSSHUB_URL,
      "https://rsshub.rssforever.com",
      "https://hub.slarker.me",
      "https://rsshub.app",
    ].filter(Boolean) as string[];

    for (const instance of rsshubInstances) {
      try {
        const response = await fetch(`${instance}/facebook/page/${page}`, {
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
        // Continue to next instance
      }
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
