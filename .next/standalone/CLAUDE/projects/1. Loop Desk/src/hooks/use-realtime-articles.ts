"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getSupabaseClient, RealtimeArticle } from "@/lib/supabase";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

interface UseRealtimeArticlesOptions {
  onNewArticle?: (article: RealtimeArticle) => void;
  onArticleDeleted?: (articleId: string) => void;
  onArticleUpdated?: (article: RealtimeArticle) => void;
  onNewArticlesCount?: (count: number) => void;
  onStatusChange?: (status: "connecting" | "connected" | "error") => void;
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time article updates via Supabase Realtime
 *
 * Uses Postgres CDC (Change Data Capture) to listen for INSERT, UPDATE, and DELETE
 * events on the Article table and notify when articles change.
 *
 * Supports both build-time and runtime Supabase configuration.
 */
export function useRealtimeArticles({
  onNewArticle,
  onArticleDeleted,
  onArticleUpdated,
  onNewArticlesCount,
  onStatusChange,
  enabled = true,
}: UseRealtimeArticlesOptions = {}) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
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

  // Initialize Supabase client (supports runtime config)
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    onStatusChange?.("connecting");

    async function initClient() {
      const supabaseClient = await getSupabaseClient();
      if (mounted && supabaseClient) {
        setClient(supabaseClient);
      } else if (mounted) {
        console.warn("[Realtime] Supabase not configured, skipping realtime subscription");
        onStatusChange?.("error");
      }
    }

    initClient();

    return () => {
      mounted = false;
    };
  }, [enabled, onStatusChange]);

  // Subscribe to Article changes when client is ready
  useEffect(() => {
    if (!enabled || !client) return;

    let active = true;

    // Create channel for Article table changes (all events)
    const channel = client
      .channel("article-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Article",
        },
        (payload) => {
          const eventType = payload.eventType;

          if (eventType === "INSERT") {
            console.log("[Realtime] New article:", payload.new?.title);
            if (onNewArticle && payload.new) {
              onNewArticle(payload.new as RealtimeArticle);
            }
            newArticleCountRef.current++;
            if (batchTimeoutRef.current) {
              clearTimeout(batchTimeoutRef.current);
            }
            batchTimeoutRef.current = setTimeout(notifyBatch, 2000);
          } else if (eventType === "DELETE") {
            console.log("[Realtime] Article deleted:", payload.old?.id);
            if (onArticleDeleted && payload.old?.id) {
              onArticleDeleted(payload.old.id as string);
            }
          } else if (eventType === "UPDATE") {
            console.log("[Realtime] Article updated:", payload.new?.title);
            if (onArticleUpdated && payload.new) {
              onArticleUpdated(payload.new as RealtimeArticle);
            }
          }
        }
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] Subscribed to Article changes (INSERT/UPDATE/DELETE)");
          onStatusChange?.("connected");
        } else if (status === "CHANNEL_ERROR") {
          console.error("[Realtime] Failed to subscribe to Article changes");
          onStatusChange?.("error");
        } else if (status === "TIMED_OUT" || status === "CLOSED") {
          onStatusChange?.("error");
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      active = false;
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      if (channelRef.current && client) {
        client.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, client, onNewArticle, onArticleDeleted, onArticleUpdated, notifyBatch, onStatusChange]);

  // Return function to manually unsubscribe
  return {
    unsubscribe: () => {
      if (channelRef.current && client) {
        client.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    },
  };
}
