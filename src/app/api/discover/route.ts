import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface DiscoveredFeed {
  url: string;
  title: string;
  type: "rss" | "atom" | "json";
  source: "autodiscovery" | "common-pattern" | "rsshub";
}

// Common RSS/Atom URL patterns to try
const COMMON_FEED_PATTERNS = [
  "/feed",
  "/feed/",
  "/feeds",
  "/rss",
  "/rss.xml",
  "/atom.xml",
  "/feed.xml",
  "/index.xml",
  "/rss/feed",
  "/blog/feed",
  "/news/feed",
  "/?feed=rss2",
  "/feed/rss",
  "/feed/atom",
];

// RSSHub routes for known domains
const RSSHUB_ROUTES: Record<string, { route: string; name: string }[]> = {
  "twitter.com": [{ route: "/twitter/user/{path}", name: "Twitter User" }],
  "x.com": [{ route: "/twitter/user/{path}", name: "X/Twitter User" }],
  "youtube.com": [{ route: "/youtube/channel/{path}", name: "YouTube Channel" }],
  "reddit.com": [{ route: "/reddit/subreddit/{path}", name: "Subreddit" }],
  "github.com": [
    { route: "/github/repos/{path}", name: "GitHub Repo" },
    { route: "/github/issue/{path}", name: "GitHub Issues" },
  ],
  "instagram.com": [{ route: "/picuki/profile/{path}", name: "Instagram Profile" }],
  "linkedin.com": [{ route: "/linkedin/company/{path}/posts", name: "LinkedIn Company" }],
  "t.me": [{ route: "/telegram/channel/{path}", name: "Telegram Channel" }],
  "telegram.me": [{ route: "/telegram/channel/{path}", name: "Telegram Channel" }],
  "tiktok.com": [{ route: "/tiktok/user/{path}", name: "TikTok User" }],
  "medium.com": [{ route: "/medium/{path}", name: "Medium Publication" }],
  "substack.com": [{ route: "/substack/{path}", name: "Substack Newsletter" }],
  "bilibili.com": [{ route: "/bilibili/user/video/{path}", name: "Bilibili User" }],
  "weibo.com": [{ route: "/weibo/user/{path}", name: "Weibo User" }],
  "zhihu.com": [{ route: "/zhihu/people/{path}", name: "Zhihu User" }],
  "douban.com": [{ route: "/douban/people/{path}/status", name: "Douban User" }],
  "v2ex.com": [{ route: "/v2ex/topics/latest", name: "V2EX Latest" }],
  "producthunt.com": [{ route: "/producthunt/today", name: "Product Hunt Today" }],
  "hackernews.com": [{ route: "/hackernews/best", name: "Hacker News Best" }],
  "news.ycombinator.com": [{ route: "/hackernews/best", name: "Hacker News Best" }],
};

// Parse URL to get domain and path
function parseUrl(urlString: string): { domain: string; path: string; baseUrl: string } | null {
  try {
    // Add protocol if missing
    if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
      urlString = "https://" + urlString;
    }
    const url = new URL(urlString);
    return {
      domain: url.hostname.replace(/^www\./, ""),
      path: url.pathname.replace(/^\//, "").replace(/\/$/, ""),
      baseUrl: `${url.protocol}//${url.host}`,
    };
  } catch {
    return null;
  }
}

// Check if a URL returns valid RSS/Atom content
async function checkFeedUrl(url: string): Promise<{ valid: boolean; title?: string; type?: "rss" | "atom" | "json" }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LoopDesk/1.0; +https://loopdesk.se)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, application/json",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) return { valid: false };

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    // Check for RSS
    if (text.includes("<rss") || text.includes("<channel>")) {
      const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      return { valid: true, title: titleMatch?.[1] || "RSS Feed", type: "rss" };
    }

    // Check for Atom
    if (text.includes("<feed") && text.includes("xmlns")) {
      const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      return { valid: true, title: titleMatch?.[1] || "Atom Feed", type: "atom" };
    }

    // Check for JSON Feed
    if (contentType.includes("json")) {
      try {
        const json = JSON.parse(text);
        if (json.version?.includes("jsonfeed") || json.items) {
          return { valid: true, title: json.title || "JSON Feed", type: "json" };
        }
      } catch {
        // Not valid JSON
      }
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Discover feeds from HTML page using link autodiscovery
async function discoverFromHtml(url: string): Promise<DiscoveredFeed[]> {
  const feeds: DiscoveredFeed[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LoopDesk/1.0; +https://loopdesk.se)",
        Accept: "text/html",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) return feeds;

    const html = await response.text();

    // Find RSS/Atom link tags
    const linkRegex = /<link[^>]+rel=["']alternate["'][^>]*>/gi;
    const links = html.match(linkRegex) || [];

    for (const link of links) {
      const typeMatch = link.match(/type=["']([^"']+)["']/i);
      const hrefMatch = link.match(/href=["']([^"']+)["']/i);
      const titleMatch = link.match(/title=["']([^"']+)["']/i);

      if (!hrefMatch) continue;

      const type = typeMatch?.[1] || "";
      let feedUrl = hrefMatch[1];
      const title = titleMatch?.[1] || "";

      // Check if it's an RSS/Atom feed
      if (
        type.includes("rss") ||
        type.includes("atom") ||
        type.includes("xml") ||
        type.includes("json")
      ) {
        // Make URL absolute if relative
        if (feedUrl.startsWith("/")) {
          const baseUrl = new URL(url);
          feedUrl = `${baseUrl.protocol}//${baseUrl.host}${feedUrl}`;
        } else if (!feedUrl.startsWith("http")) {
          const baseUrl = new URL(url);
          feedUrl = `${baseUrl.protocol}//${baseUrl.host}/${feedUrl}`;
        }

        const feedType = type.includes("atom") ? "atom" : type.includes("json") ? "json" : "rss";

        feeds.push({
          url: feedUrl,
          title: title || `${feedType.toUpperCase()} Feed`,
          type: feedType,
          source: "autodiscovery",
        });
      }
    }
  } catch (error) {
    console.error("Error discovering feeds from HTML:", error);
  }

  return feeds;
}

// Try common feed URL patterns
async function tryCommonPatterns(baseUrl: string, domain: string): Promise<DiscoveredFeed[]> {
  const feeds: DiscoveredFeed[] = [];

  // Check patterns in parallel (max 5 at a time)
  const batchSize = 5;
  for (let i = 0; i < COMMON_FEED_PATTERNS.length; i += batchSize) {
    const batch = COMMON_FEED_PATTERNS.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (pattern) => {
        const feedUrl = `${baseUrl}${pattern}`;
        const result = await checkFeedUrl(feedUrl);
        if (result.valid) {
          return {
            url: feedUrl,
            title: result.title || `${domain} Feed`,
            type: result.type!,
            source: "common-pattern" as const,
          };
        }
        return null;
      })
    );

    for (const result of results) {
      if (result !== null) {
        feeds.push(result);
      }
    }

    // Stop if we found feeds
    if (feeds.length > 0) break;
  }

  return feeds;
}

// Get RSSHub routes for a domain
function getRsshubRoutes(domain: string, path: string): DiscoveredFeed[] {
  const feeds: DiscoveredFeed[] = [];

  // Check exact domain match
  const routes = RSSHUB_ROUTES[domain];
  if (routes) {
    for (const route of routes) {
      const rsshubRoute = route.route.replace("{path}", path || "");
      feeds.push({
        url: rsshubRoute,
        title: route.name,
        type: "rss",
        source: "rsshub",
      });
    }
  }

  // Check for subdomain matches (e.g., m.youtube.com -> youtube.com)
  const baseDomain = domain.split(".").slice(-2).join(".");
  if (baseDomain !== domain) {
    const baseRoutes = RSSHUB_ROUTES[baseDomain];
    if (baseRoutes) {
      for (const route of baseRoutes) {
        const rsshubRoute = route.route.replace("{path}", path || "");
        if (!feeds.find((f) => f.url === rsshubRoute)) {
          feeds.push({
            url: rsshubRoute,
            title: route.name,
            type: "rss",
            source: "rsshub",
          });
        }
      }
    }
  }

  return feeds;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const inputUrl = searchParams.get("url");

  if (!inputUrl) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  const parsed = parseUrl(inputUrl);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const { domain, path, baseUrl } = parsed;
  const fullUrl = path ? `${baseUrl}/${path}` : baseUrl;

  const allFeeds: DiscoveredFeed[] = [];

  // Run discovery methods in parallel
  const [htmlFeeds, patternFeeds] = await Promise.all([
    discoverFromHtml(fullUrl),
    tryCommonPatterns(baseUrl, domain),
  ]);

  // Get RSSHub routes (synchronous)
  const rsshubFeeds = getRsshubRoutes(domain, path);

  // Combine all feeds, removing duplicates
  const seenUrls = new Set<string>();

  for (const feed of [...htmlFeeds, ...patternFeeds, ...rsshubFeeds]) {
    const normalizedUrl = feed.url.replace(/\/$/, "").toLowerCase();
    if (!seenUrls.has(normalizedUrl)) {
      seenUrls.add(normalizedUrl);
      allFeeds.push(feed);
    }
  }

  return NextResponse.json({
    url: inputUrl,
    domain,
    feeds: allFeeds,
    feedCount: allFeeds.length,
  });
}
