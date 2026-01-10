import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client for browser (uses anon key)
// These are public values, safe to expose in frontend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if env vars are configured (avoids crash when not set)
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

// Check if Supabase Realtime is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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
