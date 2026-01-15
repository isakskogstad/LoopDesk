"use client";

import { useState, useCallback, useRef } from "react";
import { Building2, Search, Clock, Activity, ExternalLink, Loader2 } from "lucide-react";
import { ToolPanel, ToolTabs, LogPanel, ProgressBar, StatusBadge } from "../shared";
import type { ToolTab, LogEntry, ToolStatus } from "../shared/types";
import { formatOrgNr } from "@/lib/utils";

interface AllabolagToolProps {
  onClose: () => void;
}

interface SearchResult {
  orgnr: string;
  name: string;
  companyType?: string;
  status?: string;
  location?: string;
}

interface CompanyData {
  basic: {
    orgNr: string;
    name: string;
    legalName?: string;
    companyType?: { name: string };
    status?: { active: boolean; status: string };
  };
  financials?: {
    revenue?: string;
    profit?: string;
    employees?: string;
  };
  contact?: {
    website?: string;
  };
}

const TABS: ToolTab[] = [
  { id: "search", label: "Sök", icon: <Search className="w-3.5 h-3.5" /> },
  { id: "history", label: "Historik", icon: <Clock className="w-3.5 h-3.5" /> },
  { id: "status", label: "Status", icon: <Activity className="w-3.5 h-3.5" /> },
];

export function AllabolagTool({ onClose }: AllabolagToolProps) {
  const [activeTab, setActiveTab] = useState("search");
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
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
    if (!query.trim() || query.trim().length < 2) return;

    setStatus("running");
    setProgress(10);
    setSearchResults([]);
    setSelectedCompany(null);
    addLog(`Söker efter "${query}"...`, "info");

    try {
      setProgress(30);
      const response = await fetch(`/api/bolag/search?q=${encodeURIComponent(query.trim())}`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setProgress(80);

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
        addLog(`Hittade ${data.results.length} företag`, "success");
      } else {
        addLog("Inga resultat hittades", "warning");
      }

      setProgress(100);
      setStatus("success");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
      setStatus("error");
    }

    setTimeout(() => setProgress(0), 1000);
  };

  const handleSelectCompany = async (result: SearchResult) => {
    setStatus("running");
    setProgress(20);
    addLog(`Hämtar detaljer för ${result.name}...`, "info");

    // Add to history
    setSearchHistory((prev) => {
      const exists = prev.find((r) => r.orgnr === result.orgnr);
      if (exists) return prev;
      return [result, ...prev.slice(0, 9)];
    });

    try {
      setProgress(50);
      const response = await fetch(`/api/bolag/company/${result.orgnr}`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setProgress(90);
      setSelectedCompany(data);
      addLog(`Hämtade data för ${result.name}`, "success");
      setProgress(100);
      setStatus("success");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
      setStatus("error");
    }

    setTimeout(() => setProgress(0), 1000);
  };

  return (
    <ToolPanel
      tool="allabolag"
      title="Allabolag Scraper"
      icon={<Building2 className="w-5 h-5" />}
      isOpen={true}
      onClose={onClose}
    >
      <ToolTabs
        tool="allabolag"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="tool-content space-y-4">
        {activeTab === "search" && (
          <>
            {/* Search input */}
            <div className="space-y-3">
              <label className="text-label">Sök bolag</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Org.nummer eller bolagsnamn..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleSearch}
                  disabled={status === "running"}
                  className="btn-primary px-4"
                >
                  {status === "running" ? (
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
              <ProgressBar tool="allabolag" progress={progress} />
            )}

            {/* Search results */}
            {searchResults.length > 0 && !selectedCompany && (
              <div className="space-y-2">
                <label className="text-label">Sökresultat ({searchResults.length})</label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.orgnr}
                      onClick={() => handleSelectCompany(result)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                      <div className="font-medium text-sm">{result.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="font-mono">{formatOrgNr(result.orgnr)}</span>
                        {result.companyType && (
                          <>
                            <span>•</span>
                            <span>{result.companyType}</span>
                          </>
                        )}
                        {result.location && (
                          <>
                            <span>•</span>
                            <span>{result.location}</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected company details */}
            {selectedCompany && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-label">Bolagsdetaljer</label>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Tillbaka
                  </button>
                </div>
                <div className="p-4 rounded-lg border border-border bg-secondary/50 space-y-3">
                  <div>
                    <div className="font-semibold">{selectedCompany.basic.name}</div>
                    {selectedCompany.basic.legalName && selectedCompany.basic.legalName !== selectedCompany.basic.name && (
                      <div className="text-sm text-muted-foreground">{selectedCompany.basic.legalName}</div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Org.nr:</span>{" "}
                      <span className="font-mono">{formatOrgNr(selectedCompany.basic.orgNr)}</span>
                    </div>
                    {selectedCompany.basic.companyType && (
                      <div>
                        <span className="text-muted-foreground">Typ:</span>{" "}
                        {selectedCompany.basic.companyType.name}
                      </div>
                    )}
                    {selectedCompany.financials?.revenue && (
                      <div>
                        <span className="text-muted-foreground">Omsättning:</span>{" "}
                        {selectedCompany.financials.revenue}
                      </div>
                    )}
                    {selectedCompany.financials?.employees && (
                      <div>
                        <span className="text-muted-foreground">Anställda:</span>{" "}
                        {selectedCompany.financials.employees}
                      </div>
                    )}
                  </div>
                  {selectedCompany.basic.status && (
                    <div className={`text-sm ${selectedCompany.basic.status.active ? "text-green-500" : "text-red-500"}`}>
                      Status: {selectedCompany.basic.status.status}
                    </div>
                  )}
                  <a
                    href={`https://www.allabolag.se/${selectedCompany.basic.orgNr.replace("-", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Öppna på Allabolag
                  </a>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            <label className="text-label">Senaste sökningar</label>
            {searchHistory.length === 0 ? (
              <div className="empty-state py-8">
                <Clock className="empty-state-icon w-10 h-10" />
                <p className="empty-state-title text-sm">Ingen historik</p>
                <p className="empty-state-description text-xs">
                  Dina senaste sökningar visas här.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {searchHistory.map((result) => (
                  <button
                    key={result.orgnr}
                    onClick={() => {
                      setActiveTab("search");
                      handleSelectCompany(result);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <div className="font-medium text-sm">{result.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {formatOrgNr(result.orgnr)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
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
