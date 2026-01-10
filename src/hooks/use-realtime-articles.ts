"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase, RealtimeArticle } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeArticlesOptions {
  onNewArticle?: (article: RealtimeArticle) => void;
  onNewArticlesCount?: (count: number) => void;
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time article updates via Supabase Realtime
 *
 * Uses Postgres CDC (Change Data Capture) to listen for INSERT events
 * on the Article table and notify when new articles arrive.
 */
export function useRealtimeArticles({
  onNewArticle,
  onNewArticlesCount,
  enabled = true,
}: UseRealtimeArticlesOptions = {}) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const newArticleCountRef = useRef(0);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Batch notifications to avoid too many re-renders
  const notifyBatch = useCallback(() => {
    if (newArticleCountRef.current > 0 && onNewArticlesCount) {
      onNewArticlesCount(newArticleCountRef.current);
      newArticleCountRef.current = 0;
    }
  }, [onNewArticlesCount]);

  useEffect(() => {
    if (!enabled) return;

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[Realtime] Supabase not configured, skipping realtime subscription");
      return;
    }

    // Create channel for Article table changes
    const channel = supabase
      .channel("article-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Article",
        },
        (payload) => {
          console.log("[Realtime] New article:", payload.new?.title);

          // Call individual article callback
          if (onNewArticle && payload.new) {
            onNewArticle(payload.new as RealtimeArticle);
          }

          // Increment batch counter
          newArticleCountRef.current++;

          // Debounce notifications (batch within 2 seconds)
          if (batchTimeoutRef.current) {
            clearTimeout(batchTimeoutRef.current);
          }
          batchTimeoutRef.current = setTimeout(notifyBatch, 2000);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] Subscribed to Article changes");
        } else if (status === "CHANNEL_ERROR") {
          console.error("[Realtime] Failed to subscribe to Article changes");
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, onNewArticle, notifyBatch]);

  // Return function to manually unsubscribe
  return {
    unsubscribe: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    },
  };
}
