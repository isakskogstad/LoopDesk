import { createClient } from '@supabase/supabase-js';

// Supabase client for browser (uses anon key)
// These are public values, safe to expose in frontend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

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
