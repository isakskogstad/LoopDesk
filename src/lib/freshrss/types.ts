// FreshRSS Fever API types
// Based on: https://github.com/FreshRSS/FreshRSS/blob/edge/docs/en/users/06_Fever_API.md

export interface FeverAuthResponse {
  api_version: number;
  auth: 0 | 1;
  last_refreshed_on_time?: number;
}

export interface FeverGroup {
  id: number;
  title: string;
}

export interface FeverFeed {
  id: number;
  favicon_id: number;
  title: string;
  url: string;
  site_url: string;
  is_spark: 0 | 1;
  last_updated_on_time: number;
}

export interface FeverFeedsGroup {
  group_id: number;
  feed_ids: string; // Comma-separated feed IDs
}

export interface FeverItem {
  id: number;
  feed_id: number;
  title: string;
  author: string;
  html: string;
  url: string;
  is_saved: 0 | 1;
  is_read: 0 | 1;
  created_on_time: number;
}

export interface FeverGroupsResponse extends FeverAuthResponse {
  groups: FeverGroup[];
  feeds_groups: FeverFeedsGroup[];
}

export interface FeverFeedsResponse extends FeverAuthResponse {
  feeds: FeverFeed[];
  feeds_groups: FeverFeedsGroup[];
}

export interface FeverItemsResponse extends FeverAuthResponse {
  items: FeverItem[];
  total_items: number;
}

export interface FeverUnreadResponse extends FeverAuthResponse {
  unread_item_ids: string; // Comma-separated IDs
}

export interface FeverSavedResponse extends FeverAuthResponse {
  saved_item_ids: string; // Comma-separated IDs
}

// FreshRSS client options
export interface FreshRSSClientOptions {
  baseUrl: string;
  apiKey: string; // MD5 hash of username:password
}

// Get items options
export interface GetItemsOptions {
  since_id?: number;
  max_id?: number;
  with_ids?: number[];
  limit?: number;
}

// Transformed article for LoopDesk
export interface TransformedArticle {
  externalId: string;
  freshRssId: number;
  feedId: string;
  url: string;
  title: string;
  description: string | null;
  content: string | null;
  author: string | null;
  publishedAt: Date;
  sourceName: string;
  sourceId: string;
  sourceType: string;
  isRead: boolean;
  isBookmarked: boolean;
}

// Feed source for LoopDesk
export interface TransformedFeed {
  id: string;
  name: string;
  url: string;
  siteUrl: string;
  category: string | null;
  lastUpdated: Date;
}
