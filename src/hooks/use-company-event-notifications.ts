"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { useNotifications, detectEventCategory } from "./use-notifications";

interface Announcement {
  id: string;
  subject: string;
  type: string | null;
  detailText: string | null;
  fullText: string | null;
  publishedAt: string | null;
  orgNumber: string | null;
}

interface ProtocolPurchase {
  id: number;
  orgNumber: string;
  companyName: string | null;
  eventType: string | null;
  aiSummary: string | null;
  protocolDate: string;
}

interface UseCompanyEventNotificationsOptions {
  enabled?: boolean;
  onStatusChange?: (status: "connecting" | "connected" | "error") => void;
}

/**
 * Hook to subscribe to company event notifications via Supabase Realtime.
 *
 * Listens for:
 * - New Announcements (kungörelser from Bolagsverket)
 * - New ProtocolPurchases (bolagshändelser with AI analysis)
 *
 * And triggers browser/Mac notifications for critical events like
 * konkurs, likvidation, fusion, emission.
 */
export function useCompanyEventNotifications({
  enabled = true,
  onStatusChange,
}: UseCompanyEventNotificationsOptions = {}) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const announcementChannelRef = useRef<RealtimeChannel | null>(null);
  const protocolChannelRef = useRef<RealtimeChannel | null>(null);

  const {
    notify,
    shouldNotify,
    permission,
    settings,
  } = useNotifications();

  // Handle new announcement
  const handleNewAnnouncement = useCallback((announcement: Announcement) => {
    // Detect category from announcement type or text
    const category = detectEventCategory(
      `${announcement.type || ""} ${announcement.detailText || ""} ${announcement.fullText || ""}`
    );

    if (!shouldNotify(category)) {
      console.log("[EventNotifications] Skipping notification for category:", category);
      return;
    }

    // Build notification
    const title = category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)}: ${announcement.subject}`
      : `Ny kungörelse: ${announcement.subject}`;

    const body = announcement.detailText || announcement.type || "Ny bolagshändelse registrerad";

    notify({
      title,
      body,
      category,
      url: `/bolaghandelser?highlight=${announcement.id}`,
      icon: "/icon-192.png",
    });

    console.log("[EventNotifications] Sent notification for:", title);
  }, [notify, shouldNotify]);

  // Handle new protocol purchase
  const handleNewProtocolPurchase = useCallback((protocol: ProtocolPurchase) => {
    const category = protocol.eventType?.toLowerCase() || null;

    if (!shouldNotify(category)) {
      console.log("[EventNotifications] Skipping notification for eventType:", category);
      return;
    }

    const title = protocol.eventType
      ? `${protocol.eventType}: ${protocol.companyName || protocol.orgNumber}`
      : `Bolagshändelse: ${protocol.companyName || protocol.orgNumber}`;

    const body = protocol.aiSummary || `Ny händelse registrerad för ${protocol.companyName || protocol.orgNumber}`;

    notify({
      title,
      body,
      category,
      url: `/bolag/${protocol.orgNumber}?tab=events`,
      icon: "/icon-192.png",
    });

    console.log("[EventNotifications] Sent notification for:", title);
  }, [notify, shouldNotify]);

  // Initialize Supabase client
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    onStatusChange?.("connecting");

    async function initClient() {
      const supabaseClient = await getSupabaseClient();
      if (mounted && supabaseClient) {
        setClient(supabaseClient);
      } else if (mounted) {
        console.warn("[EventNotifications] Supabase not configured");
        onStatusChange?.("error");
      }
    }

    initClient();

    return () => {
      mounted = false;
    };
  }, [enabled, onStatusChange]);

  // Subscribe to Announcement changes
  useEffect(() => {
    if (!enabled || !client || permission !== "granted" || !settings.enabled) return;

    let active = true;

    // Subscribe to Announcement inserts
    const announcementChannel = client
      .channel("announcement-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Announcement",
        },
        (payload) => {
          if (payload.new) {
            handleNewAnnouncement(payload.new as Announcement);
          }
        }
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") {
          console.log("[EventNotifications] Subscribed to Announcement changes");
        }
      });

    announcementChannelRef.current = announcementChannel;

    return () => {
      active = false;
      if (announcementChannelRef.current && client) {
        client.removeChannel(announcementChannelRef.current);
        announcementChannelRef.current = null;
      }
    };
  }, [enabled, client, permission, settings.enabled, handleNewAnnouncement]);

  // Subscribe to ProtocolPurchase changes
  useEffect(() => {
    if (!enabled || !client || permission !== "granted" || !settings.enabled) return;

    let active = true;

    // Subscribe to ProtocolPurchase inserts
    const protocolChannel = client
      .channel("protocol-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ProtocolPurchase",
        },
        (payload) => {
          if (payload.new) {
            handleNewProtocolPurchase(payload.new as ProtocolPurchase);
          }
        }
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") {
          console.log("[EventNotifications] Subscribed to ProtocolPurchase changes");
          onStatusChange?.("connected");
        } else if (status === "CHANNEL_ERROR") {
          onStatusChange?.("error");
        }
      });

    protocolChannelRef.current = protocolChannel;

    return () => {
      active = false;
      if (protocolChannelRef.current && client) {
        client.removeChannel(protocolChannelRef.current);
        protocolChannelRef.current = null;
      }
    };
  }, [enabled, client, permission, settings.enabled, handleNewProtocolPurchase, onStatusChange]);

  // Return unsubscribe function only (avoid ref access during render)
  return {
    unsubscribe: () => {
      if (announcementChannelRef.current && client) {
        client.removeChannel(announcementChannelRef.current);
        announcementChannelRef.current = null;
      }
      if (protocolChannelRef.current && client) {
        client.removeChannel(protocolChannelRef.current);
        protocolChannelRef.current = null;
      }
    },
  };
}
