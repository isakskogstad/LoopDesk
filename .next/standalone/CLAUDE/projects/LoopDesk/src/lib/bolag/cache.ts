/**
 * Caching utilities for Bolagsverket API calls
 *
 * Uses Next.js unstable_cache for server-side caching
 * Reduces API calls and improves response times
 */

import { unstable_cache } from 'next/cache';

/**
 * Cache configuration for different types of data
 */
export const CACHE_CONFIG = {
  // Company basic info (changes rarely)
  companyInfo: {
    revalidate: 3600, // 1 hour
    tags: (orgNr: string) => [`company-${orgNr}`, 'company'],
  },
  // Company financials (changes yearly)
  financials: {
    revalidate: 86400, // 24 hours
    tags: (orgNr: string) => [`financials-${orgNr}`, 'financials'],
  },
  // Company people (board, CEO - changes quarterly)
  people: {
    revalidate: 7200, // 2 hours
    tags: (orgNr: string) => [`people-${orgNr}`, 'people'],
  },
  // Search results (transient)
  search: {
    revalidate: 1800, // 30 minutes
    tags: (query: string) => [`search-${query}`, 'search'],
  },
} as const;

/**
 * Create cached function for Bolagsverket API calls
 */
export function createCachedBolagFetch<T>(
  fn: (...args: any[]) => Promise<T>,
  cacheKey: string,
  revalidate: number,
  getTags: (...args: any[]) => string[]
) {
  return unstable_cache(
    fn,
    [cacheKey],
    {
      revalidate,
      tags: getTags as any,
    }
  );
}

/**
 * Cache helpers for common operations
 */
export const cachedBolag = {
  /**
   * Cache company info fetch
   */
  getCompanyInfo: <T>(
    orgNr: string,
    fetcher: () => Promise<T>
  ) => {
    return unstable_cache(
      fetcher,
      [`company-info-${orgNr}`],
      {
        revalidate: CACHE_CONFIG.companyInfo.revalidate,
        tags: CACHE_CONFIG.companyInfo.tags(orgNr),
      }
    )();
  },

  /**
   * Cache financial data fetch
   */
  getFinancials: <T>(
    orgNr: string,
    fetcher: () => Promise<T>
  ) => {
    return unstable_cache(
      fetcher,
      [`financials-${orgNr}`],
      {
        revalidate: CACHE_CONFIG.financials.revalidate,
        tags: CACHE_CONFIG.financials.tags(orgNr),
      }
    )();
  },

  /**
   * Cache people data fetch
   */
  getPeople: <T>(
    orgNr: string,
    fetcher: () => Promise<T>
  ) => {
    return unstable_cache(
      fetcher,
      [`people-${orgNr}`],
      {
        revalidate: CACHE_CONFIG.people.revalidate,
        tags: CACHE_CONFIG.people.tags(orgNr),
      }
    )();
  },

  /**
   * Cache search results
   */
  search: <T>(
    query: string,
    fetcher: () => Promise<T>
  ) => {
    return unstable_cache(
      fetcher,
      [`search-${query}`],
      {
        revalidate: CACHE_CONFIG.search.revalidate,
        tags: CACHE_CONFIG.search.tags(query),
      }
    )();
  },
};

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  /**
   * Invalidate all company caches
   */
  company: async (orgNr: string) => {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(`company-${orgNr}`, '/');
  },

  /**
   * Invalidate specific cache type
   */
  type: async (type: keyof typeof CACHE_CONFIG, identifier: string) => {
    const { revalidateTag } = await import('next/cache');
    const tags = CACHE_CONFIG[type].tags(identifier);
    for (const tag of tags) {
      revalidateTag(tag, '/');
    }
  },

  /**
   * Invalidate all caches of a type
   */
  allOfType: async (type: keyof typeof CACHE_CONFIG) => {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(type, '/');
  },
};
