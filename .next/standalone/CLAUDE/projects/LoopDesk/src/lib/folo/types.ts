/**
 * Folo API Types
 *
 * Types for the Folo (app.folo.is) shared lists API.
 * API endpoint: https://api.folo.is/lists?listId={id}
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Feed owner/user information
 */
export interface FoloOwner {
  id: string;
  name: string;
  handle: string | null;
  image: string;
  bio: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
}

/**
 * Individual feed within a list
 */
export interface FoloFeed {
  type: string;
  id: string;
  url: string;
  title: string;
  description: string;
  siteUrl: string;
  image: string | null;
  errorMessage: string | null;
  errorAt: string | null;
  ownerUserId: string | null;
}

/**
 * Media attachment on an entry
 */
export interface FoloMedia {
  url: string;
  type: string;
  width?: number;
  height?: number;
}

/**
 * File attachment on an entry
 */
export interface FoloAttachment {
  url: string;
  title?: string;
  mimeType?: string;
  sizeInBytes?: number;
  durationInSeconds?: number;
}

/**
 * Feed entry (article/post)
 */
export interface FoloEntry {
  feedId: string;
  id: string;
  title: string;
  url: string;
  content: string;
  description: string;
  guid: string;
  author: string | null;
  authorUrl: string | null;
  authorAvatar: string | null;
  insertedAt: string;
  publishedAt: string;
  media: FoloMedia[] | null;
  categories: string[];
  attachments: FoloAttachment[] | null;
  extra: Record<string, unknown> | null;
  language: string | null;
  summary: string | null;
  /** The feed this entry belongs to */
  feeds: FoloFeed;
}

/**
 * A shared list containing multiple feeds
 */
export interface FoloList {
  type: string;
  id: string;
  feedIds: string[];
  title: string;
  description: string;
  image: string;
  view: number;
  fee: number;
  createdAt: string;
  updatedAt: string;
  ownerUserId: string;
  owner: FoloOwner;
  feeds: FoloFeed[];
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Response data from the lists endpoint
 */
export interface FoloListData {
  list: FoloList;
  subscriptionCount: number;
  readCount: number;
  feedCount: number;
  entries: FoloEntry[];
}

/**
 * Full API response wrapper
 */
export interface FoloApiResponse<T = FoloListData> {
  code: number;
  data: T;
}

// =============================================================================
// Error Types
// =============================================================================

/**
 * Error codes returned by the Folo API
 */
export enum FoloErrorCode {
  SUCCESS = 0,
  NOT_FOUND = 404,
  RATE_LIMITED = 429,
  SERVER_ERROR = 500,
}

/**
 * Custom error class for Folo API errors
 */
export class FoloApiError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'FoloApiError';
  }
}

// =============================================================================
// Client Types
// =============================================================================

/**
 * Configuration options for the Folo client
 */
export interface FoloClientConfig {
  /** Base URL for the API (default: https://api.folo.is) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Number of retry attempts (default: 3) */
  retries?: number;
  /** Initial retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
  /** User agent string (optional) */
  userAgent?: string;
}

/**
 * Result of parsing a Folo list URL
 */
export interface ParsedFoloUrl {
  listId: string;
  type: 'list';
}
