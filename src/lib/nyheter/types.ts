// ============================================
// NEWS ITEM TYPES
// ============================================

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  fullContent?: string; // Extracted full article
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: NewsSource;
  category?: NewsCategory;
  author?: string;
  tags?: string[];
  isRead?: boolean;
  isFavorite?: boolean;
  // Filtering metadata
  matchedFilters?: string[];
  filteredOut?: boolean;
}

export interface NewsSource {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  logoUrl?: string;
  color?: string;
}

// ============================================
// SOURCE TYPES (SPOUTS)
// ============================================

export type SourceType =
  | "rss"
  | "atom"
  | "youtube"
  | "twitter"
  | "reddit"
  | "github"
  | "pressrelease"
  | "cision"
  | "mfn"
  | "newsroom"
  | "api"
  // RSSHub & RSS-Bridge powered sources
  | "rsshub"
  | "rssbridge"
  // Social media via RSSHub
  | "linkedin"
  | "instagram"
  | "telegram"
  | "tiktok"
  | "mastodon"
  // Huginn automation
  | "huginn"
  | "other";

export type NewsCategory =
  | "general"
  | "business"
  | "technology"
  | "finance"
  | "politics"
  | "sports"
  | "entertainment"
  | "science"
  | "health"
  | "startup"
  | "pressrelease"
  | "other";

// ============================================
// FEED CONFIGURATION
// ============================================

export interface FeedConfig {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  category?: NewsCategory;
  color?: string;
  enabled: boolean;
  refreshInterval?: number; // in seconds
  // Adapter-specific options
  options?: Record<string, unknown>;
  // Tags for organization
  tags?: string[];
  // Filters for this feed
  filters?: FeedFilter[];
  // Last successful fetch
  lastFetched?: string;
  // Error state
  error?: string;
}

// ============================================
// FILTERING SYSTEM
// ============================================

export type FilterType =
  | "include" // Only include items matching
  | "exclude" // Exclude items matching
  | "highlight"; // Highlight but don't filter

export type FilterMatchType =
  | "contains" // Simple string contains
  | "exact" // Exact match
  | "regex" // Regular expression
  | "startsWith"
  | "endsWith";

export interface FeedFilter {
  id: string;
  name: string;
  type: FilterType;
  matchType: FilterMatchType;
  pattern: string;
  field: "title" | "description" | "content" | "author" | "all";
  caseSensitive?: boolean;
  enabled: boolean;
}

export interface GlobalFilter extends FeedFilter {
  applyToFeeds: string[] | "all"; // Feed IDs or "all"
}

// ============================================
// TAGGING SYSTEM
// ============================================

export interface Tag {
  id: string;
  name: string;
  color: string;
  feedIds: string[];
}

// ============================================
// OPML TYPES
// ============================================

export interface OPMLOutline {
  text: string;
  title?: string;
  type?: string;
  xmlUrl?: string;
  htmlUrl?: string;
  children?: OPMLOutline[];
}

export interface OPMLDocument {
  title: string;
  dateCreated?: string;
  ownerName?: string;
  outlines: OPMLOutline[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface FeedResponse {
  items: NewsItem[];
  source: NewsSource;
  lastUpdated: string;
  error?: string;
}

export interface ArticleParseResult {
  title?: string;
  author?: string;
  content?: string;
  datePublished?: string;
  leadImageUrl?: string;
  excerpt?: string;
  wordCount?: number;
  direction?: string;
  domain?: string;
  url?: string;
}

// ============================================
// ADAPTER INTERFACE
// ============================================

export interface SourceAdapter {
  type: SourceType;
  name: string;
  description: string;
  // Parameters required for this adapter
  params: AdapterParam[];
  // Fetch items from this source
  fetchItems(config: FeedConfig): Promise<NewsItem[]>;
  // Validate configuration
  validate?(config: FeedConfig): boolean;
  // Get source icon/logo
  getIcon?(): string;
}

export interface AdapterParam {
  name: string;
  label: string;
  type: "text" | "url" | "number" | "select" | "boolean";
  required: boolean;
  default?: unknown;
  options?: { label: string; value: string }[];
  placeholder?: string;
  description?: string;
}

// ============================================
// APP STATE
// ============================================

export interface AppState {
  feeds: FeedConfig[];
  tags: Tag[];
  globalFilters: GlobalFilter[];
  settings: AppSettings;
}

export interface AppSettings {
  refreshInterval: number; // Global refresh interval in seconds
  theme: "light" | "dark" | "system";
  showUnreadOnly: boolean;
  articlesPerPage: number;
  enableFullTextExtraction: boolean;
  defaultCategory: NewsCategory;
}
