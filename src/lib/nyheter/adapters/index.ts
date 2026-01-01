import type { SourceAdapter, SourceType, FeedConfig, NewsItem } from "@/lib/nyheter/types";
import { rssAdapter } from "@/lib/nyheter/adapters/rss";
import { youtubeAdapter } from "@/lib/nyheter/adapters/youtube";
import { redditAdapter } from "@/lib/nyheter/adapters/reddit";
import { githubAdapter } from "@/lib/nyheter/adapters/github";
import {
  rsshubAdapter,
  twitterAdapter as rsshubTwitterAdapter,
  linkedinAdapter as rsshubLinkedinAdapter,
  instagramAdapter as rsshubInstagramAdapter,
  facebookAdapter as rsshubFacebookAdapter,
  telegramAdapter,
  tiktokAdapter,
  mastodonAdapter,
} from "@/lib/nyheter/adapters/rsshub";
import { rssbridgeAdapter, cssSelectorAdapter } from "@/lib/nyheter/adapters/rssbridge";
import { huginnAdapter } from "@/lib/nyheter/adapters/huginn";
import {
  linkedinProfileAdapter,
  nitterAdapter,
  instagramDirectAdapter,
  facebookDirectAdapter,
} from "@/lib/nyheter/adapters/social";

// Use improved social adapters that have better fallback logic
const twitterAdapter = nitterAdapter;
const linkedinAdapter = linkedinProfileAdapter;
const instagramAdapter = instagramDirectAdapter;
const facebookAdapter = facebookDirectAdapter;

// Registry of all available adapters
const adapters: Map<SourceType, SourceAdapter> = new Map([
  // Core RSS/Atom
  ["rss", rssAdapter],
  ["atom", rssAdapter],

  // Video platforms
  ["youtube", youtubeAdapter],

  // Social media (native adapters)
  ["reddit", redditAdapter],

  // Code hosting
  ["github", githubAdapter],

  // RSSHub-powered adapters
  ["rsshub", rsshubAdapter],
  ["twitter", twitterAdapter],
  ["linkedin", linkedinAdapter],
  ["instagram", instagramAdapter],
  ["facebook", facebookAdapter],
  ["telegram", telegramAdapter],
  ["tiktok", tiktokAdapter],
  ["mastodon", mastodonAdapter],

  // RSS-Bridge powered
  ["rssbridge", rssbridgeAdapter],

  // Automation
  ["huginn", huginnAdapter],
]);

/**
 * Get adapter for a specific source type
 */
export function getAdapter(type: SourceType): SourceAdapter | undefined {
  return adapters.get(type);
}

/**
 * Get all available adapters
 */
export function getAllAdapters(): SourceAdapter[] {
  // Return unique adapters (rss and atom share the same adapter)
  const uniqueAdapters = new Map<string, SourceAdapter>();
  for (const adapter of adapters.values()) {
    uniqueAdapters.set(adapter.type, adapter);
  }
  return Array.from(uniqueAdapters.values());
}

/**
 * Get adapter info for UI display (grouped by category)
 */
export function getAdapterInfo(): {
  category: string;
  adapters: { type: SourceType; name: string; description: string; icon?: string }[];
}[] {
  return [
    {
      category: "RSS & Nyheter",
      adapters: [
        {
          type: "rss",
          name: "RSS/Atom Feed",
          description: "Standard RSS 2.0 och Atom-flöden",
          icon: "📰",
        },
        {
          type: "rssbridge",
          name: "Webbskrapare (CSS)",
          description: "Skapa RSS från vilken webbsida som helst",
          icon: "🔍",
        },
      ],
    },
    {
      category: "Sociala Medier",
      adapters: [
        {
          type: "twitter",
          name: "Twitter/X",
          description: "Följ Twitter-konton och sökord",
          icon: "𝕏",
        },
        {
          type: "linkedin",
          name: "LinkedIn",
          description: "Följ LinkedIn-företagssidor",
          icon: "💼",
        },
        {
          type: "instagram",
          name: "Instagram",
          description: "Följ Instagram-profiler",
          icon: "📸",
        },
        {
          type: "facebook",
          name: "Facebook",
          description: "Följ Facebook-sidor och grupper",
          icon: "📘",
        },
        {
          type: "telegram",
          name: "Telegram",
          description: "Följ publika Telegram-kanaler",
          icon: "✈️",
        },
        {
          type: "tiktok",
          name: "TikTok",
          description: "Följ TikTok-profiler",
          icon: "🎵",
        },
        {
          type: "mastodon",
          name: "Mastodon",
          description: "Följ Mastodon-användare",
          icon: "🐘",
        },
      ],
    },
    {
      category: "Video & Media",
      adapters: [
        {
          type: "youtube",
          name: "YouTube",
          description: "Prenumerera på YouTube-kanaler",
          icon: "▶️",
        },
      ],
    },
    {
      category: "Utveckling",
      adapters: [
        {
          type: "reddit",
          name: "Reddit",
          description: "Följ subreddits",
          icon: "🤖",
        },
        {
          type: "github",
          name: "GitHub",
          description: "Följ repos, releases och issues",
          icon: "💻",
        },
      ],
    },
    {
      category: "Avancerat",
      adapters: [
        {
          type: "rsshub",
          name: "RSSHub",
          description: "Anpassade RSSHub-routes",
          icon: "🧡",
        },
        {
          type: "huginn",
          name: "Huginn",
          description: "Self-hosted automation",
          icon: "🤖",
        },
      ],
    },
  ];
}

/**
 * Get flat adapter info list
 */
export function getAdapterInfoFlat(): { type: SourceType; name: string; description: string; icon?: string }[] {
  return getAdapterInfo().flatMap((group) => group.adapters);
}

/**
 * Fetch items using the appropriate adapter
 */
export async function fetchItemsWithAdapter(config: FeedConfig): Promise<NewsItem[]> {
  const adapter = getAdapter(config.type);

  if (!adapter) {
    console.warn(`No adapter found for source type: ${config.type}`);
    // Fall back to RSS adapter
    return rssAdapter.fetchItems(config);
  }

  return adapter.fetchItems(config);
}

/**
 * Validate a feed configuration
 */
export function validateFeedConfig(config: FeedConfig): boolean {
  const adapter = getAdapter(config.type);

  if (!adapter) {
    return false;
  }

  if (adapter.validate) {
    return adapter.validate(config);
  }

  // Basic validation
  return config.url.length > 0 && config.name.length > 0;
}

// Export individual adapters for direct use
export {
  rssAdapter,
  youtubeAdapter,
  redditAdapter,
  githubAdapter,
  rsshubAdapter,
  twitterAdapter,
  linkedinAdapter,
  instagramAdapter,
  facebookAdapter,
  telegramAdapter,
  tiktokAdapter,
  mastodonAdapter,
  rssbridgeAdapter,
  cssSelectorAdapter,
  huginnAdapter,
  // Also export the direct social adapters
  linkedinProfileAdapter,
  nitterAdapter,
  instagramDirectAdapter,
  facebookDirectAdapter,
  // RSSHub versions for fallback
  rsshubTwitterAdapter,
  rsshubLinkedinAdapter,
  rsshubInstagramAdapter,
  rsshubFacebookAdapter,
};

// Export RSSHub route builders
export { rsshubRoutes } from "@/lib/nyheter/adapters/rsshub";

// Export Swedish site configs
export { swedishNewsSiteConfigs } from "@/lib/nyheter/adapters/rssbridge";
