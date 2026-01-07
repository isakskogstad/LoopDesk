"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { Bell, Clock, BarChart3, Search, RefreshCw, ExternalLink, X, Play, ChevronDown, ChevronUp } from "lucide-react";

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
  estimatedTimeRemaining?: number;
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

// Uses internal API routes - no external service needed

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
  let changes: string[] = [];

  for (const line of lines) {
    if (line.includes("Säte:")) {
      location = line.split("Säte:")[1]?.trim() || null;
    }
    if (line.includes("Ändringar har registrerats beträffande:")) {
      const changePart = line.split("beträffande:")[1];
      if (changePart) {
        changes = changePart
          .split(",")
          .map((c) => c.trim().toLowerCase())
          .filter((c) => c && c.length > 1);
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

type ViewType = "search" | "progress" | "results" | "schedule" | "stats";

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

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kungorelser-history");
    if (saved) setSearchHistory(JSON.parse(saved));
  }, []);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="page-wrapper page-content">
        {/* Header */}
        <header className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Bolagshändelser</h1>
              <p className="page-subtitle">
                Kungörelser för {companies.length} bevakade bolag
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
                className="content-card bg-card border border-border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
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
                <h1 className="text-base font-semibold">Kungörelser</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSchedulePanel(!showSchedulePanel)}
                  className={`p-2 rounded-lg transition-colors ${showSchedulePanel ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}
                >
                  <Clock size={16} />
                </button>
                <div className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {status?.announcementCount || 0} st
                </div>
              </div>
            </div>

            {/* Schedule Panel */}
            {showSchedulePanel && (
              <div className="mb-6 p-4 bg-secondary/50 rounded-xl border border-border animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold">Schemaläggning</h2>
                  <button onClick={() => setShowSchedulePanel(false)} className="p-1 hover:bg-secondary rounded">
                    <X size={14} />
                  </button>
                </div>

                {/* Schedule Status */}
                <div
                  className={`p-3 rounded-lg mb-3 ${
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
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {schedule?.isRunning
                      ? `Batch ${schedule.currentBatch}/${schedule.totalBatches}, ~${schedule.estimatedTimeRemaining || "?"} min kvar`
                      : schedule?.nextRun
                        ? `Nästa: ${formatRelativeDate(schedule.nextRun)}`
                        : schedule?.lastRun
                          ? `Senast: ${formatRelativeDate(schedule.lastRun)}`
                          : "Aldrig körts"}
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border mb-3">
                  <div>
                    <div className="text-sm font-medium">Aktivera bevakning</div>
                    <div className="text-xs text-muted-foreground">{status?.watchedCompanyCount || 1215} bolag</div>
                  </div>
                  <button
                    onClick={toggleSchedule}
                    className={`w-10 h-6 rounded-full transition-colors relative ${schedule?.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <span
                      className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform shadow ${schedule?.enabled ? "translate-x-5" : "translate-x-1"}`}
                    />
                  </button>
                </div>

                {/* Interval */}
                <select
                  value={schedule?.interval || "daily"}
                  onChange={(e) => updateInterval(e.target.value)}
                  className="w-full p-2.5 text-sm bg-card border border-border rounded-lg mb-3"
                >
                  <option value="hourly">Varje timme</option>
                  <option value="every2h">Var 2:a timme</option>
                  <option value="every4h">Var 4:e timme</option>
                  <option value="every6h">Var 6:e timme</option>
                  <option value="every12h">Var 12:e timme</option>
                  <option value="daily">Dagligen</option>
                  <option value="weekly">Varje vecka</option>
                </select>

                <button
                  onClick={runScheduleNow}
                  disabled={schedule?.isRunning}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                >
                  <Play size={14} />
                  {schedule?.isRunning ? "Kör redan..." : "Kör nu"}
                </button>
              </div>
            )}

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
                      className="w-full px-4 py-3 pr-16 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
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
                <div className="relative pl-6 max-h-80 overflow-y-auto">
                  <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-border" />
                  {sortedResults.map((r, i) => {
                    const parsed = parseChanges(r.detailText || r.detail_text);
                    const isImportant = parsed.changes.length > 2;
                    return (
                      <div key={r.id || i} className="relative pb-5 last:pb-0">
                        <div className={`absolute left-[-24px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-primary ${isImportant ? "bg-primary" : "bg-card"}`} />
                        <div className="text-xs font-semibold mb-1">{formatDateDisplay(r.datum || r.pubDate)}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">{r.typ || r.type || "Kungörelse"}</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {parsed.location && <span className="text-[11px] px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded">📍 {parsed.location}</span>}
                          {parsed.changes.length > 0
                            ? parsed.changes.map((change, j) => {
                                const cat = categorizeChange(change);
                                const catColors: Record<string, string> = {
                                  location: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                                  leadership: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                                  financial: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                                  legal: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                                  default: "bg-secondary text-secondary-foreground",
                                };
                                return (
                                  <span key={j} className={`text-[11px] px-2 py-1 rounded ${catColors[cat]}`}>
                                    {change.charAt(0).toUpperCase() + change.slice(1)}
                                  </span>
                                );
                              })
                            : !parsed.location && <span className="text-[11px] px-2 py-1 bg-secondary rounded">Ändring registrerad</span>}
                        </div>
                        {r.id && (
                          <a
                            href="https://poit.bolagsverket.se"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary hover:underline flex items-center gap-1 opacity-70 hover:opacity-100"
                          >
                            {r.id}
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setView("search");
                      setSearchInput("");
                    }}
                    className="flex-1 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80"
                  >
                    <Search size={14} />
                    Ny sökning
                  </button>
                  <button onClick={refreshSearch} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90">
                    <RefreshCw size={14} className={isSearching ? "animate-spin" : ""} />
                    Uppdatera
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm animate-in slide-in-from-bottom-4">{toast}</div>
      )}
    </main>
  );
}
