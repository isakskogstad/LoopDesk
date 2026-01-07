"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { Bell, Clock, Search, RefreshCw, ExternalLink, X, Play, Building2, ChevronDown, ChevronUp } from "lucide-react";

interface Announcement {
  id: string;
  typ?: string;
  type?: string;
  datum?: string;
  pubDate?: string;
  foretag?: string;
  reporter?: string;
  subject: string;
  orgnummer?: string;
  orgNumber?: string;
  detailText?: string;
  detail_text?: string;
  query?: string;
  timestamp?: string;
  lastScraped?: string;
  publishedAt?: string;
}

interface SearchResult {
  source: "cache" | "fresh";
  orgnummer: string;
  count: number;
  latestDate: string | null;
  lastScraped: string | null;
  results: Announcement[];
}

interface ScheduleConfig {
  enabled: boolean;
  interval: string;
  lastRun: string | null;
  nextRun: string | null;
  isRunning: boolean;
  currentBatch?: number;
  totalBatches?: number;
  companiesProcessed?: number;
  companiesSkipped?: number;
  newAnnouncementsFound?: number;
  estimatedTimeRemaining?: number | null;
}

interface Stats {
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
}

interface StatusData {
  announcementCount: number;
  watchedCompanyCount: number;
  schedule: ScheduleConfig;
  stats: Stats;
  limits?: {
    cacheStaleHours: number;
    concurrency: number;
    maxRuntimeHours: number;
  };
}

interface HistoryResponse {
  announcements: Announcement[];
  total: number;
  hasMore: boolean;
}

const CHANGE_CATEGORIES: Record<string, string[]> = {
  location: ["säte", "adress", "postadress", "e-postadress"],
  leadership: ["styrelse", "företrädare", "firmateckning", "vd", "ordförande", "ledamot"],
  financial: ["kapital", "aktie", "emission", "utdelning", "bokslut", "revision", "revisor"],
  legal: ["bolagsordning", "likvidation", "konkurs", "fusion", "verksamhet", "namn"],
};

function parseChanges(detailText: string | null | undefined): { location: string | null; changes: string[] } {
  if (!detailText) return { location: null, changes: [] };
  const lines = detailText.split("\n");
  let location: string | null = null;
  const changes: string[] = [];

  for (const line of lines) {
    if (line.includes("Säte:")) {
      location = line.split("Säte:")[1]?.trim() || null;
    }
    if (line.includes("Ändringar har registrerats beträffande:")) {
      const changePart = line.split("beträffande:")[1];
      if (changePart) {
        const parsed = changePart
          .split(",")
          .map((c) => c.trim().toLowerCase())
          .filter((c) => c && c.length > 1);
        changes.push(...parsed);
      }
    }
  }
  return { location, changes };
}

function categorizeChange(change: string): string {
  const lower = change.toLowerCase();
  for (const [category, keywords] of Object.entries(CHANGE_CATEGORIES)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "default";
}

function formatOrgDisplay(org: string): string {
  const digits = org.replace(/\D/g, "");
  return digits.length >= 6 ? `${digits.slice(0, 6)}-${digits.slice(6, 10)}` : digits;
}

function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just nu";
  if (diffMins < 60) return `${diffMins} min sedan`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} tim sedan`;
  return date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

function formatTimeDisplay(dateStr: string | null | undefined): string {
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
    const dateStr = a.publishedAt || a.pubDate || a.datum;
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

type ViewType = "search" | "progress" | "results";

export default function BolaghandelserPage() {
  const [view, setView] = useState<ViewType>("search");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressSteps, setProgressSteps] = useState<{ time: number; message: string; type: string }[]>([]);
  const [currentOrgNumber, setCurrentOrgNumber] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [showSearchTool, setShowSearchTool] = useState(false);

  // History state
  const [historyAnnouncements, setHistoryAnnouncements] = useState<Announcement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyHasMore, setHistoryHasMore] = useState(true);
  const [historyOffset, setHistoryOffset] = useState(0);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kungorelser-history");
    if (saved) setSearchHistory(JSON.parse(saved));
  }, []);

  // Check connection and load history on mount
  useEffect(() => {
    checkConnection();
    loadHistory();
  }, []);

  // Timer for search progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      const start = Date.now();
      interval = setInterval(() => {
        setSearchTime(Math.floor((Date.now() - start) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const checkConnection = async () => {
    try {
      const res = await fetch(`/api/kungorelser/status`);
      if (res.ok) {
        const data: StatusData = await res.json();
        setStatus(data);
        setSchedule(data.schedule);
      }
    } catch {
      showToastMessage("API offline");
    }
  };

  const loadHistory = useCallback(async (offset = 0) => {
    if (historyLoading) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/kungorelser?limit=50&offset=${offset}`);
      if (res.ok) {
        const data: HistoryResponse = await res.json();
        if (offset === 0) {
          setHistoryAnnouncements(data.announcements);
        } else {
          setHistoryAnnouncements((prev) => [...prev, ...data.announcements]);
        }
        setHistoryHasMore(data.hasMore);
        setHistoryOffset(offset + data.announcements.length);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyLoading]);

  const loadMoreHistory = () => {
    if (historyHasMore && !historyLoading) {
      loadHistory(historyOffset);
    }
  };

  const showToastMessage = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const addProgressStep = (message: string, type = "active") => {
    setProgressSteps((prev) => [...prev, { time: searchTime, message, type }]);
  };

  const startSearch = async (orgNumber: string) => {
    const digits = orgNumber.replace(/\D/g, "");
    if (digits.length !== 10) {
      showToastMessage("Ange 10 siffror");
      return;
    }

    setIsSearching(true);
    setCurrentOrgNumber(digits);
    setView("progress");
    setProgress(0);
    setProgressSteps([]);
    setSearchTime(0);

    try {
      setProgressSteps([{ time: 0, message: "Ansluter till API...", type: "active" }]);
      setProgress(10);

      const response = await fetch(`/api/kungorelser/org/${digits}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Sökning misslyckades");
      }

      const data: SearchResult = await response.json();
      setProgress(100);
      addProgressStep(data.source === "cache" ? "Hämtade från cache" : `${data.count} kungörelser hittades`, "success");

      await new Promise((r) => setTimeout(r, 300));
      setResults(data);
      setView("results");

      // Save to history
      const newHistory = [digits, ...searchHistory.filter((h) => h !== digits)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem("kungorelser-history", JSON.stringify(newHistory));
    } catch (error) {
      addProgressStep(error instanceof Error ? error.message : "Fel", "error");
      await new Promise((r) => setTimeout(r, 1500));
      setView("search");
      showToastMessage(error instanceof Error ? error.message : "Sökning misslyckades");
    } finally {
      setIsSearching(false);
    }
  };

  const refreshSearch = async () => {
    if (!currentOrgNumber || isSearching) return;
    setIsSearching(true);
    setView("progress");
    setProgress(0);
    setProgressSteps([{ time: 0, message: "Uppdaterar...", type: "active" }]);

    try {
      const response = await fetch(`/api/kungorelser/org/${currentOrgNumber}?refresh=true`);
      if (!response.ok) throw new Error("Uppdatering misslyckades");
      const data: SearchResult = await response.json();
      setProgress(100);
      addProgressStep(`${data.count} kungörelser`, "success");
      await new Promise((r) => setTimeout(r, 300));
      setResults(data);
      setView("results");
      showToastMessage("Uppdaterad");
    } catch (error) {
      addProgressStep(error instanceof Error ? error.message : "Fel", "error");
      await new Promise((r) => setTimeout(r, 1000));
      setView("results");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSchedule = async () => {
    if (!schedule) return;
    const newEnabled = !schedule.enabled;
    try {
      await fetch(`/api/kungorelser/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newEnabled }),
      });
      setSchedule({ ...schedule, enabled: newEnabled });
      showToastMessage(newEnabled ? "Schema aktiverat" : "Schema avaktiverat");
      checkConnection();
    } catch {
      showToastMessage("Kunde inte uppdatera");
    }
  };

  const updateInterval = async (interval: string) => {
    try {
      await fetch(`/api/kungorelser/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      if (schedule) setSchedule({ ...schedule, interval });
    } catch {}
  };

  const runScheduleNow = async () => {
    try {
      const res = await fetch(`/api/kungorelser/schedule/run-now`, { method: "POST" });
      if (res.ok) {
        showToastMessage("Körning startad");
        setTimeout(checkConnection, 2000);
      } else {
        const data = await res.json();
        showToastMessage(data.error || "Kunde inte starta");
      }
    } catch {
      showToastMessage("Fel vid start");
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    startSearch(searchInput);
  };

  const handleInputChange = (value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 6) digits = digits.slice(0, 6) + "-" + digits.slice(6, 10);
    setSearchInput(digits);
  };

  const sortedResults = results?.results
    ? [...results.results].sort((a, b) => {
        const dateA = new Date(a.datum || a.pubDate || 0);
        const dateB = new Date(b.datum || b.pubDate || 0);
        return dateB.getTime() - dateA.getTime();
      })
    : [];

  const groupedHistory = groupByDate(historyAnnouncements);
  const groupKeys = Object.keys(groupedHistory);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-8">Bolagshändelser</h1>

        {/* Tools Section */}
        <div className="flex items-center gap-3 mb-8">
          {/* Search Tool Toggle */}
          <button
            onClick={() => setShowSearchTool(!showSearchTool)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              showSearchTool ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"
            }`}
          >
            <Search size={16} />
            <span className="text-sm font-medium">Sök bolag</span>
            {showSearchTool ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Schedule Toggle */}
          <button
            onClick={() => setShowSchedulePanel(!showSchedulePanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              showSchedulePanel ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"
            }`}
          >
            <Clock size={16} />
            <span className="text-sm font-medium">Schema</span>
            {schedule?.isRunning && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
          </button>

          {/* Stats Badge */}
          <div className="ml-auto text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>{status?.announcementCount || 0} kungörelser</span>
            <span className="text-border">|</span>
            <span>{status?.watchedCompanyCount || 0} bolag</span>
          </div>
        </div>

        {/* Search Tool Panel */}
        {showSearchTool && (
          <div className="mb-6 p-5 bg-card border border-border rounded-2xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                <Bell size={18} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Sök kungörelser</h2>
                <p className="text-xs text-muted-foreground">Hämta händelser för ett specifikt bolag</p>
              </div>
            </div>

            {/* Search View */}
            {view === "search" && (
              <div>
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="Organisationsnummer"
                      maxLength={13}
                      className="w-full px-4 py-3 pr-16 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg">
                      Sök
                    </button>
                  </div>
                </form>
                {searchHistory.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((org) => (
                      <button
                        key={org}
                        onClick={() => {
                          setSearchInput(formatOrgDisplay(org));
                          startSearch(org);
                        }}
                        className="px-3 py-1.5 text-xs font-mono bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                      >
                        {formatOrgDisplay(org)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Progress View */}
            {view === "progress" && (
              <div>
                <div className="text-center py-4">
                  <div className="text-xl font-semibold font-mono">{currentOrgNumber ? formatOrgDisplay(currentOrgNumber) : "-"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Söker... {searchTime}s</div>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {progressSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${step.type === "success" ? "bg-green-500" : step.type === "error" ? "bg-red-500" : "bg-primary"}`} />
                      <span className="text-muted-foreground">{step.time.toFixed(1)}s</span>
                      <span>{step.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results View */}
            {view === "results" && results && (
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold">{results.results[0]?.subject || "Okänt bolag"}</h2>
                    <div className="text-xs font-mono text-muted-foreground">{formatOrgDisplay(results.orgnummer)}</div>
                  </div>
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">{results.count}</div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${results.source === "cache" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                    {results.source === "cache" ? "cache" : "ny data"}
                  </span>
                  {results.source === "cache" ? `Uppdaterad ${formatRelativeDate(results.lastScraped)}` : "Hämtad just nu"}
                </div>

                {/* Timeline */}
                <div className="relative pl-6 max-h-60 overflow-y-auto">
                  <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-border" />
                  {sortedResults.slice(0, 10).map((r, i) => {
                    const parsed = parseChanges(r.detailText || r.detail_text);
                    const isImportant = parsed.changes.length > 2;
                    return (
                      <div key={r.id || i} className="relative pb-4 last:pb-0">
                        <div className={`absolute left-[-24px] top-0.5 w-3 h-3 rounded-full border-2 border-primary ${isImportant ? "bg-primary" : "bg-card"}`} />
                        <div className="text-xs font-semibold">{formatDateDisplay(r.datum || r.pubDate)}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsed.changes.slice(0, 3).map((change, j) => {
                            const cat = categorizeChange(change);
                            const catColors: Record<string, string> = {
                              location: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                              leadership: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                              financial: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                              legal: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                              default: "bg-secondary text-secondary-foreground",
                            };
                            return (
                              <span key={j} className={`text-[10px] px-1.5 py-0.5 rounded ${catColors[cat]}`}>
                                {change.charAt(0).toUpperCase() + change.slice(1)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setView("search");
                      setSearchInput("");
                    }}
                    className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80"
                  >
                    <Search size={14} />
                    Ny sökning
                  </button>
                  <button onClick={refreshSearch} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90">
                    <RefreshCw size={14} className={isSearching ? "animate-spin" : ""} />
                    Uppdatera
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Panel */}
        {showSchedulePanel && (
          <div className="mb-6 p-5 bg-card border border-border rounded-2xl animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                  <Clock size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Schemaläggning</h2>
                  <p className="text-xs text-muted-foreground">Automatisk bevakning av {status?.watchedCompanyCount || 0} bolag</p>
                </div>
              </div>
              <button onClick={() => setShowSchedulePanel(false)} className="p-1.5 hover:bg-secondary rounded-lg">
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div
                className={`p-4 rounded-xl ${
                  schedule?.isRunning ? "bg-blue-100 dark:bg-blue-900/30" : schedule?.enabled ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"
                }`}
              >
                <div className="text-sm font-medium">
                  {schedule?.isRunning
                    ? `Kör... (${schedule.companiesProcessed || 0} / ~${status?.watchedCompanyCount || 0})`
                    : schedule?.enabled
                      ? "Aktiv"
                      : "Inaktiv"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {schedule?.isRunning
                    ? `~${schedule.estimatedTimeRemaining || "?"} min kvar`
                    : schedule?.lastRun
                      ? `Senast: ${formatRelativeDate(schedule.lastRun)}`
                      : "Aldrig körts"}
                </div>
              </div>

              {/* Toggle & Interval */}
              <div className="p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Aktivera</span>
                  <button
                    onClick={toggleSchedule}
                    className={`w-10 h-6 rounded-full transition-colors relative ${schedule?.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <span
                      className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform shadow ${schedule?.enabled ? "translate-x-5" : "translate-x-1"}`}
                    />
                  </button>
                </div>
                <select
                  value={schedule?.interval || "daily"}
                  onChange={(e) => updateInterval(e.target.value)}
                  className="w-full p-2 text-sm bg-card border border-border rounded-lg"
                >
                  <option value="hourly">Varje timme</option>
                  <option value="every4h">Var 4:e timme</option>
                  <option value="every12h">Var 12:e timme</option>
                  <option value="daily">Dagligen</option>
                </select>
              </div>

              {/* Run Now */}
              <div className="p-4 bg-secondary/50 rounded-xl flex flex-col justify-center">
                <button
                  onClick={runScheduleNow}
                  disabled={schedule?.isRunning}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                >
                  <Play size={14} />
                  {schedule?.isRunning ? "Kör redan..." : "Kör nu"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Timeline */}
        <div className="mt-8">
          {groupKeys.length === 0 && !historyLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Inga händelser än</p>
              <p className="text-sm mt-1">Sök efter ett bolag eller aktivera schemalagd bevakning</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupKeys.map((dateKey) => (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-muted-foreground tracking-wider">{dateKey}</span>
                    <span className="text-xs text-muted-foreground">{groupedHistory[dateKey].length} händelser</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Announcements */}
                  <div className="space-y-3">
                    {groupedHistory[dateKey].map((announcement) => {
                      const parsed = parseChanges(announcement.detailText || announcement.detail_text);
                      const orgNum = announcement.orgNumber || announcement.orgnummer || announcement.query;
                      return (
                        <div
                          key={announcement.id}
                          className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow"
                        >
                          {/* Time */}
                          <div className="text-xs text-muted-foreground w-12 flex-shrink-0 pt-0.5">
                            {formatTimeDisplay(announcement.publishedAt || announcement.pubDate || announcement.datum)}
                          </div>

                          {/* Icon */}
                          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 size={18} className="text-muted-foreground" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium text-sm truncate">{announcement.subject || "Okänt bolag"}</h3>
                                <div className="text-xs text-muted-foreground font-mono">{orgNum ? formatOrgDisplay(orgNum) : "-"}</div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 bg-secondary rounded uppercase tracking-wide flex-shrink-0">
                                {announcement.typ || announcement.type || "Kungörelse"}
                              </span>
                            </div>

                            {/* Change Tags */}
                            {parsed.changes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {parsed.changes.slice(0, 4).map((change, j) => {
                                  const cat = categorizeChange(change);
                                  const catColors: Record<string, string> = {
                                    location: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                                    leadership: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                                    financial: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                                    legal: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                                    default: "bg-secondary text-secondary-foreground",
                                  };
                                  return (
                                    <span key={j} className={`text-[10px] px-2 py-0.5 rounded ${catColors[cat]}`}>
                                      {change.charAt(0).toUpperCase() + change.slice(1)}
                                    </span>
                                  );
                                })}
                                {parsed.changes.length > 4 && (
                                  <span className="text-[10px] px-2 py-0.5 bg-secondary rounded">
                                    +{parsed.changes.length - 4}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Link */}
                            {announcement.id && (
                              <a
                                href="https://poit.bolagsverket.se"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-2 opacity-70 hover:opacity-100"
                              >
                                {announcement.id}
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Load More */}
              {historyHasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={loadMoreHistory}
                    disabled={historyLoading}
                    className="px-6 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {historyLoading ? "Laddar..." : "Visa fler"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm animate-in slide-in-from-bottom-4">{toast}</div>
      )}
    </main>
  );
}
