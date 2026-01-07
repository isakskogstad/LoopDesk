"use client";

import { useState, useCallback, useRef } from "react";
import { Lightbulb, Search, Activity, ExternalLink, Loader2, Calendar, Users, Coins } from "lucide-react";
import { ToolPanel, ToolTabs, LogPanel, ProgressBar, StatusBadge } from "../shared";
import type { ToolTab, LogEntry, ToolStatus } from "../shared/types";
import { formatOrgNr } from "@/lib/utils";

interface VinnovaToolProps {
  onClose: () => void;
}

interface VinnovaProject {
  id: string;
  diarienummer: string;
  titel: string;
  programnamn?: string;
  startdatum?: string;
  slutdatum?: string;
  totalbudget?: number;
  vinnovaBidrag?: number;
  koordinator?: string;
  koordinatorOrgNr?: string;
  deltagare?: Array<{
    namn: string;
    orgNr?: string;
    roll?: string;
  }>;
  status?: string;
}

interface SearchResult {
  companyName: string;
  orgNr?: string;
  projects: VinnovaProject[];
}

const TABS: ToolTab[] = [
  { id: "search", label: "Sök", icon: <Search className="w-3.5 h-3.5" /> },
  { id: "status", label: "Status", icon: <Activity className="w-3.5 h-3.5" /> },
];

export function VinnovaTool({ onClose }: VinnovaToolProps) {
  const [activeTab, setActiveTab] = useState("search");
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [orgNr, setOrgNr] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedProject, setSelectedProject] = useState<VinnovaProject | null>(null);
  const [searchHistory, setSearchHistory] = useState<Array<{ name: string; orgNr?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
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

  const handleSearch = async () => {
    if (!query.trim() && !orgNr.trim()) return;

    setIsSearching(true);
    setStatus("running");
    setProgress(10);
    setSearchResult(null);
    setSelectedProject(null);
    addLog(`Söker Vinnova-projekt för "${query || orgNr}"...`, "info");

    // Add to search history
    setSearchHistory((prev) => {
      const exists = prev.find((h) => h.name === query && h.orgNr === orgNr);
      if (exists) return prev;
      return [{ name: query, orgNr: orgNr || undefined }, ...prev.slice(0, 9)];
    });

    try {
      setProgress(30);
      const params = new URLSearchParams();
      if (query.trim()) params.set("company", query.trim());
      if (orgNr.trim()) params.set("orgNr", orgNr.trim().replace(/-/g, ""));

      addLog("Anropar Vinnova API...", "info");
      const response = await fetch(`/api/bolag/vinnova?${params.toString()}`);
      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      setProgress(90);

      if (data.projects && data.projects.length > 0) {
        setSearchResult({
          companyName: query || orgNr,
          orgNr: orgNr || undefined,
          projects: data.projects,
        });
        addLog(`Hittade ${data.projects.length} Vinnova-projekt`, "success");
      } else {
        addLog("Inga Vinnova-projekt hittades", "warning");
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

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("sv-SE");
    } catch {
      return dateStr;
    }
  };

  return (
    <ToolPanel
      tool="vinnova"
      title="Vinnova Projekt"
      icon={<Lightbulb className="w-5 h-5" />}
      isOpen={true}
      onClose={onClose}
    >
      <ToolTabs
        tool="vinnova"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="tool-content space-y-4">
        {activeTab === "search" && (
          <>
            {/* Search inputs */}
            <div className="space-y-3">
              <label className="text-label">Sök Vinnova-projekt</label>
              <input
                type="text"
                placeholder="Bolagsnamn..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Org.nummer (valfritt)..."
                  value={orgNr}
                  onChange={(e) => setOrgNr(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
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
              <ProgressBar tool="vinnova" progress={progress} />
            )}

            {/* Project list */}
            {searchResult && !selectedProject && (
              <div className="space-y-2">
                <label className="text-label">
                  Projekt ({searchResult.projects.length})
                </label>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {searchResult.projects.map((project) => (
                    <button
                      key={project.id || project.diarienummer}
                      onClick={() => setSelectedProject(project)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                      <div className="font-medium text-sm line-clamp-2">{project.titel}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="font-mono">{project.diarienummer}</span>
                        {project.programnamn && (
                          <>
                            <span>•</span>
                            <span className="truncate">{project.programnamn}</span>
                          </>
                        )}
                      </div>
                      {project.vinnovaBidrag && (
                        <div className="text-xs text-emerald-500 mt-1">
                          Bidrag: {formatCurrency(project.vinnovaBidrag)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Project details */}
            {selectedProject && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-label">Projektdetaljer</label>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Tillbaka
                  </button>
                </div>
                <div className="p-4 rounded-lg border border-border bg-secondary/50 space-y-4">
                  <div>
                    <div className="font-semibold">{selectedProject.titel}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {selectedProject.diarienummer}
                    </div>
                  </div>

                  {selectedProject.programnamn && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Program:</span>{" "}
                      {selectedProject.programnamn}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Start:</span>{" "}
                      {formatDate(selectedProject.startdatum)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Slut:</span>{" "}
                      {formatDate(selectedProject.slutdatum)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Budget:</span>{" "}
                      {formatCurrency(selectedProject.totalbudget)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-muted-foreground">Bidrag:</span>{" "}
                      <span className="text-emerald-500">
                        {formatCurrency(selectedProject.vinnovaBidrag)}
                      </span>
                    </div>
                  </div>

                  {selectedProject.koordinator && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Koordinator</div>
                      <div className="text-sm">{selectedProject.koordinator}</div>
                      {selectedProject.koordinatorOrgNr && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {formatOrgNr(selectedProject.koordinatorOrgNr)}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedProject.deltagare && selectedProject.deltagare.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Users className="w-3.5 h-3.5" />
                        Deltagare ({selectedProject.deltagare.length})
                      </div>
                      <div className="space-y-1">
                        {selectedProject.deltagare.slice(0, 5).map((d, i) => (
                          <div key={i} className="text-sm flex items-center justify-between">
                            <span>{d.namn}</span>
                            {d.orgNr && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {formatOrgNr(d.orgNr)}
                              </span>
                            )}
                          </div>
                        ))}
                        {selectedProject.deltagare.length > 5 && (
                          <div className="text-xs text-muted-foreground">
                            +{selectedProject.deltagare.length - 5} fler...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <a
                    href={`https://www.vinnova.se/sok/?q=${encodeURIComponent(selectedProject.diarienummer)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Öppna på Vinnova
                  </a>
                </div>
              </div>
            )}

            {/* Search history */}
            {searchHistory.length > 0 && !searchResult && (
              <div className="space-y-2">
                <label className="text-label text-xs">Senaste sökningar</label>
                <div className="flex flex-wrap gap-1">
                  {searchHistory.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(h.name);
                        setOrgNr(h.orgNr || "");
                      }}
                      className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80"
                    >
                      {h.name || h.orgNr}
                    </button>
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
