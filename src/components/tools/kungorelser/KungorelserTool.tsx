"use client";

import { useState, useCallback, useRef } from "react";
import { ScrollText, Search, Clock, Activity, Loader2, Filter, RefreshCw } from "lucide-react";
import { ToolPanel, ToolTabs, LogPanel, ProgressBar, StatusBadge } from "../shared";
import type { ToolTab, LogEntry, ToolStatus } from "../shared/types";
import { formatOrgNr } from "@/lib/utils";

interface KungorelserToolProps {
  onClose: () => void;
}

interface Announcement {
  id: string;
  caseNumber: string;
  type: string;
  companyName: string;
  orgNumber: string;
  date: string;
  detailText?: string;
}

interface AnnouncementType {
  type: string;
  count: number;
}

const TABS: ToolTab[] = [
  { id: "search", label: "Sök", icon: <Search className="w-3.5 h-3.5" /> },
  { id: "browse", label: "Bläddra", icon: <ScrollText className="w-3.5 h-3.5" /> },
  { id: "status", label: "Status", icon: <Activity className="w-3.5 h-3.5" /> },
];

const ANNOUNCEMENT_TYPES = [
  { id: "all", label: "Alla" },
  { id: "Konkurs", label: "Konkurser" },
  { id: "Konkursavslut", label: "Konkursavslut" },
  { id: "Likvidation", label: "Likvidationer" },
  { id: "Företagsrekonstruktion", label: "Rekonstruktion" },
];

export function KungorelserTool({ onClose }: KungorelserToolProps) {
  const [activeTab, setActiveTab] = useState("search");
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [browseAnnouncements, setBrowseAnnouncements] = useState<Announcement[]>([]);
  const [types, setTypes] = useState<AnnouncementType[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    const entry: LogEntry = {
      id: `log-${++logIdRef.current}`,
      timestamp: new Date(),
      message,
      type,
    };
    setLogs((prev) => [...prev.slice(-99), entry]);
    return entry;
  }, []);

  // Search for new announcements (triggers scraper)
  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 2) return;

    setIsSearching(true);
    setStatus("running");
    setProgress(10);
    setAnnouncements([]);
    addLog(`Söker kungörelser för "${query}"...`, "info");

    // Add to search history
    setSearchHistory((prev) => {
      const exists = prev.find((q) => q.toLowerCase() === query.toLowerCase());
      if (exists) return prev;
      return [query, ...prev.slice(0, 9)];
    });

    try {
      setProgress(30);
      addLog("Anropar Bolagsverket POIT (kan ta en stund)...", "info");

      const response = await fetch("/api/kungorelser/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          skipDetails: false,
          detailLimit: 10,
        }),
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      setProgress(90);

      if (data.announcements && data.announcements.length > 0) {
        setAnnouncements(data.announcements);
        addLog(`Hittade ${data.announcements.length} kungörelser`, "success");
      } else {
        addLog("Inga kungörelser hittades", "warning");
      }

      setProgress(100);
      setStatus("success");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
      setStatus("error");
    }

    setIsSearching(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Browse existing announcements in database
  const loadBrowseAnnouncements = async () => {
    setIsBrowsing(true);
    setStatus("running");
    setProgress(20);
    addLog("Laddar sparade kungörelser...", "info");

    try {
      const params = new URLSearchParams({
        limit: "50",
      });

      if (selectedType !== "all") {
        params.set("type", selectedType);
      }

      const response = await fetch(`/api/kungorelser?${params.toString()}`);
      setProgress(60);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setProgress(90);

      setBrowseAnnouncements(data.announcements || []);
      setTypes(data.types || []);
      addLog(`Laddat ${data.announcements?.length || 0} kungörelser`, "success");
      setProgress(100);
      setStatus("success");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
      setStatus("error");
    }

    setIsBrowsing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("sv-SE");
    } catch {
      return dateStr;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Konkurs: "text-red-500",
      Konkursavslut: "text-orange-500",
      Likvidation: "text-yellow-500",
      Företagsrekonstruktion: "text-blue-500",
    };
    return colors[type] || "text-muted-foreground";
  };

  return (
    <ToolPanel
      tool="kungorelser"
      title="Kungörelser"
      icon={<ScrollText className="w-5 h-5" />}
      isOpen={true}
      onClose={onClose}
    >
      <ToolTabs
        tool="kungorelser"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="tool-content space-y-4">
        {activeTab === "search" && (
          <>
            {/* Search input */}
            <div className="space-y-3">
              <label className="text-label">Sök nya kungörelser</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Bolagsnamn eller org.nummer..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn-primary px-4"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Söker direkt mot Bolagsverket POIT. Kan ta upp till 30 sekunder.
              </p>
            </div>

            {/* Status and progress */}
            <div className="flex items-center justify-between">
              <StatusBadge status={status} />
              {progress > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
                  {progress}%
                </span>
              )}
            </div>

            {progress > 0 && (
              <ProgressBar tool="kungorelser" progress={progress} />
            )}

            {/* Search results */}
            {announcements.length > 0 && (
              <div className="space-y-2">
                <label className="text-label">Resultat ({announcements.length})</label>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-3 rounded-lg border border-border bg-secondary/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm">{ann.companyName}</div>
                        <span className={`text-xs font-medium ${getTypeColor(ann.type)}`}>
                          {ann.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="font-mono">{formatOrgNr(ann.orgNumber)}</span>
                        <span>•</span>
                        <span>{formatDate(ann.date)}</span>
                        {ann.caseNumber && (
                          <>
                            <span>•</span>
                            <span>Mål: {ann.caseNumber}</span>
                          </>
                        )}
                      </div>
                      {ann.detailText && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {ann.detailText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent searches */}
            {searchHistory.length > 0 && announcements.length === 0 && (
              <div className="space-y-2">
                <label className="text-label text-xs">Senaste sökningar</label>
                <div className="flex flex-wrap gap-1">
                  {searchHistory.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(q)}
                      className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "browse" && (
          <>
            {/* Filter and refresh */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">Filtrera typ</span>
              </div>
              <button
                onClick={loadBrowseAnnouncements}
                disabled={isBrowsing}
                className="btn-secondary text-xs gap-1.5"
              >
                {isBrowsing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Ladda
              </button>
            </div>

            {/* Type filters */}
            <div className="flex gap-2 flex-wrap">
              {ANNOUNCEMENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`filter-chip ${selectedType === type.id ? "active" : ""}`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {progress > 0 && (
              <ProgressBar tool="kungorelser" progress={progress} />
            )}

            {/* Browse results */}
            {browseAnnouncements.length > 0 ? (
              <div className="space-y-2">
                <label className="text-label">Sparade kungörelser ({browseAnnouncements.length})</label>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {browseAnnouncements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-3 rounded-lg border border-border bg-secondary/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm">{ann.companyName}</div>
                        <span className={`text-xs font-medium ${getTypeColor(ann.type)}`}>
                          {ann.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="font-mono">{formatOrgNr(ann.orgNumber)}</span>
                        <span>•</span>
                        <span>{formatDate(ann.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state py-8">
                <ScrollText className="empty-state-icon w-10 h-10" />
                <p className="empty-state-title text-sm">Inga kungörelser</p>
                <p className="empty-state-description text-xs">
                  Klicka på &quot;Ladda&quot; för att hämta sparade kungörelser.
                </p>
              </div>
            )}

            {/* Type statistics */}
            {types.length > 0 && (
              <div className="space-y-2">
                <label className="text-label text-xs">Statistik</label>
                <div className="grid grid-cols-2 gap-2">
                  {types.slice(0, 4).map((t) => (
                    <div key={t.type} className="p-2 bg-secondary/50 rounded text-xs">
                      <span className={getTypeColor(t.type)}>{t.type}</span>
                      <span className="text-muted-foreground ml-2">{t.count} st</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "status" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Aktivitetslogg</span>
              <StatusBadge status={status} />
            </div>
            <LogPanel entries={logs} maxHeight={300} />
          </div>
        )}
      </div>
    </ToolPanel>
  );
}
