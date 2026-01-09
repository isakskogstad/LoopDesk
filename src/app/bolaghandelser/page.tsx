"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, RefreshCw, ExternalLink, Filter, AlertTriangle, Loader2, FileText } from "lucide-react";
import { CompanyLinkerProvider, LinkedText } from "@/components/company-linker";

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
        stämmoDatum?: string;  // Meeting date, e.g. "2025-12-15"
        tid?: string;          // Meeting time, e.g. "16:00-17:00"
        plats?: string;        // Location, e.g. "Stockholm" or "Digitalt"
        stämmoTyp?: string;    // "Årsstämma", "Extra bolagsstämma", "Styrelsemöte"
      };
    };
    severity?: string;
  } | null;
}

// Unified feed item type
type FeedItem =
  | { type: "announcement"; data: Announcement; date: Date }
  | { type: "protocol"; data: Protocol; date: Date };

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
    keywords: ["nyemission", "fondemission", "riktad emission"],
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

interface ParsedDetail {
  city: string | null;
  changes: string | null;
  cleanText: string | null;
}

function parseDetailText(detailText: string | undefined | null): ParsedDetail {
  if (!detailText) {
    return { city: null, changes: null, cleanText: null };
  }

  const text = detailText;

  // Extract city from "Säte: Stockholm"
  const cityMatch = text.match(/Säte:\s*([^\n]+)/i);
  const city = cityMatch ? cityMatch[1].trim() : null;

  // Extract changes from "Ändringar har registrerats beträffande: X, Y,"
  const changesMatch = text.match(/Ändringar har registrerats beträffande:\s*([^\n]+)/i);
  let changes = changesMatch ? changesMatch[1].trim() : null;

  // Format changes as proper Swedish sentence
  if (changes) {
    changes = changes.replace(/,\s*$/, ""); // Remove trailing comma
    changes = `Ändring gällande ${changes}.`;
  }

  // Remove duplicated info from text
  const cleanedText = text
    .replace(/Org nr:\s*[\d-]+\n?/gi, "")
    .replace(/Företagsnamn:\s*[^\n]+\n?/gi, "")
    .replace(/Säte:\s*[^\n]+\n?/gi, "")
    .replace(/Ändringar har registrerats beträffande:\s*[^\n]+\n?/gi, "")
    .trim();

  // If only whitespace left, set to null
  const cleanText = (!cleanedText || cleanedText.length < 3) ? null : cleanedText;

  return { city, changes, cleanText };
}

function groupByDate(items: FeedItem[]): Record<string, FeedItem[]> {
  const groups: Record<string, FeedItem[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const item of items) {
    const date = new Date(item.date);
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
    groups[key].push(item);
  }

  // Sort items within each group by date (newest first)
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  return groups;
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

  // Sort by date (newest first)
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
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
      // Fetch both announcements and protocols in parallel
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

  // Merge announcements and protocols into unified feed
  const feedItems = toFeedItems(announcements, protocols);

  // Filter feed items
  const filteredItems = feedItems.filter((item) => {
    if (item.type === "announcement") {
      const a = item.data;
      // Category filter
      if (filter) {
        if (filter === "protokoll") return false; // Only show protocols
        const cat = detectCategory(a);
        if (!cat || cat.category !== filter) return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const text = `${a.subject || ""} ${a.orgNumber || ""} ${a.detailText || ""}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
    } else {
      const p = item.data;
      // If filtering by category other than protokoll, hide protocols
      if (filter && filter !== "protokoll") return false;
      // Show only protocols if filter is protokoll
      if (filter === "protokoll") return true;
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const text = `${p.companyName || ""} ${p.orgNumber || ""} ${p.aiSummary || ""}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
    }
    return true;
  });

  const grouped = groupByDate(filteredItems);
  const groupKeys = Object.keys(grouped);

  // Count important events
  const importantCounts = Object.keys(IMPORTANT_CATEGORIES).reduce(
    (acc, key) => {
      acc[key] = announcements.filter((a) => detectCategory(a)?.category === key).length;
      return acc;
    },
    {} as Record<string, number>
  );

  // Add protocol count
  const protocolCount = protocols.length;

  return (
    <CompanyLinkerProvider>
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
        <div className="flex items-center gap-3 mb-6 text-sm flex-wrap">
          <div className="px-3 py-1.5 bg-secondary rounded-lg">
            <span className="font-medium">{feedItems.length}</span>
            <span className="text-muted-foreground ml-1">händelser</span>
          </div>
          {protocolCount > 0 && (
            <div
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-opacity bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 ${
                filter === "protokoll" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setFilter(filter === "protokoll" ? null : "protokoll")}
            >
              <FileText size={14} className="inline mr-1" />
              <span className="font-medium">{protocolCount}</span>
              <span className="ml-1">Protokoll</span>
            </div>
          )}
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

                {/* Feed Items (Announcements & Protocols) */}
                <div className="space-y-3">
                  {grouped[dateKey].map((item) => {
                    if (item.type === "announcement") {
                      const announcement = item.data;
                      const category = detectCategory(announcement);
                      const isImportant = !!category;
                      const parsed = parseDetailText(announcement.detailText);

                      return (
                        <div
                          key={`a-${announcement.id}`}
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
                                  <LinkedText text={announcement.subject || "Okänt bolag"} />
                                </h3>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {formatOrgNumber(announcement.orgNumber)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {category && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${category.color}`}>
                                    {category.label}
                                  </span>
                                )}
                                {parsed.city && (
                                  <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded">
                                    {parsed.city}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Changes and detail text */}
                            <div className="mt-2 space-y-1">
                              {parsed.changes ? (
                                <p className="text-xs text-foreground">
                                  {parsed.changes}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">
                                  Kungörelse noterad
                                </p>
                              )}
                              {parsed.cleanText && (
                                <p className="text-xs text-muted-foreground whitespace-pre-line">
                                  <LinkedText text={parsed.cleanText} />
                                </p>
                              )}
                            </div>

                            {/* Date and ID */}
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span>{formatDate(announcement.pubDate)}</span>
                              <a
                                href={`https://poit.bolagsverket.se/poit-app/kungorelse/${announcement.id.replace(/\//g, "-")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                {announcement.id} <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Protocol rendering
                      const protocol = item.data;
                      const eventTypeLabel = protocol.eventType === "finansiering" ? "Finansiering"
                        : protocol.eventType === "ledning" ? "Ledning"
                        : protocol.eventType === "agare" ? "Ägare"
                        : protocol.eventType === "kris" ? "Kris"
                        : "Protokoll";
                      const severityColor = protocol.aiDetails?.severity === "hög"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : protocol.aiDetails?.severity === "medel"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";

                      return (
                        <div
                          key={`p-${protocol.id}`}
                          className="flex gap-4 p-4 bg-card border border-l-4 border-l-indigo-500 rounded-xl hover:shadow-sm transition-shadow"
                        >
                          {/* Time placeholder */}
                          <div className="text-xs text-muted-foreground w-12 flex-shrink-0 pt-0.5">
                            -
                          </div>

                          {/* Protocol Icon */}
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            {(() => {
                              const logoUrl = getLogoUrl(protocol.orgNumber);
                              const orgDigits = protocol.orgNumber?.replace(/\D/g, "") || "";
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
                              return <FileText size={18} />;
                            })()}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium text-sm truncate">
                                  <LinkedText text={protocol.companyName || "Okänt bolag"} />
                                </h3>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {formatOrgNumber(protocol.orgNumber)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${severityColor}`}>
                                  {eventTypeLabel}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded">
                                  Protokoll till Bolagsverket
                                </span>
                              </div>
                            </div>

                            {/* AI Summary */}
                            <div className="mt-2 space-y-1">
                              {protocol.aiDetails?.notis?.titel && (
                                <p className="text-xs font-medium text-foreground">
                                  {protocol.aiDetails.notis.titel}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {protocol.aiDetails?.notis?.sammanfattning || protocol.aiSummary || "Protokoll inlämnat till Bolagsverket"}
                              </p>
                            </div>

                            {/* Meeting Info Box (Faktaruta) */}
                            {protocol.aiDetails?.rapport?.faktaruta && (
                              <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                  {protocol.aiDetails.rapport.faktaruta.stämmoTyp && (
                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                      {protocol.aiDetails.rapport.faktaruta.stämmoTyp}
                                    </span>
                                  )}
                                  {protocol.aiDetails.rapport.faktaruta.stämmoDatum && (
                                    <span className="text-slate-600 dark:text-slate-400">
                                      <span className="text-slate-400 dark:text-slate-500">Datum:</span>{" "}
                                      {formatDate(protocol.aiDetails.rapport.faktaruta.stämmoDatum)}
                                    </span>
                                  )}
                                  {protocol.aiDetails.rapport.faktaruta.tid && (
                                    <span className="text-slate-600 dark:text-slate-400">
                                      <span className="text-slate-400 dark:text-slate-500">Tid:</span>{" "}
                                      {protocol.aiDetails.rapport.faktaruta.tid}
                                    </span>
                                  )}
                                  {protocol.aiDetails.rapport.faktaruta.plats && (
                                    <span className="text-slate-600 dark:text-slate-400">
                                      <span className="text-slate-400 dark:text-slate-500">Plats:</span>{" "}
                                      {protocol.aiDetails.rapport.faktaruta.plats}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Date and PDF button */}
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span>Protokolldatum: {formatDate(protocol.protocolDate)}</span>
                              {protocol.pdfUrl && (
                                <a
                                  href={protocol.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-[10px] font-medium hover:bg-primary/90 transition-colors"
                                >
                                  <FileText size={10} />
                                  Öppna PDF
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
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
