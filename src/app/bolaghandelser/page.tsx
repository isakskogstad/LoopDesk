"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Building2, Calendar, Tag, RefreshCw, Search, Radio } from "lucide-react";
import { ScraperPanel } from "@/components/bolaghandelser/scraper-panel";
import { supabase } from "@/lib/supabase";

interface WatchedCompany {
  orgNumber: string;
  name: string;
  hasLogo: boolean;
}

interface Announcement {
  id: string;
  subject: string;
  type: string | null;
  reporter: string | null;
  pubDate: string | null;
  publishedAt: string | null;
  detailText: string | null;
  fullText: string | null;
  url: string | null;
  orgNumber: string | null;
}

export default function BolaghandelserPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [companies, setCompanies] = useState<WatchedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScraper, setShowScraper] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [newAnnouncementIds, setNewAnnouncementIds] = useState<Set<string>>(new Set());
  const companiesRef = useRef<WatchedCompany[]>([]);

  // Load watched companies
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("/api/watchlist");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.companies || []);
        }
      } catch (error) {
        console.error("Error loading companies:", error);
      }
    }
    loadCompanies();
  }, []);

  // Load announcements for watched companies
  const loadAnnouncements = useCallback(async () => {
    if (companies.length === 0) return;

    setLoading(true);
    try {
      // Fetch all announcements and filter by watched companies
      const res = await fetch("/api/kungorelser?limit=500");
      if (res.ok) {
        const data = await res.json();
        const watchedOrgNumbers = new Set(companies.map(c => c.orgNumber));

        // Filter to only include announcements for watched companies
        const filtered = (data.announcements || []).filter((a: Announcement) =>
          a.orgNumber && watchedOrgNumbers.has(a.orgNumber)
        );

        // Sort by date (newest first)
        filtered.sort((a: Announcement, b: Announcement) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        });

        setAnnouncements(filtered);
      }
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
    }
  }, [companies]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // Keep companiesRef in sync for realtime callback
  useEffect(() => {
    companiesRef.current = companies;
  }, [companies]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("announcements-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Announcement",
        },
        (payload) => {
          const newAnnouncement = payload.new as Announcement;
          const watchedOrgNumbers = new Set(companiesRef.current.map(c => c.orgNumber));

          // Only add if it's for a watched company
          if (newAnnouncement.orgNumber && watchedOrgNumbers.has(newAnnouncement.orgNumber)) {
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get unique types for filter
  const uniqueTypes = Array.from(new Set(announcements.map(a => a.type).filter(Boolean)));

  // Filter announcements
  const filteredAnnouncements = announcements.filter(a => {
    if (filter) {
      const query = filter.toLowerCase();
      if (!a.subject.toLowerCase().includes(query) &&
          !(a.detailText?.toLowerCase().includes(query))) {
        return false;
      }
    }
    if (typeFilter && a.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeColor = (type: string | null) => {
    if (!type) return "bg-secondary text-muted-foreground dark:bg-gray-800 dark:text-muted-foreground/70";
    if (type.includes("Konkurs")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (type.includes("Likvidation")) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    if (type.includes("Kallelse")) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  };

  const getCompanyName = (orgNumber: string | null) => {
    if (!orgNumber) return null;
    const company = companies.find(c => c.orgNumber === orgNumber);
    return company?.name;
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <header className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Bolagshändelser</h1>
              <p className="page-subtitle flex items-center gap-2">
                Kungörelser för {companies.length} bevakade bolag
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
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadAnnouncements}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary/60 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Uppdatera
              </button>
              <button
                onClick={() => setShowScraper(!showScraper)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Search size={16} />
                Kungörelsescraper
                {showScraper ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        </header>

        {/* Scraper Panel (Expandable) */}
        {showScraper && (
          <div className="mb-8 animate-fadeIn">
            <ScraperPanel
              companies={companies}
              onComplete={loadAnnouncements}
              onClose={() => setShowScraper(false)}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              placeholder="Sök i händelser..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alla typer</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type || ""}>{type}</option>
            ))}
          </select>
          <div className="text-sm text-muted-foreground self-center">
            {filteredAnnouncements.length} händelser
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="animate-spin text-indigo-600" />
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto mb-4 text-muted-foreground/50 dark:text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Inga bolagshändelser
            </h3>
            <p className="text-muted-foreground mb-4">
              {companies.length === 0
                ? "Lägg till bolag i bevakningslistan först"
                : "Klicka på 'Kungörelsescraper' för att hämta händelser"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <article
                key={announcement.id}
                onClick={() => setSelectedAnnouncement(announcement)}
                className={`content-card bg-card border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer ${
                  newAnnouncementIds.has(announcement.id)
                    ? "border-green-500 ring-2 ring-green-500/20 animate-pulse"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Company & Date */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 size={14} />
                        <span className="font-medium text-foreground">
                          {getCompanyName(announcement.orgNumber) || announcement.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground/70">
                        <Calendar size={14} />
                        {formatDate(announcement.pubDate)}
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                        <Tag size={12} />
                        {announcement.type || "Kungörelse"}
                      </span>
                      {announcement.reporter && announcement.reporter !== "Bolagsverket" && (
                        <span className="text-xs text-muted-foreground">
                          via {announcement.reporter}
                        </span>
                      )}
                    </div>

                    {/* Detail Text */}
                    {announcement.detailText && (
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground/50 line-clamp-2">
                        {announcement.detailText}
                      </p>
                    )}
                  </div>

                  {/* Link */}
                  {announcement.url && (
                    <a
                      href={announcement.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 p-2 text-muted-foreground/70 hover:text-indigo-600 transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedAnnouncement && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <div
              className="w-full max-w-2xl max-h-[80vh] bg-card content-card shadow-2xl overflow-hidden animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedAnnouncement.type)}`}>
                    {selectedAnnouncement.type || "Kungörelse"}
                  </span>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="text-muted-foreground/70 hover:text-muted-foreground"
                  >
                    ✕
                  </button>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-foreground">
                  {getCompanyName(selectedAnnouncement.orgNumber) || selectedAnnouncement.subject}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(selectedAnnouncement.pubDate)} • {selectedAnnouncement.reporter}
                </p>
              </div>
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedAnnouncement.fullText || selectedAnnouncement.detailText || "Ingen detaljtext tillgänglig"}
                </p>
              </div>
              <div className="p-4 bg-background border-t border-border flex justify-between">
                <span className="text-xs text-muted-foreground/70">{selectedAnnouncement.id}</span>
                {selectedAnnouncement.url && (
                  <a
                    href={selectedAnnouncement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    Öppna på POIT <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
