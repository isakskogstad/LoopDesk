"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, RefreshCw, Filter, Loader2, FileText, AlertTriangle, Users, TrendingUp, Merge, XCircle, Radio, Bell, BellOff, CheckCheck, Search, Calendar, X, LayoutList, LayoutGrid, ImageIcon } from "lucide-react";
import { CompanyLinkerProvider } from "@/components/company-linker";
import { EventItem } from "@/components/bolaghandelser/event-item";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabase";
import { useReadStatus } from "@/hooks/use-read-status";
import { useNotifications, detectEventCategory } from "@/hooks/use-notifications";
import { useVirtualizer } from "@tanstack/react-virtual";

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

interface ShareholderData {
  name: string;
  orgNumber?: string;
  shares: number;
  votes?: number;
  sharePercentage?: number;
  presentAtMeeting?: boolean;
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
    score?: number;
    severity?: string;
    confidence?: number;
    notis?: { titel?: string; sammanfattning?: string };
    faktaruta?: {
      stämmoDatum?: string;
      tid?: string;
      plats?: string;
      stämmoTyp?: string;
      händelse?: string;
      belopp?: string;
      pris_per_aktie?: string;
      nya_aktier?: string;
      utspädning?: string;
      investerare?: string[];
      personer?: string[];
    };
    signals?: string[];
    källa?: {
      typ?: string;
      bolag?: string;
      datum?: string;
      referens?: string;
    };
    artikel?: string;
    shareholders?: ShareholderData[];
    shareholderCount?: number;
    analyzedAt?: string;
  } | null;
}

interface ProtocolSearch {
  id: number;
  orgNumber: string;
  companyName: string;
  companyId: string;
  latestProtocolDate: string | null;
  protocolCount: number;
  lastSearch: string | null;
  createdAt: string;
}

// Unified feed item type
type FeedItem =
  | { type: "announcement"; data: Announcement; date: Date }
  | { type: "protocol"; data: Protocol; date: Date }
  | { type: "protocolSearch"; data: ProtocolSearch; date: Date };

// Important event categories with distinct visual styling
const IMPORTANT_CATEGORIES: Record<string, {
  keywords: string[];
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
  borderColor: string;
  gradientFrom: string;
}> = {
  konkurs: {
    keywords: ["konkurs", "konkursbeslut"],
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    borderColor: "border-l-red-500",
    gradientFrom: "from-red-500/10",
    label: "Konkurs",
    icon: <XCircle size={14} className="inline mr-1" />,
  },
  likvidation: {
    keywords: ["likvidation", "likvidator"],
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-l-orange-500",
    gradientFrom: "from-orange-500/10",
    label: "Likvidation",
    icon: <AlertTriangle size={14} className="inline mr-1" />,
  },
  fusion: {
    keywords: ["fusion", "sammanslagning"],
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-l-purple-500",
    gradientFrom: "from-purple-500/10",
    label: "Fusion",
    icon: <Merge size={14} className="inline mr-1" />,
  },
  emission: {
    keywords: ["nyemission", "fondemission", "riktad emission"],
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-l-blue-500",
    gradientFrom: "from-blue-500/10",
    label: "Emission",
    icon: <TrendingUp size={14} className="inline mr-1" />,
  },
  styrelse: {
    keywords: ["styrelse", "ledamot", "ordförande", "vd"],
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-l-green-500",
    gradientFrom: "from-green-500/10",
    label: "Styrelse",
    icon: <Users size={14} className="inline mr-1" />,
  },
};

// Date range presets for quick filtering
const DATE_PRESETS = [
  { label: "Idag", days: 0 },
  { label: "Senaste 24h", days: 1 },
  { label: "Denna vecka", days: 7 },
  { label: "Senaste månaden", days: 30 },
  { label: "Alla", days: -1 },
] as const;

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
function toFeedItems(
  announcements: Announcement[],
  protocols: Protocol[],
  protocolSearches: ProtocolSearch[] = []
): FeedItem[] {
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

  for (const ps of protocolSearches) {
    if (ps.latestProtocolDate) {
      items.push({ type: "protocolSearch", data: ps, date: new Date(ps.latestProtocolDate) });
    }
  }

  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items;
}

// Notification Settings Modal Component (#13)
function NotificationSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: { enabled: boolean; soundEnabled: boolean; criticalOnly: boolean; categories?: Record<string, boolean> };
  onUpdateSettings: (updates: Partial<typeof settings>) => void;
}) {
  const [localCategories, setLocalCategories] = useState<Record<string, boolean>>(
    settings.categories || {
      konkurs: true,
      likvidation: true,
      fusion: false,
      emission: false,
      styrelse: false,
    }
  );

  if (!isOpen) return null;

  const handleCategoryToggle = (key: string) => {
    const updated = { ...localCategories, [key]: !localCategories[key] };
    setLocalCategories(updated);
    onUpdateSettings({ categories: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-1">Notifikationsinställningar</h2>
        <p className="text-sm text-muted-foreground mb-6">Välj vilka händelser du vill få notiser om</p>

        {/* Master toggle */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium">Aktivera notiser</p>
            <p className="text-xs text-muted-foreground">Få push-notiser för bolagshändelser</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ enabled: !settings.enabled })}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.enabled ? "bg-primary" : "bg-secondary"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                settings.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium">Ljud</p>
            <p className="text-xs text-muted-foreground">Spela ljud vid nya händelser</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.soundEnabled ? "bg-primary" : "bg-secondary"
            }`}
            disabled={!settings.enabled}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                settings.soundEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Category toggles */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-3">Händelsekategorier</p>
          <div className="space-y-2">
            {Object.entries(IMPORTANT_CATEGORIES).map(([key, config]) => (
              <label
                key={key}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  localCategories[key] ? config.bgColor : "bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`p-1.5 rounded-lg ${config.bgColor} ${config.color}`}>
                    {config.icon}
                  </span>
                  <span className="font-medium">{config.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={localCategories[key]}
                  onChange={() => handleCategoryToggle(key)}
                  disabled={!settings.enabled}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    localCategories[key]
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {localCategories[key] && <CheckCheck size={12} />}
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          Spara
        </button>
      </div>
    </div>
  );
}

export default function BolaghandelserPage() {
  const { status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [protocolSearches, setProtocolSearches] = useState<ProtocolSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<number>(-1); // Days ago, -1 = all
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null); // For virtualization
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [_newAnnouncementIds, setNewAnnouncementIds] = useState<Set<string>>(new Set()); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1); // Keyboard navigation (#8)
  const [layout, setLayout] = useState<"compact" | "standard" | "media">("standard"); // Layout switcher (#3)

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
      // Fetch all analyzed protocols (no date filter - we want to show all)
      const [announcementsRes, protocolsRes] = await Promise.all([
        fetch(`/api/kungorelser?limit=20`),
        fetch(`/api/protocols?limit=100`),
      ]);

      if (announcementsRes.ok) {
        const data = await announcementsRes.json();
        setAnnouncements(data.announcements || []);
        setNextCursor(data.nextCursor || null);
        setHasMore(data.hasMore ?? false);
      }

      if (protocolsRes.ok) {
        const data = await protocolsRes.json();
        console.log("[bolaghandelser] Protocols API response:", {
          protocolsCount: data.protocols?.length,
          protocolSearchesCount: data.protocolSearches?.length,
          firstProtocolSearch: data.protocolSearches?.[0],
        });
        setProtocols(data.protocols || []);
        setProtocolSearches(data.protocolSearches || []);
      } else {
        console.error("[bolaghandelser] Protocols API failed:", protocolsRes.status, await protocolsRes.text());
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

  // Auto-refresh every 30 seconds - only when realtime is NOT connected (#7)
  useEffect(() => {
    if (status !== "authenticated" || debouncedQuery) return;
    // Skip auto-refresh if realtime is working (saves resources)
    if (realtimeStatus === "connected") return;
    const interval = setInterval(() => loadAnnouncements(), 30000);
    return () => clearInterval(interval);
  }, [status, loadAnnouncements, debouncedQuery, realtimeStatus]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Server-side search when query changes
  useEffect(() => {
    if (status !== "authenticated") return;

    async function searchAnnouncements() {
      if (!debouncedQuery) {
        // If query is empty, reload normal data
        loadAnnouncements();
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/kungorelser?query=${encodeURIComponent(debouncedQuery)}&limit=100`);
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements || []);
          setNextCursor(null);
          setHasMore(false); // Disable pagination during search
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }

    searchAnnouncements();
  }, [debouncedQuery, status, loadAnnouncements]);

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

  // Subscribe to realtime updates for Announcements and ProtocolPurchase
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let announcementChannel: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let protocolChannel: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let supabaseClient: any = null;

    async function setupRealtime() {
      supabaseClient = await getSupabaseClient();
      if (!supabaseClient) {
        setRealtimeStatus("error");
        return;
      }

      // Channel for Announcements
      announcementChannel = supabaseClient
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: { new: any }) => {
            const updated = payload.new as Announcement;
            setAnnouncements((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          }
        )
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            setRealtimeStatus("connected");
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setRealtimeStatus("error");
          }
        });

      // Channel for ProtocolPurchase (new protocols with AI analysis)
      protocolChannel = supabaseClient
        .channel("protocols-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "ProtocolPurchase",
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: { new: any }) => {
            const newProtocol = payload.new as Protocol;
            setProtocols((prev) => {
              // Avoid duplicates
              if (prev.some((p) => p.id === newProtocol.id)) {
                return prev;
              }
              // Add to beginning (newest first)
              return [newProtocol, ...prev];
            });

            // Send push notification for new protocols with high score
            const score = newProtocol.aiDetails?.score || 0;
            if (score >= 7 && notificationSettings.enabled) {
              const companyName = newProtocol.companyName || "Okänt bolag";
              const eventType = newProtocol.eventType || "Protokoll";
              notify({
                title: `${eventType}: ${companyName}`,
                body: newProtocol.aiDetails?.notis?.sammanfattning || "Nytt intressant protokoll",
                category: "protokoll",
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
            table: "ProtocolPurchase",
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: { new: any }) => {
            const updated = payload.new as Protocol;
            setProtocols((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
          }
        )
        .subscribe();
    }

    setupRealtime();

    return () => {
      if (announcementChannel && supabaseClient) {
        supabaseClient.removeChannel(announcementChannel);
      }
      if (protocolChannel && supabaseClient) {
        supabaseClient.removeChannel(protocolChannel);
      }
    };
  }, [notify, shouldNotify, notificationSettings.enabled]);

  // Merge and filter feed items - memoized (#6) - MUST be before early returns
  const feedItems = useMemo(
    () => toFeedItems(announcements, protocols, protocolSearches),
    [announcements, protocols, protocolSearches]
  );

  // Memoized event IDs for unread tracking (#6)
  const eventIds = useMemo(
    () => feedItems.map(item => item.type === "announcement" ? `a-${item.data.id}` : `p-${item.data.id}`),
    [feedItems]
  );

  // Memoized unread count - calculated once, not 3 times in JSX (#6)
  const currentUnreadCount = useMemo(
    () => unreadCount(eventIds),
    [unreadCount, eventIds]
  );

  // Date filter calculation (#15)
  const dateFilterCutoff = useMemo(() => {
    if (dateFilter === -1) return null;
    const cutoff = new Date();
    if (dateFilter === 0) {
      cutoff.setHours(0, 0, 0, 0); // Start of today
    } else {
      cutoff.setDate(cutoff.getDate() - dateFilter);
    }
    return cutoff;
  }, [dateFilter]);

  const filteredItems = useMemo(() => {
    return feedItems.filter((item) => {
      // Date filter (#15)
      if (dateFilterCutoff && item.date < dateFilterCutoff) {
        return false;
      }

      if (item.type === "announcement") {
        const a = item.data;
        if (filter) {
          if (filter === "protokoll") return false;
          const cat = detectCategory(a);
          if (cat !== filter) return false;
        }
        // Server-side search handles announcements - no client filtering needed
      } else if (item.type === "protocol") {
        const p = item.data;
        if (filter && filter !== "protokoll") return false;
        if (filter === "protokoll") return true;
        // Client-side search for protocols (not searched server-side)
        if (debouncedQuery) {
          const query = debouncedQuery.toLowerCase();
          const text = `${p.companyName || ""} ${p.orgNumber || ""} ${p.aiSummary || ""}`.toLowerCase();
          if (!text.includes(query)) return false;
        }
      } else if (item.type === "protocolSearch") {
        const ps = item.data;
        if (filter && filter !== "protokoll") return false;
        if (filter === "protokoll") return true;
        // Client-side search for protocol searches
        if (debouncedQuery) {
          const query = debouncedQuery.toLowerCase();
          const text = `${ps.companyName || ""} ${ps.orgNumber || ""}`.toLowerCase();
          if (!text.includes(query)) return false;
        }
      }
      return true;
    });
  }, [feedItems, filter, debouncedQuery, dateFilterCutoff]);

  const grouped = useMemo(() => groupByDay(filteredItems), [filteredItems]);

  // Flatten grouped items for virtualization (#8)
  const flattenedItems = useMemo(() => {
    const result: Array<{ type: "header"; label: string; count: number } | { type: "event"; item: FeedItem }> = [];
    for (const group of grouped) {
      result.push({ type: "header", label: group.label, count: group.items.length });
      for (const item of group.items) {
        result.push({ type: "event", item });
      }
    }
    return result;
  }, [grouped]);

  // Virtual list for performance (#8)
  const rowVirtualizer = useVirtualizer({
    count: flattenedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = flattenedItems[index];
      return item?.type === "header" ? 40 : 120; // Headers are smaller
    },
    overscan: 5,
  });

  // Build map of events by orgNumber for related events feature (#14)
  const eventsByOrgNumber = useMemo(() => {
    const map = new Map<string, Array<{
      id: string | number;
      type: "announcement" | "protocol" | "protocolSearch";
      title: string;
      date: Date;
      eventType?: string | null;
    }>>();

    for (const item of feedItems) {
      let orgNum: string | undefined;
      let title: string;
      let eventType: string | null = null;

      if (item.type === "announcement") {
        orgNum = item.data.orgNumber?.replace(/\D/g, "");
        title = item.data.subject || "Kungörelse";
      } else if (item.type === "protocol") {
        orgNum = item.data.orgNumber?.replace(/\D/g, "");
        title = item.data.aiDetails?.notis?.titel || item.data.companyName || "Protokoll";
        eventType = item.data.eventType;
      } else {
        orgNum = item.data.orgNumber?.replace(/\D/g, "");
        title = `Protokoll från ${item.data.companyName || "bolag"}`;
      }

      if (orgNum) {
        if (!map.has(orgNum)) {
          map.set(orgNum, []);
        }
        map.get(orgNum)!.push({
          id: item.data.id,
          type: item.type,
          title,
          date: item.date,
          eventType,
        });
      }
    }

    return map;
  }, [feedItems]);

  // Helper function to get related events for an item
  const getRelatedEvents = useCallback((item: FeedItem) => {
    let orgNum: string | undefined;
    if (item.type === "announcement") {
      orgNum = item.data.orgNumber?.replace(/\D/g, "");
    } else if (item.type === "protocol") {
      orgNum = item.data.orgNumber?.replace(/\D/g, "");
    } else {
      orgNum = item.data.orgNumber?.replace(/\D/g, "");
    }

    if (!orgNum) return undefined;

    const events = eventsByOrgNumber.get(orgNum);
    if (!events || events.length <= 1) return undefined;

    return events;
  }, [eventsByOrgNumber]);

  // Count important events
  const importantCounts = useMemo(() => Object.keys(IMPORTANT_CATEGORIES).reduce(
    (acc, key) => {
      acc[key] = announcements.filter((a) => detectCategory(a) === key).length;
      return acc;
    },
    {} as Record<string, number>
  ), [announcements]);

  const protocolCount = protocols.length + protocolSearches.length;

  // Keyboard navigation (#8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const totalEvents = filteredItems.length;
      if (totalEvents === 0) return;

      switch (e.key) {
        case "ArrowDown":
        case "j": // Vim-style down
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev < totalEvents - 1 ? prev + 1 : prev;
            // Scroll focused item into view
            const element = document.querySelector(`[data-event-index="${next}"]`);
            element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return next;
          });
          break;

        case "ArrowUp":
        case "k": // Vim-style up
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : 0;
            const element = document.querySelector(`[data-event-index="${next}"]`);
            element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return next;
          });
          break;

        case "Enter":
        case "o": // Vim-style open
          if (focusedIndex >= 0 && focusedIndex < totalEvents) {
            e.preventDefault();
            // Click the focused item to expand it
            const element = document.querySelector(`[data-event-index="${focusedIndex}"]`);
            if (element instanceof HTMLElement) {
              element.click();
            }
          }
          break;

        case "r": // Mark as read
          if (focusedIndex >= 0 && focusedIndex < totalEvents) {
            e.preventDefault();
            const item = filteredItems[focusedIndex];
            const eventId = item.type === "announcement"
              ? `a-${item.data.id}`
              : item.type === "protocol"
              ? `p-${item.data.id}`
              : `ps-${item.data.id}`;
            markAsRead(eventId);
          }
          break;

        case "Escape":
          e.preventDefault();
          setFocusedIndex(-1);
          break;

        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          document.querySelector('[data-event-index="0"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
          break;

        case "End":
          e.preventDefault();
          setFocusedIndex(totalEvents - 1);
          document.querySelector(`[data-event-index="${totalEvents - 1}"]`)?.scrollIntoView({ behavior: "smooth", block: "end" });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, focusedIndex, markAsRead]);

  // Show loading while checking auth - AFTER all hooks
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

  return (
    <CompanyLinkerProvider>
      <main className="min-h-screen bg-background">
        {/* Luftigare layout med smalare innehållsbredd (#1) */}
        <div className="max-w-2xl mx-auto px-6 py-10 sm:py-14">
          {/* Editorial Header (#2) */}
          <header className="mb-10 sm:mb-14">
            {/* Kategori-etikett */}
            <span className="block mb-3 text-[11px] font-semibold tracking-[0.15em] uppercase text-rose-500">
              Bolagshändelser
            </span>

            {/* Huvudrubrik med serif */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-[42px] font-normal tracking-tight leading-[1.08] text-foreground">
              Senaste händelserna
            </h1>

            {/* Kursiv ingress */}
            <p className="mt-4 text-lg sm:text-xl font-serif italic text-muted-foreground leading-relaxed">
              Konkurser, emissioner och styrelsebeslut – samlade på ett ställe.
            </p>

            {/* Status och actions */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    realtimeStatus === "connected"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : realtimeStatus === "error"
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}
                  title={
                    realtimeStatus === "connected"
                      ? "Uppdateras i realtid"
                      : realtimeStatus === "error"
                      ? "Realtidsanslutning misslyckades"
                      : "Ansluter..."
                  }
                >
                  <Radio size={10} className={`${realtimeStatus === "connected" ? "motion-safe:animate-pulse" : ""}`} />
                  {realtimeStatus === "connected" ? "Live" : realtimeStatus === "error" ? "Offline" : "..."}
                </span>
                {/* Unread count badge */}
                {currentUnreadCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500 text-white">
                    {currentUnreadCount} olästa
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Mark all as read button */}
                {currentUnreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead(eventIds)}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl transition-all duration-200"
                    title="Markera alla som lästa"
                  >
                    <CheckCheck size={14} />
                    <span>Markera lästa</span>
                  </button>
                )}
                {/* Notification settings button */}
                {notificationsSupported && (
                  <button
                    onClick={() => {
                      if (notificationPermission !== "granted") {
                        requestPermission().then((granted) => {
                          if (granted) setShowNotificationSettings(true);
                        });
                      } else {
                        setShowNotificationSettings(true);
                      }
                    }}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      notificationPermission === "granted" && notificationSettings.enabled
                        ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                        : "text-muted-foreground hover:bg-secondary/80"
                    }`}
                    title="Notifikationsinställningar"
                  >
                    {notificationPermission === "granted" && notificationSettings.enabled ? (
                      <Bell size={18} />
                    ) : (
                      <BellOff size={18} />
                    )}
                  </button>
                )}
                {/* Layout switcher */}
                <div className="hidden sm:flex items-center border border-border/50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setLayout("compact")}
                    className={`p-2 transition-all duration-200 ${
                      layout === "compact"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                    title="Kompakt vy"
                  >
                    <LayoutList size={16} />
                  </button>
                  <button
                    onClick={() => setLayout("standard")}
                    className={`p-2 transition-all duration-200 ${
                      layout === "standard"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                    title="Standard vy"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setLayout("media")}
                    className={`p-2 transition-all duration-200 ${
                      layout === "media"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                    title="Media vy"
                  >
                    <ImageIcon size={16} />
                  </button>
                </div>
                <button
                  onClick={() => loadAnnouncements(true)}
                  disabled={refreshing}
                  className="p-2.5 hover:bg-secondary/80 rounded-xl transition-all duration-200"
                  title="Uppdatera"
                >
                  <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </header>

          {/* Minimalistisk sök-input (#9) */}
          <div className="relative mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök bland händelser..."
              className="w-full py-4 px-5 pr-12 text-base bg-secondary/40 border-0 rounded-2xl
                         placeholder:text-muted-foreground/50
                         focus:ring-2 focus:ring-rose-500/20 focus:bg-background focus:outline-none
                         transition-all duration-200"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40">
              {isSearching ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </div>
          </div>

          {/* Date filter presets - renare design */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1 -mx-6 px-6">
            <Calendar size={14} className="text-muted-foreground/60 flex-shrink-0" />
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.days}
                onClick={() => setDateFilter(preset.days)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  dateFilter === preset.days
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Filter badges - enbart röd accent för kategorier (#8) */}
          <div className="flex items-center gap-2 mb-8 text-sm overflow-x-auto scrollbar-hide pb-1 -mx-6 px-6 snap-x snap-mandatory">
            <div className="px-3.5 py-2 bg-secondary/50 rounded-xl flex-shrink-0 snap-start flex items-center">
              <span className="font-medium">{filteredItems.length}</span>
              <span className="text-muted-foreground ml-1.5 hidden sm:inline">händelser</span>
            </div>
            {protocolCount > 0 && (
              <button
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex-shrink-0 snap-start flex items-center gap-1.5 ${
                  filter === "protokoll"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                }`}
                onClick={() => setFilter(filter === "protokoll" ? null : "protokoll")}
              >
                <FileText size={14} />
                <span className="font-medium">{protocolCount}</span>
              </button>
            )}
            {Object.entries(importantCounts)
              .filter(([, count]) => count > 0)
              .map(([key, count]) => (
                <button
                  key={key}
                  className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex-shrink-0 snap-start flex items-center gap-1.5 ${
                    filter === key
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                  }`}
                  onClick={() => setFilter(filter === key ? null : key)}
                >
                  <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{IMPORTANT_CATEGORIES[key].icon}</span>
                  <span className="font-medium">{count}</span>
                </button>
              ))}
            {(filter || dateFilter !== -1) && (
              <button
                onClick={() => {
                  setFilter(null);
                  setDateFilter(-1);
                }}
                className="px-3.5 py-2 bg-secondary/50 hover:bg-secondary rounded-xl text-xs font-medium flex items-center gap-1.5 flex-shrink-0 transition-all duration-200"
              >
                <X size={14} />
                <span className="hidden sm:inline">Rensa filter</span>
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
              <p className="font-medium">
                {debouncedQuery ? `Inga träffar för "${debouncedQuery}"` : "Inga händelser än"}
              </p>
              <p className="text-sm mt-1">
                {debouncedQuery
                  ? "Försök med ett annat sökord eller töm sökningen"
                  : filter || dateFilter !== -1
                    ? "Inga händelser matchar valda filter"
                    : "Händelser från mac-appen visas här automatiskt"}
              </p>
            </div>
          ) : flattenedItems.length < 50 ? (
            /* Standard rendering for small lists */
            <div className="flex flex-col">
              {(() => {
                let globalIndex = 0;
                return grouped.map((group) => (
                  <div key={group.label}>
                    {/* Day section header – Luftigare design (#3) */}
                    <div className="flex items-baseline gap-4 pt-10 pb-5 first:pt-0">
                      <span className="text-xs font-semibold tracking-[0.12em] uppercase text-rose-500">
                        {group.label}
                      </span>
                      <span className="text-sm text-muted-foreground/50">
                        {group.items.length} händelse{group.items.length !== 1 && "r"}
                      </span>
                    </div>

                    {/* Events */}
                    <div className="flex flex-col divide-y divide-border/30">
                      {group.items.map((item) => {
                        const currentIndex = globalIndex++;
                        const eventId = item.type === "announcement"
                          ? `a-${item.data.id}`
                          : item.type === "protocol"
                          ? `p-${item.data.id}`
                          : `ps-${item.data.id}`;
                        return (
                          <div key={eventId} data-event-index={currentIndex}>
                            <EventItem
                              event={
                                item.type === "announcement"
                                  ? { type: "announcement", data: item.data }
                                  : item.type === "protocol"
                                  ? { type: "protocol", data: item.data }
                                  : { type: "protocolSearch", data: item.data }
                              }
                              date={item.date}
                              showGradientLine={true}
                              isUnread={!isRead(eventId)}
                              onMarkAsRead={() => markAsRead(eventId)}
                              relatedEvents={getRelatedEvents(item)}
                              searchQuery={debouncedQuery}
                              isFocused={focusedIndex === currentIndex}
                              layout={layout}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}

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
          ) : (
            /* Virtualized rendering for large lists (#8) */
            <div
              ref={parentRef}
              className="h-[calc(100vh-300px)] overflow-auto"
              style={{ contain: "strict" }}
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const flatItem = flattenedItems[virtualRow.index];

                  if (flatItem.type === "header") {
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className="flex items-center gap-4 py-2">
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {flatItem.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">
                            {flatItem.count} {flatItem.count === 1 ? "händelse" : "händelser"}
                          </span>
                          <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                        </div>
                      </div>
                    );
                  }

                  const item = flatItem.item;
                  const eventId = item.type === "announcement"
                    ? `a-${item.data.id}`
                    : item.type === "protocol"
                    ? `p-${item.data.id}`
                    : `ps-${item.data.id}`;

                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <EventItem
                        event={
                          item.type === "announcement"
                            ? { type: "announcement", data: item.data }
                            : item.type === "protocol"
                            ? { type: "protocol", data: item.data }
                            : { type: "protocolSearch", data: item.data }
                        }
                        date={item.date}
                        showGradientLine={true}
                        isUnread={!isRead(eventId)}
                        onMarkAsRead={() => markAsRead(eventId)}
                        relatedEvents={getRelatedEvents(item)}
                        searchQuery={debouncedQuery}
                        layout={layout}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Load more trigger at bottom */}
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

        {/* Notification Settings Modal (#13) */}
        <NotificationSettingsModal
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
          settings={notificationSettings}
          onUpdateSettings={updateNotificationSettings}
        />
      </main>
    </CompanyLinkerProvider>
  );
}
