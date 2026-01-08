"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, RefreshCw, ExternalLink, Filter, AlertTriangle, Loader2 } from "lucide-react";

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

// Helper to get logo URL from org number
function getLogoUrl(orgNumber: string | undefined): string | null {
  if (!orgNumber) return null;
  const digits = orgNumber.replace(/\D/g, "");
  return digits.length >= 10 ? `/logos/${digits}.png` : null;
}

// Important event categories to highlight
const IMPORTANT_CATEGORIES: Record<string, { keywords: string[]; color: string; label: string }> = {
  konkurs: {
    keywords: ["konkurs", "konkursbeslut"],
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    label: "Konkurs",
  },
  likvidation: {
    keywords: ["likvidation", "likvidator"],
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    label: "Likvidation",
  },
  fusion: {
    keywords: ["fusion", "sammanslagning"],
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    label: "Fusion",
  },
  emission: {
    keywords: ["nyemission", "emission", "aktiekapital"],
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    label: "Emission",
  },
  styrelse: {
    keywords: ["styrelse", "ledamot", "ordförande", "vd"],
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    label: "Styrelse",
  },
};

function detectCategory(announcement: Announcement): { category: string; color: string; label: string } | null {
  const text = `${announcement.type || ""} ${announcement.detailText || ""} ${announcement.subject || ""}`.toLowerCase();

  for (const [key, config] of Object.entries(IMPORTANT_CATEGORIES)) {
    if (config.keywords.some((kw) => text.includes(kw))) {
      return { category: key, ...config };
    }
  }
  return null;
}

function formatOrgNumber(org: string | undefined): string {
  if (!org) return "-";
  const digits = org.replace(/\D/g, "");
  return digits.length >= 6 ? `${digits.slice(0, 6)}-${digits.slice(6, 10)}` : digits;
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

function groupByDate(announcements: Announcement[]): Record<string, Announcement[]> {
  const groups: Record<string, Announcement[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const a of announcements) {
    const dateStr = a.publishedAt || a.pubDate;
    if (!dateStr) continue;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    let key: string;
    if (date.getTime() === today.getTime()) {
      key = "IDAG";
    } else if (date.getTime() === yesterday.getTime()) {
      key = "IGÅR";
    } else {
      key = date.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  }
  return groups;
}

export default function BolaghandelserPage() {
  const { status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/bolaghandelser");
    }
  }, [status, router]);

  // Load initial announcements
  const loadAnnouncements = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/kungorelser?limit=20`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
        setNextCursor(data.nextCursor || null);
        setHasMore(data.hasMore ?? false);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load more announcements (older ones)
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

  // Initial load - only when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      loadAnnouncements();
    }
  }, [status, loadAnnouncements]);

  // Auto-refresh every 30 seconds (only when authenticated)
  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(() => loadAnnouncements(), 30000);
    return () => clearInterval(interval);
  }, [status, loadAnnouncements]);

  // Infinite scroll - load more when reaching bottom
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

  // Handle logo error
  const handleLogoError = (orgNumber: string) => {
    setLogoErrors(prev => new Set(prev).add(orgNumber));
  };

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Laddar...</div>
      </main>
    );
  }

  // Will redirect in useEffect, but show nothing while redirecting
  if (status === "unauthenticated") {
    return null;
  }

  // Filter announcements
  const filteredAnnouncements = announcements.filter((a) => {
    // Category filter
    if (filter) {
      const cat = detectCategory(a);
      if (!cat || cat.category !== filter) return false;
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const text = `${a.subject || ""} ${a.orgNumber || ""} ${a.detailText || ""}`.toLowerCase();
      if (!text.includes(query)) return false;
    }
    return true;
  });

  const grouped = groupByDate(filteredAnnouncements);
  const groupKeys = Object.keys(grouped);

  // Count important events
  const importantCounts = Object.keys(IMPORTANT_CATEGORIES).reduce(
    (acc, key) => {
      acc[key] = announcements.filter((a) => detectCategory(a)?.category === key).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Bolagshändelser</h1>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
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

        {/* Stats */}
        <div className="flex items-center gap-3 mb-6 text-sm">
          <div className="px-3 py-1.5 bg-secondary rounded-lg">
            <span className="font-medium">{announcements.length}</span>
            <span className="text-muted-foreground ml-1">kungörelser</span>
          </div>
          {Object.entries(importantCounts)
            .filter(([, count]) => count > 0)
            .map(([key, count]) => (
              <div
                key={key}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-opacity ${
                  filter === key ? "ring-2 ring-primary" : ""
                } ${IMPORTANT_CATEGORIES[key].color}`}
                onClick={() => setFilter(filter === key ? null : key)}
              >
                <span className="font-medium">{count}</span>
                <span className="ml-1">{IMPORTANT_CATEGORIES[key].label}</span>
              </div>
            ))}
        </div>

        {/* Search & Filter */}
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
              Rensa filter
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw size={32} className="mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Laddar händelser...</p>
          </div>
        ) : groupKeys.length === 0 ? (
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
          <div className="space-y-6">
            {groupKeys.map((dateKey) => (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wider">
                    {dateKey}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {grouped[dateKey].length} händelser
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Announcements */}
                <div className="space-y-3">
                  {grouped[dateKey].map((announcement) => {
                    const category = detectCategory(announcement);
                    const isImportant = !!category;

                    return (
                      <div
                        key={announcement.id}
                        className={`flex gap-4 p-4 bg-card border rounded-xl hover:shadow-sm transition-shadow ${
                          isImportant ? "border-l-4 border-l-primary" : "border-border"
                        }`}
                      >
                        {/* Time */}
                        <div className="text-xs text-muted-foreground w-12 flex-shrink-0 pt-0.5">
                          {formatTime(announcement.publishedAt || announcement.pubDate)}
                        </div>

                        {/* Logo/Icon */}
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
                            isImportant && !getLogoUrl(announcement.orgNumber) ? category.color : "bg-secondary"
                          }`}
                        >
                          {(() => {
                            const logoUrl = getLogoUrl(announcement.orgNumber);
                            const orgDigits = announcement.orgNumber?.replace(/\D/g, "") || "";
                            const hasLogoError = logoErrors.has(orgDigits);

                            if (logoUrl && !hasLogoError) {
                              return (
                                <img
                                  src={logoUrl}
                                  alt=""
                                  className="w-full h-full object-contain p-1"
                                  onError={() => handleLogoError(orgDigits)}
                                />
                              );
                            }
                            if (isImportant) {
                              return <AlertTriangle size={18} />;
                            }
                            return <Building2 size={18} className="text-muted-foreground" />;
                          })()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-sm truncate">
                                {announcement.subject || "Okänt bolag"}
                              </h3>
                              <div className="text-xs text-muted-foreground font-mono">
                                {formatOrgNumber(announcement.orgNumber)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {category && (
                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${category.color}`}>
                                  {category.label}
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 bg-secondary rounded uppercase tracking-wide">
                                {announcement.type || "Kungörelse"}
                              </span>
                            </div>
                          </div>

                          {/* Detail text preview */}
                          {announcement.detailText && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {announcement.detailText.slice(0, 200)}
                              {announcement.detailText.length > 200 ? "..." : ""}
                            </p>
                          )}

                          {/* Date */}
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span>Publicerad: {formatDate(announcement.pubDate)}</span>
                            <a
                              href="https://poit.bolagsverket.se"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              POIT <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Laddar fler händelser...</span>
                </div>
              )}
              {!hasMore && announcements.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  Alla {announcements.length} händelser laddade
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
