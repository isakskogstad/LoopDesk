import type { SourceAdapter, FeedConfig, NewsItem } from "@/lib/nyheter/types";
import Parser from "rss-parser";

// Public RSS-Bridge instances
const RSSBRIDGE_INSTANCES = [
  "https://rss-bridge.org/bridge01",
  "https://wtf.roflcopter.fr/rss-bridge",
  "https://rss.nixnet.services",
];

// Get configured RSS-Bridge instance or use default
function getRSSBridgeInstance(config: FeedConfig): string {
  return (config.options?.instance as string) || RSSBRIDGE_INSTANCES[0];
}

// Available RSS-Bridge bridges (most common ones)
export const bridges = {
  // CSS Selector - scrape any website using CSS selectors
  CssSelectorBridge: {
    name: "CSS Selector",
    description: "Scrape any website using CSS selectors",
    params: ["home_page", "url_selector", "url_pattern", "content_selector", "content_cleanup", "title_cleanup", "limit"],
  },

  // XPath - scrape using XPath
  XPathBridge: {
    name: "XPath",
    description: "Scrape any website using XPath expressions",
    params: ["url", "item", "title", "content", "uri", "author", "timestamp"],
  },

  // Site-specific bridges
  TwitterBridge: {
    name: "Twitter",
    description: "Twitter user timeline, keywords, or lists",
    params: ["context", "q", "norep", "noretweet", "nopinned", "maxresults", "idastitle", "imgonly", "nopic", "noimg", "noimgscaling"],
  },

  FacebookBridge: {
    name: "Facebook",
    description: "Facebook pages and groups (public only)",
    params: ["u", "media_type", "skip_posts_without_text", "locale"],
  },

  InstagramBridge: {
    name: "Instagram",
    description: "Instagram user profiles",
    params: ["u", "post_count", "stories"],
  },

  YoutubeBridge: {
    name: "YouTube",
    description: "YouTube channels, playlists, and search",
    params: ["context", "s", "custom", "duration_min", "duration_max", "page_count"],
  },

  RedditBridge: {
    name: "Reddit",
    description: "Reddit subreddits and user feeds",
    params: ["context", "r", "u", "search", "score", "d", "search_sort", "post_comments_count", "flare"],
  },

  TelegramBridge: {
    name: "Telegram",
    description: "Public Telegram channels",
    params: ["username", "limit"],
  },

  // News sites
  FilterBridge: {
    name: "Filter",
    description: "Filter an existing RSS feed",
    params: ["url", "filter", "filter_type", "filter_item", "title_from_content"],
  },

  MergeBridge: {
    name: "Merge",
    description: "Merge multiple RSS feeds into one",
    params: ["feed_0", "feed_1", "feed_2", "feed_3", "limit"],
  },

  // Useful site-specific bridges
  GoogleSearchBridge: {
    name: "Google Search",
    description: "Google search results as RSS",
    params: ["q"],
  },

  WikipediaBridge: {
    name: "Wikipedia",
    description: "Wikipedia articles and changes",
    params: ["language", "subject", "fullarticle"],
  },

  GithubIssueBridge: {
    name: "GitHub Issues",
    description: "GitHub repository issues and PRs",
    params: ["u", "p", "c", "q", "a", "direction", "sort"],
  },
};

// Build RSS-Bridge URL
function buildRSSBridgeUrl(
  instance: string,
  bridge: string,
  params: Record<string, string>,
  format = "Atom"
): string {
  const searchParams = new URLSearchParams({
    action: "display",
    bridge,
    format,
    ...params,
  });

  return `${instance}/?${searchParams.toString()}`;
}

export const rssbridgeAdapter: SourceAdapter = {
  type: "rssbridge",
  name: "RSS-Bridge",
  description: "Generate RSS feeds for websites that don't have one",
  params: [
    {
      name: "bridge",
      label: "Bridge Type",
      type: "select",
      required: true,
      options: Object.entries(bridges).map(([key, value]) => ({
        label: value.name,
        value: key,
      })),
      description: "RSS-Bridge bridge to use",
    },
    {
      name: "instance",
      label: "RSS-Bridge Instance",
      type: "select",
      required: false,
      default: RSSBRIDGE_INSTANCES[0],
      options: RSSBRIDGE_INSTANCES.map((url) => ({ label: url, value: url })),
      description: "RSS-Bridge instance to use",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    const parser = new Parser();
    const instance = getRSSBridgeInstance(config);
    const bridge = (config.options?.bridge as string) || "CssSelectorBridge";

    // Build params from options, excluding instance and bridge
    const params: Record<string, string> = {};
    if (config.options) {
      for (const [key, value] of Object.entries(config.options)) {
        if (key !== "instance" && key !== "bridge" && value) {
          params[key] = String(value);
        }
      }
    }

    const fullUrl = buildRSSBridgeUrl(instance, bridge, params);

    try {
      const feed = await parser.parseURL(fullUrl);

      return (feed.items || []).map((item) => {
        let imageUrl: string | undefined;

        // Check enclosure
        if (item.enclosure?.url) {
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
          id: `rssbridge-${config.id}-${item.guid || item.link || Date.now()}`,
          title: item.title || "Untitled",
          description: item.contentSnippet || item.content?.substring(0, 200),
          content: item.content,
          url: item.link || config.url,
          imageUrl,
          publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
          author: item.creator || item.author,
          source: {
            id: config.id,
            name: config.name,
            type: "rssbridge",
            url: fullUrl,
            color: config.color || "#4A90D9",
          },
          category: config.category || "other",
        };
      });
    } catch (error) {
      console.error(`Error fetching RSS-Bridge ${bridge}:`, error);
      throw error;
    }
  },

  validate(config: FeedConfig): boolean {
    return Boolean(config.options?.bridge);
  },

  getIcon(): string {
    return "🌉";
  },
};

// CSS Selector adapter for easy website scraping
export const cssSelectorAdapter: SourceAdapter = {
  type: "rssbridge",
  name: "Website Scraper (CSS)",
  description: "Scrape any website using CSS selectors to create an RSS feed",
  params: [
    {
      name: "home_page",
      label: "Website URL",
      type: "url",
      required: true,
      placeholder: "https://www.dn.se/varlden/",
      description: "The website URL to scrape",
    },
    {
      name: "url_selector",
      label: "Link Selector",
      type: "text",
      required: true,
      placeholder: "article a.title",
      description: "CSS selector for article links",
    },
    {
      name: "url_pattern",
      label: "URL Pattern (optional)",
      type: "text",
      required: false,
      placeholder: "/article/",
      description: "Filter links by URL pattern",
    },
    {
      name: "content_selector",
      label: "Content Selector",
      type: "text",
      required: false,
      placeholder: "article .content",
      description: "CSS selector for article content",
    },
    {
      name: "limit",
      label: "Max Items",
      type: "number",
      required: false,
      default: 20,
      description: "Maximum number of items to fetch",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    const bridgeConfig: FeedConfig = {
      ...config,
      options: {
        ...config.options,
        bridge: "CssSelectorBridge",
      },
    };

    return rssbridgeAdapter.fetchItems(bridgeConfig);
  },

  validate(config: FeedConfig): boolean {
    return Boolean(config.options?.home_page && config.options?.url_selector);
  },

  getIcon(): string {
    return "🔍";
  },
};

// Pre-built configurations for common Swedish news sites without RSS
export const swedishNewsSiteConfigs: Record<string, Partial<FeedConfig>> = {
  "dn-varlden": {
    name: "DN Världen",
    url: "https://www.dn.se/varlden/",
    type: "rssbridge",
    color: "#0066CC",
    options: {
      bridge: "CssSelectorBridge",
      home_page: "https://www.dn.se/varlden/",
      url_selector: "a.teaser-link",
      content_selector: "article.article-content",
      limit: 20,
    },
  },
  "svt-nyheter": {
    name: "SVT Nyheter",
    url: "https://www.svt.se/nyheter/",
    type: "rssbridge",
    color: "#00A0DE",
    options: {
      bridge: "CssSelectorBridge",
      home_page: "https://www.svt.se/nyheter/",
      url_selector: "article a",
      url_pattern: "/nyheter/",
      content_selector: "article.nyh__article",
      limit: 20,
    },
  },
  "aftonbladet": {
    name: "Aftonbladet",
    url: "https://www.aftonbladet.se/",
    type: "rssbridge",
    color: "#FFDD00",
    options: {
      bridge: "CssSelectorBridge",
      home_page: "https://www.aftonbladet.se/nyheter",
      url_selector: "a.hyperlink--varmefront",
      content_selector: "article.article-body",
      limit: 20,
    },
  },
  "expressen": {
    name: "Expressen",
    url: "https://www.expressen.se/",
    type: "rssbridge",
    color: "#ED1C24",
    options: {
      bridge: "CssSelectorBridge",
      home_page: "https://www.expressen.se/nyheter/",
      url_selector: "article a",
      content_selector: "article.article",
      limit: 20,
    },
  },
};
