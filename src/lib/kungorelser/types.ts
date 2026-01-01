// Types for Kungörelser (Company Announcements) module

export interface Announcement {
  id: string;           // Unique ID from POIT (e.g., "K123456-25")
  query: string;        // Original search query
  reporter?: string;    // Source (e.g., "Bolagsverket")
  type?: string;        // Announcement type
  subject: string;      // Company name
  pubDate?: string;     // Publication date (text from source)
  publishedAt?: Date;   // Parsed publication date

  // Content
  detailText?: string;  // Short preview (<=100 words)
  fullText?: string;    // Full announcement text

  // Metadata
  url?: string;         // Original URL on POIT
  orgNumber?: string;   // Associated organization number

  // Timestamps
  scrapedAt?: Date;
}

export interface ScrapedResult {
  id: string;
  url: string;
  cells: string[];
  rowText: string;
  reporter?: string;
  type?: string;
  subject?: string;
  pubDate?: string;
  detailText?: string;
  fullText?: string;
}

export interface SearchQueueItem {
  id: string;
  query: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultCount: number;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ScrapeStats {
  totalSearches: number;
  totalAnnouncements: number;
  lastSearchAt?: Date;
  captchaSolves: number;
  errors: number;
  isRunning: boolean;
  concurrentSearches: number;
  delayMs: number;
}

export interface SearchOptions {
  skipDetails?: boolean;
  detailLimit?: number;
  debug?: boolean;
}

export interface AnnouncementFilter {
  query?: string;
  orgNumber?: string;
  type?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}
