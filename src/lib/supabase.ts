import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Type for Article from database
export interface RealtimeArticle {
  id: string;
  title: string;
  url: string;
  description: string | null;
  imageUrl: string | null;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  createdAt: string;
}

// Supabase config from build-time env vars
const buildTimeUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const buildTimeKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Static client for when env vars are available at build time
export const supabase: SupabaseClient | null =
  buildTimeUrl && buildTimeKey
    ? createClient(buildTimeUrl, buildTimeKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

// Check if Supabase is configured at build time
export const isSupabaseConfigured = Boolean(buildTimeUrl && buildTimeKey);

// Runtime client cache
let runtimeClient: SupabaseClient | null = null;
let runtimeConfigFetched = false;

/**
 * Get Supabase client - tries build-time first, then runtime config.
 * Returns null if not configured.
 */
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  // Return build-time client if available
  if (supabase) {
    return supabase;
  }

  // Return cached runtime client
  if (runtimeClient) {
    return runtimeClient;
  }

  // Only fetch runtime config once
  if (runtimeConfigFetched) {
    return null;
  }

  // Try to fetch runtime config (only in browser)
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/config/supabase');
      const config = await response.json();

      runtimeConfigFetched = true;

      if (config.configured && config.url && config.anonKey) {
        runtimeClient = createClient(config.url, config.anonKey, {
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        });
        console.log('[Supabase] Initialized via runtime config');
        return runtimeClient;
      }
    } catch (error) {
      console.warn('[Supabase] Failed to fetch runtime config:', error);
      runtimeConfigFetched = true;
    }
  }

  return null;
}
