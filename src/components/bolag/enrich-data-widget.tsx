"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Database, RefreshCw, Clock, CheckCircle, ChevronRight, ChevronLeft, X, Play, Square, Activity, Building2, AlertTriangle, Check, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/hooks/use-click-outside";
import styles from "./widget-styles.module.css";

type WidgetState = "button" | "menu" | "expanded";
type ViewType = "search" | "enrich" | "status";
type StatusType = "online" | "working" | "offline";

interface SearchResult {
  orgNr: string;
  name: string;
  status?: string;
  location?: string;
}

interface RecentSearch {
  orgNr: string;
  name: string;
  timestamp: number;
}

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "step";
}

interface EnrichStats {
  total: number;
  enriched: number;
  failed: number;
  skipped: number;
}

interface WatchedCompany {
  id: string;
  orgNumber: string;
  name: string;
}

interface SelectedCompany {
  orgNr: string;
  name: string;
}

interface EnrichDataWidgetProps {
  selectedCompany?: SelectedCompany | null;
}

export function EnrichDataWidget({ selectedCompany }: EnrichDataWidgetProps) {
  const router = useRouter();
  const [state, setState] = useState<WidgetState>("button");
  const [currentView, setCurrentView] = useState<ViewType>("search");
  const [status, setStatus] = useState<StatusType>("online");
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedVisible, setExpandedVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enrich state
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<EnrichStats>({ total: 0, enriched: 0, failed: 0, skipped: 0 });
  const [lastRun, setLastRun] = useState("--:--");

  // Company selection state (13)
  const [companies, setCompanies] = useState<WatchedCompany[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Confirmation dialog state (9)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Rate limiting state (20)
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  // Global loading state for button (8)
  const [isGloballyBusy, setIsGloballyBusy] = useState(false);

  const logIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Click outside to close menu/expanded (7)
  useClickOutside(widgetRef, () => {
    if (state === "menu") closeMenu();
    if (state === "expanded") closeAll();
  }, state !== "button");

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    const time = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const entry: LogEntry = {
      id: `log-${++logIdRef.current}`,
      time,
      message,
      type,
    };
    setLogs(prev => [...prev.slice(-100), entry]);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Update global busy state
  useEffect(() => {
    setIsGloballyBusy(isEnriching || isSearching);
  }, [isEnriching, isSearching]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("allabolag-recent-searches");
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecentSearches(parsed.slice(0, 5));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveRecentSearch = (orgNr: string, name: string) => {
    const newSearch: RecentSearch = { orgNr, name, timestamp: Date.now() };
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.orgNr !== orgNr);
      const updated = [newSearch, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("allabolag-recent-searches", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // Search functionality
  const doSearch = useCallback(async (query: string, retryCount = 0) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setStatus("working");
    addLog(`Söker: "${query}"...`, "step");

    try {
      const response = await fetch(`/api/bolag/search?q=${encodeURIComponent(query.trim())}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results.slice(0, 8));
        addLog(`Hittade ${data.results.length} bolag`, "success");
      } else {
        setSearchResults([]);
        addLog("Inga bolag hittades", "warning");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Okänt fel";

      if (retryCount < 2) {
        addLog(`Fel: ${errorMsg}. Försöker igen...`, "warning");
        await new Promise(r => setTimeout(r, 1000));
        return doSearch(query, retryCount + 1);
      }

      addLog(`Fel: ${errorMsg}`, "error");
      setSearchResults([]);
    }

    setStatus("online");
    setIsSearching(false);
  }, [addLog]);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        doSearch(value);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const selectCompany = (result: SearchResult) => {
    saveRecentSearch(result.orgNr, result.name);
    addLog(`Öppnar: ${result.name}`, "success");
    closeAll();
    router.push(`/bolag/${result.orgNr}`);
  };

  const openRecent = (recent: RecentSearch) => {
    saveRecentSearch(recent.orgNr, recent.name);
    closeAll();
    router.push(`/bolag/${recent.orgNr}`);
  };

  // Fetch companies on mount and when expanded
  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const response = await fetch("/api/bevakning");
      if (response.ok) {
        const data = await response.json();
        const companyList = data.companies || [];
        setCompanies(companyList);
        // Select all by default
        setSelectedCompanyIds(new Set(companyList.map((c: WatchedCompany) => c.id)));
      }
    } catch {
      // Ignore errors
    }
    setLoadingCompanies(false);
  }, []);

  // Load data when expanded
  useEffect(() => {
    if (state === "expanded") {
      if (currentView === "enrich") {
        fetchCompanies();
      }
    }
  }, [state, currentView, fetchCompanies]);

  const clearLogs = () => setLogs([]);

  const openMenu = () => {
    setState("menu");
    setTimeout(() => setMenuVisible(true), 10);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setTimeout(() => setState("button"), 250);
  };

  const openExpanded = (view: ViewType) => {
    setMenuVisible(false);
    setCurrentView(view);
    setTimeout(() => {
      setState("expanded");
      setTimeout(() => setExpandedVisible(true), 10);
    }, 180);
    setStatus("online");
  };

  const backToMenu = () => {
    setExpandedVisible(false);
    setTimeout(() => {
      setState("menu");
      setTimeout(() => setMenuVisible(true), 10);
    }, 220);
  };

  const closeAll = () => {
    setExpandedVisible(false);
    setTimeout(() => setState("button"), 220);
  };

  // Company selection handlers (13)
  const toggleCompany = (id: string) => {
    setSelectedCompanyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllCompanies = () => {
    setSelectedCompanyIds(new Set(companies.map(c => c.id)));
  };

  const deselectAllCompanies = () => {
    setSelectedCompanyIds(new Set());
  };

  // Confirmation dialog (9)
  const handleStartEnrichment = () => {
    if (isEnriching) {
      // Stop enrichment
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsEnriching(false);
      setStatus("online");
      addLog("Avbruten av användare", "warning");
      return;
    }

    if (selectedCompanyIds.size === 0) {
      addLog("Inga bolag valda", "warning");
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmEnrichment = () => {
    setShowConfirmDialog(false);
    startEnrichment();
  };

  // Enrichment with retry logic (18)
  const startEnrichment = async (retryCount = 0) => {
    setIsEnriching(true);
    setStatus("working");
    setProgress(0);
    setStats({ total: 0, enriched: 0, failed: 0, skipped: 0 });
    setRateLimited(false);
    setRetryAfter(null);

    const selectedCompanies = companies.filter(c => selectedCompanyIds.has(c.id));
    addLog(`Startar berikning av ${selectedCompanies.length} bolag...`, "step");

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/bevakning/enrich/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSize: 50,
          companyIds: Array.from(selectedCompanyIds),
        }),
        signal: abortControllerRef.current.signal,
      });

      // Rate limiting check (20)
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const waitTime = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
        setRateLimited(true);
        setRetryAfter(waitTime);
        addLog(`Rate limited. Vänta ${waitTime} sekunder...`, "warning");

        // Auto-retry after wait (18)
        if (retryCount < 2) {
          await sleep(waitTime * 1000);
          setRateLimited(false);
          return startEnrichment(retryCount + 1);
        }

        setIsEnriching(false);
        setStatus("online");
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamEvent(data);
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      setLastRun(new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }));
      addLog("Berikning slutförd", "success");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Already logged
      } else {
        const errorMsg = error instanceof Error ? error.message : "Okänt fel";

        // Retry logic (18)
        if (retryCount < 2) {
          addLog(`Fel: ${errorMsg}. Försöker igen...`, "warning");
          await sleep(1000);
          return startEnrichment(retryCount + 1);
        }

        addLog(`Fel: ${errorMsg}`, "error");
      }
    }

    setIsEnriching(false);
    setStatus("online");
    abortControllerRef.current = null;
    setTimeout(() => setProgress(0), 1000);
  };

  const handleStreamEvent = (data: {
    type: string;
    message?: string;
    company?: string;
    progress?: number;
    total?: number;
    enriched?: number;
    failed?: number;
    skipped?: number;
  }) => {
    switch (data.type) {
      case "start":
        addLog(data.message || "Startar...", "step");
        if (data.total) {
          setStats(prev => ({ ...prev, total: data.total! }));
        }
        break;
      case "progress":
        if (data.progress !== undefined) {
          setProgress(data.progress);
        }
        if (data.company) {
          addLog(`Bearbetar: ${data.company}`, "info");
        }
        break;
      case "success":
        addLog(data.message || `${data.company}: OK`, "success");
        setStats(prev => ({ ...prev, enriched: prev.enriched + 1 }));
        break;
      case "skip":
        addLog(data.message || `${data.company}: Hoppades över`, "info");
        setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
        break;
      case "warning":
        addLog(data.message || "Varning", "warning");
        break;
      case "error":
        addLog(data.message || `${data.company}: Misslyckades`, "error");
        setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        break;
      case "complete":
        if (data.enriched !== undefined) {
          setStats({
            total: data.total || 0,
            enriched: data.enriched || 0,
            failed: data.failed || 0,
            skipped: data.skipped || 0,
          });
        }
        setProgress(100);
        break;
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const testConnection = async () => {
    addLog("Testar anslutning...", "step");
    setStatus("working");

    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        addLog("API: OK", "success");
        addLog(`Databas: ${data.database === "connected" ? "OK" : "Fel"}`, data.database === "connected" ? "success" : "error");
        addLog("Anslutning verifierad", "success");
      } else {
        addLog("Anslutning misslyckades", "error");
      }
    } catch {
      addLog("Kunde inte nå servern", "error");
    }

    setStatus("online");
  };

  const viewTitles = { search: "Sök bolag", enrich: "Berika bolag", status: "Status" };

  return (
    <div className={styles.widget} ref={widgetRef}>
      {/* Confirmation Dialog (9) */}
      {showConfirmDialog && (
        <div className={styles.confirmOverlay} onClick={() => setShowConfirmDialog(false)}>
          <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Bekräfta berikning</div>
            <div className={styles.confirmMessage}>
              Du håller på att berika {selectedCompanyIds.size} bolag med data från Allabolag.
              Detta kan ta några minuter beroende på antalet bolag.
            </div>
            <div className={styles.confirmActions}>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setShowConfirmDialog(false)}>
                Avbryt
              </button>
              <button className={`${styles.btn} ${styles.btnPrimaryBlue}`} onClick={confirmEnrichment}>
                Starta berikning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 1: Button */}
      {state === "button" && (
        <div className={styles.buttonWrapper}>
          <button
            className={styles.button}
            onClick={openMenu}
            disabled={isGloballyBusy}
          >
            <div className={styles.btnLogo}>
              <img src="/logos/allabolag.png" alt="Allabolag" />
            </div>
            <span className={styles.btnSubtitle}>Bolagsdata</span>
            <ChevronRight className={`${styles.chevron} w-4 h-4`} />
            {isGloballyBusy && <div className={`${styles.loadingSpinner} ${styles.loadingSpinnerBlue}`} />}
          </button>
          {selectedCompany && (
            <button
              className={styles.quickAction}
              onClick={() => router.push(`/bolag/${selectedCompany.orgNr}`)}
            >
              Berika data för {selectedCompany.name}
            </button>
          )}
        </div>
      )}

      {/* STATE 2: Menu */}
      {state === "menu" && (
        <div className={`${styles.menu} ${menuVisible ? styles.menuVisible : ""}`}>
          <div className={styles.menuHeader}>
            <div className={styles.menuTitle}>
              <div className={`${styles.menuTitleIcon} ${styles.menuTitleIconBlue}`}>
                <Database className="w-3 h-3" />
              </div>
              Berika data
            </div>
            <button className={styles.menuClose} onClick={closeMenu}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className={styles.menuItems}>
            <div className={styles.menuItem} onClick={() => openExpanded("search")}>
              <div className={`${styles.menuIcon} ${styles.menuIconBlue}`}><Search className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>Sök bolag</div>
                <div className={styles.menuDesc}>Sök på namn eller org.nr</div>
              </div>
            </div>
            <div className={styles.menuItem} onClick={() => openExpanded("enrich")}>
              <div className={`${styles.menuIcon} ${styles.menuIconBlue}`}><RefreshCw className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>Berika bolag</div>
                <div className={styles.menuDesc}>
                  {companies.length > 0 ? `Uppdatera ${companies.length} bolag från Allabolag` : "Hämta data från Allabolag"}
                </div>
              </div>
            </div>
            <div className={styles.menuItem} onClick={() => openExpanded("status")}>
              <div className={`${styles.menuIcon} ${styles.menuIconBlue}`}><Activity className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>Status</div>
                <div className={styles.menuDesc}>Anslutning och hälsa</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: Expanded */}
      {state === "expanded" && (
        <div className={`${styles.expanded} ${expandedVisible ? styles.expandedVisible : ""}`}>
          <div className={styles.expandedHeader}>
            <div className={styles.expandedTitle}>
              <div className={`${styles.statusDot} ${status === "online" ? styles.statusDotOnline : status === "working" ? styles.statusDotWorkingBlue : ""}`} />
              <span>{viewTitles[currentView]}</span>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.headerBtn} onClick={backToMenu}><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button className={styles.headerBtn} onClick={closeAll}><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className={styles.expandedBody}>
            {/* Search View */}
            {currentView === "search" && (
              <div className={styles.view}>
                {/* Search Input */}
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Företagsnamn eller org.nr..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch(searchQuery)}
                    autoFocus
                  />
                  <button
                    className={`${styles.btn} ${styles.btnPrimaryBlue}`}
                    onClick={() => doSearch(searchQuery)}
                    disabled={isSearching || searchQuery.length < 2}
                  >
                    {isSearching ? "..." : "Sök"}
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className={styles.projects}>
                    <div className={styles.sectionTitle}>
                      <Building2 className="w-3.5 h-3.5" />
                      Resultat ({searchResults.length})
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={result.orgNr}
                        className={styles.project}
                        onClick={() => selectCompany(result)}
                      >
                        <div className={styles.projectHeader}>
                          <div className={styles.projectTitle}>{result.name}</div>
                          <div className={styles.projectId}>{result.orgNr}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Searches (when no search results) */}
                {searchResults.length === 0 && recentSearches.length > 0 && !searchQuery && (
                  <div className={styles.projects}>
                    <div className={styles.sectionTitle}>
                      <Clock className="w-3.5 h-3.5" />
                      Senaste sökningar
                    </div>
                    {recentSearches.map((recent) => (
                      <div
                        key={recent.orgNr}
                        className={styles.project}
                        onClick={() => openRecent(recent)}
                      >
                        <div className={styles.projectHeader}>
                          <div className={styles.projectTitle}>{recent.name}</div>
                          <div className={styles.projectId}>{recent.orgNr}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Log */}
                <div className={styles.logPanel}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTitle}>Aktivitet</span>
                    {logs.length > 0 && (
                      <button className={styles.logClear} onClick={clearLogs}>Rensa</button>
                    )}
                  </div>
                  <div className={styles.logContent} ref={logContainerRef}>
                    {logs.length === 0 ? (
                      <div className={styles.logEmpty}>Sök efter ett företag för att se aktivitet</div>
                    ) : (
                      logs.map(log => (
                        <div key={log.id} className={`${styles.logLine} ${log.type === "success" ? styles.logLineSuccess : log.type === "warning" ? styles.logLineWarning : log.type === "error" ? styles.logLineError : log.type === "step" ? styles.logLineStep : styles.logLineInfo}`}>
                          <span className={styles.logTime}>{log.time}</span>
                          <span className={styles.logMsg}>{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enrich View */}
            {currentView === "enrich" && (
              <div className={styles.view}>
                {/* Rate limit warning (20) */}
                {rateLimited && (
                  <div className={styles.rateLimitWarning}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Rate limited. {retryAfter ? `Försöker igen om ${retryAfter}s...` : "Vänta innan du försöker igen."}</span>
                  </div>
                )}

                {/* Stats grid */}
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <Building2 className="w-4 h-4" />
                    <div className={styles.statContent}>
                      <div className={styles.statLabel}>Valda</div>
                      <div className={styles.statValue}>{selectedCompanyIds.size} / {companies.length}</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <CheckCircle className="w-4 h-4" />
                    <div className={styles.statContent}>
                      <div className={styles.statLabel}>Berikade</div>
                      <div className={`${styles.statValue} ${styles.statValueSuccess}`}>{stats.enriched}</div>
                    </div>
                  </div>
                </div>

                {/* Company selection (13) */}
                {!isEnriching && (
                  <div className={styles.companyFilter}>
                    <div className={styles.companyFilterHeader}>
                      <span className={styles.companyFilterTitle}>Välj bolag</span>
                      <div className={styles.companyFilterActions}>
                        <button className={styles.companyFilterAction} onClick={selectAllCompanies}>Alla</button>
                        <button className={styles.companyFilterAction} onClick={deselectAllCompanies}>Inga</button>
                      </div>
                    </div>
                    {loadingCompanies ? (
                      <div className={styles.logEmpty}>Laddar bolag...</div>
                    ) : (
                      <div className={styles.companyList}>
                        {companies.map(company => (
                          <div
                            key={company.id}
                            className={`${styles.companyItem} ${selectedCompanyIds.has(company.id) ? styles.companyItemSelected : ""}`}
                            onClick={() => toggleCompany(company.id)}
                          >
                            <div className={`${styles.companyCheckbox} ${selectedCompanyIds.has(company.id) ? styles.companyCheckboxChecked : ""}`}>
                              {selectedCompanyIds.has(company.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={styles.companyName}>{company.name}</span>
                            <span className={styles.companyOrgNr}>{company.orgNumber}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action button */}
                <div className={styles.actionRow}>
                  <button
                    className={`${styles.btn} ${isEnriching ? styles.btnDanger : styles.btnPrimaryBlue}`}
                    onClick={handleStartEnrichment}
                    style={{ flex: 1 }}
                    disabled={rateLimited}
                  >
                    {isEnriching ? (
                      <><Square className="w-3.5 h-3.5" />Stoppa</>
                    ) : (
                      <><Play className="w-3.5 h-3.5" />Starta berikning</>
                    )}
                  </button>
                </div>

                {/* Progress */}
                {progress > 0 && (
                  <div className={`${styles.progress} ${styles.progressWithText}`}>
                    <div className={styles.progressBar}>
                      <div className={`${styles.progressFill} ${styles.progressFillBlue}`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.progressText}>{Math.round(progress)}%</span>
                  </div>
                )}

                {/* Stats summary when enriching */}
                {(stats.enriched > 0 || stats.failed > 0 || stats.skipped > 0) && (
                  <div className={styles.summary}>
                    <span className={`${styles.summaryItem} ${styles.summaryItemSuccess}`}>{stats.enriched} berikade</span>
                    {stats.skipped > 0 && <span className={styles.summaryItem}>{stats.skipped} hoppades över</span>}
                    {stats.failed > 0 && <span className={`${styles.summaryItem} ${styles.summaryItemError}`}>{stats.failed} misslyckades</span>}
                  </div>
                )}

                {/* Live Log */}
                <div className={styles.logPanel}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTitle}>Aktivitet</span>
                    {logs.length > 0 && (
                      <button className={styles.logClear} onClick={clearLogs}>Rensa</button>
                    )}
                  </div>
                  <div className={styles.logContent} ref={logContainerRef}>
                    {logs.length === 0 ? (
                      <div className={styles.logEmpty}>Starta berikning för att se aktivitet</div>
                    ) : (
                      logs.map(log => (
                        <div key={log.id} className={`${styles.logLine} ${log.type === "success" ? styles.logLineSuccess : log.type === "warning" ? styles.logLineWarning : log.type === "error" ? styles.logLineError : log.type === "step" ? styles.logLineStep : styles.logLineInfo}`}>
                          <span className={styles.logTime}>{log.time}</span>
                          <span className={styles.logMsg}>{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status View */}
            {currentView === "status" && (
              <div className={styles.view}>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <Activity className="w-4 h-4" />
                    <div className={styles.statContent}>
                      <div className={styles.statLabel}>API</div>
                      <div className={`${styles.statValue} ${styles.statValueOnline}`}>Ansluten</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <Clock className="w-4 h-4" />
                    <div className={styles.statContent}>
                      <div className={styles.statLabel}>Senaste</div>
                      <div className={styles.statValue}>{lastRun}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button className={`${styles.btn} ${styles.btnGhost}`} onClick={testConnection}>
                    Testa anslutning
                  </button>
                </div>

                <div className={styles.logPanel}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTitle}>Aktivitet</span>
                    {logs.length > 0 && <button className={styles.logClear} onClick={clearLogs}>Rensa</button>}
                  </div>
                  <div className={styles.logContent}>
                    {logs.length === 0 ? (
                      <div className={styles.logEmpty}>Ingen aktivitet</div>
                    ) : logs.map(log => (
                      <div key={log.id} className={`${styles.logLine} ${log.type === "success" ? styles.logLineSuccess : log.type === "warning" ? styles.logLineWarning : log.type === "error" ? styles.logLineError : log.type === "step" ? styles.logLineStep : styles.logLineInfo}`}>
                        <span className={styles.logTime}>{log.time}</span>
                        <span className={styles.logMsg}>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
