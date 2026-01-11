"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, RefreshCw, Filter, Loader2, FileText, AlertTriangle, Users, TrendingUp, Merge, XCircle, Radio, Bell, BellOff, CheckCheck } from "lucide-react";
import { CompanyLinkerProvider } from "@/components/company-linker";
import { EventItem } from "@/components/bolaghandelser/event-item";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabase";
import { useReadStatus } from "@/hooks/use-read-status";
import { useNotifications, detectEventCategory } from "@/hooks/use-notifications";

interface Announcement {
  id: string;
  type?: string;
  subject: string;
  orgNumber?: string;
  detailText?: string;
  pubDate?: string;
  publishedAt?: string;
  scrapedAt?: string;
}

interface Protocol {
  id: number;
  orgNumber: string;
  companyName: string | null;
  protocolDate: string;
  purchaseDate: string;
  pdfUrl: string | null;
  eventType: string | null;
  aiSummary: string | null;
  aiDetails: {
    notis?: { titel?: string; sammanfattning?: string };
    rapport?: {
      brodtext?: string;
      faktaruta?: {
        stämmoDatum?: string;
        tid?: string;
        plats?: string;
        stämmoTyp?: string;
      };
    };
    severity?: string;
  } | null;
}

// Unified feed item type
type FeedItem =
  | { type: "announcement"; data: Announcement; date: Date }
  | { type: "protocol"; data: Protocol; date: Date };

// Important event categories
const IMPORTANT_CATEGORIES: Record<string, { keywords: string[]; color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  konkurs: {
    keywords: ["konkurs", "konkursbeslut"],
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Konkurs",
    icon: <XCircle size={14} className="inline mr-1" />,
  },
  likvidation: {
    keywords: ["likvidation", "likvidator"],
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    label: "Likvidation",
    icon: <AlertTriangle size={14} className="inline mr-1" />,
  },
  fusion: {
    keywords: ["fusion", "sammanslagning"],
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    label: "Fusion",
    icon: <Merge size={14} className="inline mr-1" />,
  },
  emission: {
    keywords: ["nyemission", "fondemission", "riktad emission"],
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "Emission",
    icon: <TrendingUp size={14} className="inline mr-1" />,
  },
  styrelse: {
    keywords: ["styrelse", "ledamot", "ordförande", "vd"],
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Styrelse",
    icon: <Users size={14} className="inline mr-1" />,
  },
};

function detectCategory(announcement: Announcement): string | null {
  const text = `${announcement.type || ""} ${announcement.detailText || ""} ${announcement.subject || ""}`.toLowerCase();
  for (const [key, config] of Object.entries(IMPORTANT_CATEGORIES)) {
    if (config.keywords.some((kw) => text.includes(kw))) {
      return key;
    }
  }
  return null;
}

function formatTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

// Group items by day
function groupByDay<T extends { date: Date }>(items: T[]): { label: string; items: T[] }[] {
  const now = new Date();
  const today = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Map<string, { label: string; items: T[]; sortKey: number }> = new Map();

  for (const item of items) {
    const dateStr = item.date.toDateString();

    let label: string;
    let sortKey: number;

    if (dateStr === today) {
      label = "Idag";
      sortKey = 0;
    } else if (dateStr === yesterdayStr) {
      label = "Igår";
      sortKey = 1;
    } else if (item.date > weekAgo) {
      label = "Denna vecka";
      sortKey = 2;
    } else {
      const monthYear = item.date.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
      label = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      sortKey = 100 - Math.floor((now.getTime() - item.date.getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    if (!groups.has(label)) {
      groups.set(label, { label, items: [], sortKey });
    }
    groups.get(label)!.items.push(item);
  }

  return Array.from(groups.values())
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ label, items }) => ({ label, items }));
}

// Convert announcements and protocols to unified feed items
function toFeedItems(announcements: Announcement[], protocols: Protocol[]): FeedItem[] {
  const items: FeedItem[] = [];

  for (const a of announcements) {
    const dateStr = a.publishedAt || a.pubDate;
    if (dateStr) {
      items.push({ type: "announcement", data: a, date: new Date(dateStr) });
    }
  }

  for (const p of protocols) {
    items.push({ type: "protocol", data: p, date: new Date(p.protocolDate) });
  }

  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items;
}

export default function BolaghandelserPage() {
  const { status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [newAnnouncementIds, setNewAnnouncementIds] = useState<Set<string>>(new Set());

  // Read status hook
  const { isRead, markAsRead, markAllAsRead, unreadCount } = useReadStatus();

  // Notifications hook
  const {
    permission: notificationPermission,
    settings: notificationSettings,
    isSupported: notificationsSupported,
    requestPermission,
    updateSettings: updateNotificationSettings,
    notify,
    shouldNotify
  } = useNotifications();

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/bolaghandelser");
    }
  }, [status, router]);

  // Load initial announcements and protocols
  const loadAnnouncements = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [announcementsRes, protocolsRes] = await Promise.all([
        fetch(`/api/kungorelser?limit=20`),
        fetch(`/api/protocols?limit=20`),
      ]);

      if (announcementsRes.ok) {
        const data = await announcementsRes.json();
        setAnnouncements(data.announcements || []);
        setNextCursor(data.nextCursor || null);
        setHasMore(data.hasMore ?? false);
      }

      if (protocolsRes.ok) {
        const data = await protocolsRes.json();
        setProtocols(data.protocols || []);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load more announcements
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return;

    setLoadingMore(true);
    try {
      const res = await fetch(`/api/kungorelser?limit=20&cursor=${nextCursor}`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(prev => [...prev, ...(data.announcements || [])]);
        setNextCursor(data.nextCursor || null);
        setHasMore(data.hasMore ?? false);
      }
    } catch (err) {
      console.error("Failed to load more announcements:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, nextCursor]);

  // Initial load
  useEffect(() => {
    if (status === "authenticated") {
      loadAnnouncements();
    }
  }, [status, loadAnnouncements]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(() => loadAnnouncements(), 30000);
    return () => clearInterval(interval);
  }, [status, loadAnnouncements]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  // Subscribe to realtime updates
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let supabaseClient: any = null;

    async function setupRealtime() {
      supabaseClient = await getSupabaseClient();
      if (!supabaseClient) {
        setRealtimeStatus("error");
        return;
      }

      channel = supabaseClient
        .channel("announcements-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "Announcement",
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: { new: any }) => {
            const newAnnouncement = payload.new as Announcement;
            setAnnouncements((prev) => {
              // Avoid duplicates
              if (prev.some((a) => a.id === newAnnouncement.id)) {
                return prev;
              }
              // Add to beginning (newest first)
              return [newAnnouncement, ...prev];
            });
            // Mark as new for highlight animation
            setNewAnnouncementIds((prev) => new Set(prev).add(newAnnouncement.id));
            // Remove highlight after 5 seconds
            setTimeout(() => {
              setNewAnnouncementIds((prev) => {
                const next = new Set(prev);
                next.delete(newAnnouncement.id);
                return next;
              });
            }, 5000);

            // Send push notification for critical events
            const eventText = `${newAnnouncement.type || ""} ${newAnnouncement.detailText || ""}`;
            const category = detectEventCategory(eventText);
            if (shouldNotify(category)) {
              const companyName = newAnnouncement.subject || "Okänt bolag";
              notify({
                title: category === "konkurs" ? `Konkurs: ${companyName}` : `${category?.charAt(0).toUpperCase()}${category?.slice(1)}: ${companyName}`,
                body: newAnnouncement.detailText?.slice(0, 100) || "Ny bolagshändelse",
                category,
                url: "/bolaghandelser",
              });
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "Announcement",
          },
          (payload) => {
            const updated = payload.new as Announcement;
            setAnnouncements((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setRealtimeStatus("connected");
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setRealtimeStatus("error");
          }
        });
    }

    setupRealtime();

    return () => {
      if (channel && supabaseClient) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [notify, shouldNotify]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Laddar...</div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Merge and filter feed items
  const feedItems = toFeedItems(announcements, protocols);

  const filteredItems = feedItems.filter((item) => {
    if (item.type === "announcement") {
      const a = item.data;
      if (filter) {
        if (filter === "protokoll") return false;
        const cat = detectCategory(a);
        if (cat !== filter) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const text = `${a.subject || ""} ${a.orgNumber || ""} ${a.detailText || ""}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
    } else {
      const p = item.data;
      if (filter && filter !== "protokoll") return false;
      if (filter === "protokoll") return true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const text = `${p.companyName || ""} ${p.orgNumber || ""} ${p.aiSummary || ""}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
    }
    return true;
  });

  const grouped = groupByDay(filteredItems);

  // Count important events
  const importantCounts = Object.keys(IMPORTANT_CATEGORIES).reduce(
    (acc, key) => {
      acc[key] = announcements.filter((a) => detectCategory(a) === key).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const protocolCount = protocols.length;

  return (
    <CompanyLinkerProvider>
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">Bolagshändelser</h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  realtimeStatus === "connected"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : realtimeStatus === "error"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
                title={
                  realtimeStatus === "connected"
                    ? "Uppdateras i realtid"
                    : realtimeStatus === "error"
                    ? "Realtidsanslutning misslyckades"
                    : "Ansluter..."
                }
              >
                <Radio size={10} className={realtimeStatus === "connected" ? "animate-pulse" : ""} />
                {realtimeStatus === "connected" ? "Live" : realtimeStatus === "error" ? "Offline" : "..."}
              </span>
              {/* Unread count badge */}
              {unreadCount(feedItems.map(item => item.type === "announcement" ? `a-${item.data.id}` : `p-${item.data.id}`)) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                  {unreadCount(feedItems.map(item => item.type === "announcement" ? `a-${item.data.id}` : `p-${item.data.id}`))} olästa
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Mark all as read button */}
              {unreadCount(feedItems.map(item => item.type === "announcement" ? `a-${item.data.id}` : `p-${item.data.id}`)) > 0 && (
                <button
                  onClick={() => markAllAsRead(feedItems.map(item => item.type === "announcement" ? `a-${item.data.id}` : `p-${item.data.id}`))}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  title="Markera alla som lästa"
                >
                  <CheckCheck size={14} />
                  <span>Markera lästa</span>
                </button>
              )}
              {/* Notification toggle */}
              {notificationsSupported && (
                <button
                  onClick={async () => {
                    if (notificationPermission !== "granted") {
                      await requestPermission();
                    } else {
                      updateNotificationSettings({ enabled: !notificationSettings.enabled });
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    notificationPermission === "granted" && notificationSettings.enabled
                      ? "text-primary bg-primary/10 hover:bg-primary/20"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                  title={
                    notificationPermission !== "granted"
                      ? "Aktivera notifikationer"
                      : notificationSettings.enabled
                      ? "Notifikationer aktiverade (klicka för att stänga av)"
                      : "Notifikationer avstängda (klicka för att aktivera)"
                  }
                >
                  {notificationPermission === "granted" && notificationSettings.enabled ? (
                    <Bell size={18} />
                  ) : (
                    <BellOff size={18} />
                  )}
                </button>
              )}
              {lastUpdated && (
                <span className="text-xs text-muted-foreground hidden lg:inline">
                  Uppdaterad {formatTime(lastUpdated.toISOString())}
                </span>
              )}
              <button
                onClick={() => loadAnnouncements(true)}
                disabled={refreshing}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Uppdatera"
              >
                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Stats/Filter badges */}
          <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
            <div className="px-3 py-1.5 bg-secondary rounded-lg">
              <span className="font-medium">{feedItems.length}</span>
              <span className="text-muted-foreground ml-1 hidden sm:inline">händelser</span>
            </div>
            {protocolCount > 0 && (
              <button
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === "protokoll"
                    ? "ring-2 ring-primary bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:ring-2 hover:ring-indigo-300"
                }`}
                onClick={() => setFilter(filter === "protokoll" ? null : "protokoll")}
              >
                <FileText size={14} className="inline mr-1" />
                <span className="font-medium">{protocolCount}</span>
              </button>
            )}
            {Object.entries(importantCounts)
              .filter(([, count]) => count > 0)
              .map(([key, count]) => (
                <button
                  key={key}
                  className={`px-3 py-1.5 rounded-lg transition-all ${IMPORTANT_CATEGORIES[key].bgColor} ${IMPORTANT_CATEGORIES[key].color} ${
                    filter === key ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-offset-1"
                  }`}
                  onClick={() => setFilter(filter === key ? null : key)}
                >
                  {IMPORTANT_CATEGORIES[key].icon}
                  <span className="font-medium">{count}</span>
                </button>
              ))}
          </div>

          {/* Search & Clear filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök bolag eller orgnummer..."
                className="w-full px-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {filter && (
              <button
                onClick={() => setFilter(null)}
                className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-sm flex items-center gap-2"
              >
                <Filter size={14} />
                <span className="hidden sm:inline">Rensa</span>
              </button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl border p-6 space-y-4 animate-in fade-in duration-300"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <Skeleton shimmer className="w-16 h-16 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton shimmer className="h-5 w-24" />
                        <Skeleton shimmer className="h-4 w-20" />
                      </div>
                      <Skeleton shimmer className="h-6 w-full" />
                      <Skeleton shimmer className="h-6 w-4/5" />
                    </div>
                  </div>
                  <Skeleton shimmer className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">Inga händelser än</p>
              <p className="text-sm mt-1">
                {filter || searchQuery
                  ? "Inga träffar med nuvarande filter"
                  : "Händelser från mac-appen visas här automatiskt"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {grouped.map((group) => (
                <div key={group.label}>
                  {/* Day section header */}
                  <div className="flex items-center gap-4 py-2 animate-in fade-in duration-500">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {group.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {group.items.length} {group.items.length === 1 ? "händelse" : "händelser"}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>

                  {/* Events */}
                  <div className="flex flex-col">
                    {group.items.map((item) => {
                      const eventId = item.type === "announcement" ? `a-${item.data.id}` : `p-${item.data.id}`;
                      return (
                        <EventItem
                          key={eventId}
                          event={item.type === "announcement" ? { type: "announcement", data: item.data } : { type: "protocol", data: item.data }}
                          date={item.date}
                          showGradientLine={true}
                          isUnread={!isRead(eventId)}
                          onMarkAsRead={() => markAsRead(eventId)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Load more indicator */}
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Laddar fler händelser...</span>
                  </div>
                )}
                {!hasMore && feedItems.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Alla {feedItems.length} händelser laddade
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </CompanyLinkerProvider>
  );
}
