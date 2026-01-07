"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, CheckCircle, ChevronRight, ChevronLeft, X, Play, Square, Zap, FileText, RefreshCw, AlertTriangle, Activity, Building2 } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import styles from "./widget-styles.module.css";

type WidgetState = "button" | "menu" | "expanded";
type ViewType = "search" | "batch" | "status";
type StatusType = "online" | "working" | "offline";

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "step";
}

interface VinnovaProject {
  id: string;
  diarienummer: string;
  titel: string;
  programnamn?: string;
  vinnovaBidrag?: number;
  totalbudget?: number;
  koordinator?: string;
}

interface WatchedCompany {
  id: string;
  orgNumber: string;
  name: string;
}

export function VinnovaWidget() {
  const [state, setState] = useState<WidgetState>("button");
  const [currentView, setCurrentView] = useState<ViewType>("search");
  const [status, setStatus] = useState<StatusType>("online");
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedVisible, setExpandedVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<VinnovaProject[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLogs, setSearchLogs] = useState<LogEntry[]>([]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Batch state (Sök alla bevakade)
  const [batchLogs, setBatchLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [lastRun, setLastRun] = useState("--:--");
  const [watchedCompanies, setWatchedCompanies] = useState<WatchedCompany[]>([]);

  // Status state
  const [statusLogs, setStatusLogs] = useState<LogEntry[]>([]);

  // Global loading state for button
  const [isGloballyBusy, setIsGloballyBusy] = useState(false);

  const logIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);

  // Click outside to close menu/expanded
  useClickOutside(widgetRef, () => {
    if (state === "menu") closeMenu();
    if (state === "expanded") closeAll();
  }, state !== "button");

  const addLog = useCallback((view: ViewType, message: string, type: LogEntry["type"] = "info") => {
    const time = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const entry: LogEntry = {
      id: `log-${++logIdRef.current}`,
      time,
      message,
      type,
    };

    if (view === "search") {
      setSearchLogs(prev => [...prev.slice(-50), entry]);
    } else if (view === "batch") {
      setBatchLogs(prev => [...prev.slice(-50), entry]);
    } else {
      setStatusLogs(prev => [...prev.slice(-50), entry]);
    }
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [searchLogs, batchLogs, statusLogs]);

  // Fetch watched companies for batch view
  const fetchWatchedCompanies = useCallback(async () => {
    try {
      const response = await fetch("/api/bevakning");
      if (response.ok) {
        const data = await response.json();
        setWatchedCompanies(data.companies || []);
      }
    } catch (error) {
      console.error("Failed to fetch watched companies:", error);
    }
  }, []);

  // Load data when expanded
  useEffect(() => {
    if (state === "expanded") {
      if (currentView === "batch") {
        fetchWatchedCompanies();
      }
    }
  }, [state, currentView, fetchWatchedCompanies]);

  // Update global busy state
  useEffect(() => {
    setIsGloballyBusy(isSearching || isRunning);
  }, [isSearching, isRunning]);

  const clearLog = (view: ViewType) => {
    if (view === "search") setSearchLogs([]);
    else if (view === "batch") setBatchLogs([]);
    else setStatusLogs([]);
  };

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

  // Search with retry logic
  const doSearch = async (retryCount = 0) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatus("working");
    setProjects([]);
    setExpandedProject(null);
    setSearchProgress(0);
    setSearchError(null);

    addLog("search", `Initierar sökning...`, "step");
    await sleep(200);
    setSearchProgress(10);

    addLog("search", `Ansluter till Vinnova API...`, "step");
    await sleep(300);
    setSearchProgress(25);

    addLog("search", `Söker: "${searchQuery}"`, "info");
    setSearchProgress(40);

    try {
      const params = new URLSearchParams();
      params.set("company", searchQuery.trim());

      addLog("search", `Hämtar projektdata...`, "step");
      const response = await fetch(`/api/bolag/vinnova?${params.toString()}`);
      setSearchProgress(70);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      addLog("search", `Bearbetar resultat...`, "step");
      const data = await response.json();
      setSearchProgress(90);

      await sleep(200);

      if (data.projects && data.projects.length > 0) {
        const projectList: VinnovaProject[] = data.projects.slice(0, 10);
        setProjects(projectList);

        const totalFunding = projectList.reduce((sum, p) => sum + (p.vinnovaBidrag || 0), 0);

        addLog("search", `Hittade ${data.projects.length} projekt`, "success");
        if (totalFunding > 0) {
          addLog("search", `Total finansiering: ${formatCurrency(totalFunding)}`, "info");
        }
      } else {
        addLog("search", "Inga Vinnova-projekt hittades för detta bolag", "warning");
      }

      setSearchProgress(100);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Okänt fel";

      if (retryCount < 2) {
        addLog("search", `Fel: ${errorMsg}. Försöker igen...`, "warning");
        await sleep(1000);
        return doSearch(retryCount + 1);
      }

      addLog("search", `Fel: ${errorMsg}`, "error");
      setSearchError(errorMsg);
    }

    await sleep(300);
    setStatus("online");
    setIsSearching(false);
    setTimeout(() => setSearchProgress(0), 500);
  };

  const retrySearch = () => {
    setSearchError(null);
    doSearch();
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} MSEK`;
    }
    return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(amount);
  };

  // Status functionality
  const testConnection = async () => {
    addLog("status", "Testar anslutning...", "step");
    setStatus("working");

    await sleep(500);

    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        addLog("status", "API: OK", "success");
        addLog("status", "Databas: OK", "success");
        addLog("status", "Anslutning verifierad", "success");
      } else {
        addLog("status", "Anslutning misslyckades", "error");
      }
    } catch {
      addLog("status", "Kunde inte nå servern", "error");
    }

    setStatus("online");
  };

  // Run with real watched companies instead of hardcoded list
  const startRun = async () => {
    if (isRunning) {
      runningRef.current = false;
      setIsRunning(false);
      addLog("batch", "Avbruten av användare", "warning");
      setStatus("online");
      setBatchProgress(0);
      return;
    }

    // Fetch latest watched companies if not loaded
    let companies = watchedCompanies;
    if (companies.length === 0) {
      addLog("batch", "Hämtar bevakade bolag...", "step");
      try {
        const response = await fetch("/api/bevakning");
        if (response.ok) {
          const data = await response.json();
          companies = data.companies || [];
          setWatchedCompanies(companies);
        }
      } catch {
        addLog("batch", "Kunde inte hämta bevakade bolag", "error");
        return;
      }
    }

    if (companies.length === 0) {
      addLog("batch", "Inga bevakade bolag att söka", "warning");
      return;
    }

    runningRef.current = true;
    setIsRunning(true);
    addLog("batch", `Startar sökning för ${companies.length} bolag...`, "step");
    setStatus("working");
    setBatchProgress(0);

    let successCount = 0;
    let foundProjects = 0;

    for (let i = 0; i < companies.length && runningRef.current; i++) {
      const company = companies[i];
      const progress = ((i + 1) / companies.length) * 100;

      addLog("batch", `Söker: ${company.name}...`, "info");
      setBatchProgress(progress - 5);

      try {
        const response = await fetch(`/api/bolag/vinnova?company=${encodeURIComponent(company.name)}`);

        if (!runningRef.current) break;

        if (response.ok) {
          const data = await response.json();
          const count = data.projects?.length || 0;

          if (count > 0) {
            addLog("batch", `${company.name}: ${count} projekt`, "success");
            foundProjects += count;
          } else {
            addLog("batch", `${company.name}: Inga projekt`, "info");
          }
          successCount++;
        } else {
          addLog("batch", `${company.name}: API-fel`, "warning");
        }
      } catch {
        addLog("batch", `${company.name}: Misslyckades`, "error");
      }

      setBatchProgress(progress);

      // Small delay between requests
      if (runningRef.current && i < companies.length - 1) {
        await sleep(500);
      }
    }

    if (runningRef.current) {
      addLog("batch", `Körning slutförd: ${successCount}/${companies.length} bolag, ${foundProjects} projekt`, "success");
      setLastRun(new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }));
    }

    runningRef.current = false;
    setIsRunning(false);
    setStatus("online");
    setTimeout(() => setBatchProgress(0), 1000);
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
    };
  }, []);

  const viewTitles = { search: "Sök projekt", batch: "Sök alla bevakade", status: "Status" };

  return (
    <div className={styles.widget} ref={widgetRef}>
      {/* STATE 1: Button */}
      {state === "button" && (
        <button
          className={styles.button}
          onClick={openMenu}
          disabled={isGloballyBusy}
        >
          <div className={styles.btnLogo}>
            <img src="/logos/vinnova.png" alt="Vinnova" />
          </div>
          <span className={styles.btnSubtitle}>Innovationsprojekt</span>
          <ChevronRight className={`${styles.chevron} w-4 h-4`} />
          {isGloballyBusy && <div className={styles.loadingSpinner} />}
        </button>
      )}

      {/* STATE 2: Menu */}
      {state === "menu" && (
        <div className={`${styles.menu} ${menuVisible ? styles.menuVisible : ""}`}>
          <div className={styles.menuHeader}>
            <div className={styles.menuTitle}>
              <div className={`${styles.menuTitleIcon} ${styles.menuTitleIconGreen}`}>
                <Zap className="w-3 h-3" />
              </div>
              Vinnova Scraper
            </div>
            <button className={styles.menuClose} onClick={closeMenu}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className={styles.menuItems}>
            <div className={styles.menuItem} onClick={() => openExpanded("search")}>
              <div className={styles.menuIcon}><Search className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>Sök projekt</div>
                <div className={styles.menuDesc}>Hitta Vinnova-projekt för företag</div>
              </div>
            </div>
            <div className={styles.menuItem} onClick={() => openExpanded("batch")}>
              <div className={styles.menuIcon}><RefreshCw className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>Sök alla bevakade</div>
                <div className={styles.menuDesc}>Kör sökning för alla bevakade bolag</div>
              </div>
            </div>
            <div className={styles.menuItem} onClick={() => openExpanded("status")}>
              <div className={styles.menuIcon}><Activity className="w-4 h-4" /></div>
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
              <div className={`${styles.statusDot} ${status === "online" ? styles.statusDotOnline : status === "working" ? styles.statusDotWorking : ""}`} />
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
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Sök bolagsnamn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  />
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => doSearch()} disabled={isSearching}>
                    {isSearching ? "..." : "Sök"}
                  </button>
                </div>

                {/* Retry button on error */}
                {searchError && (
                  <button className={styles.retryBtn} onClick={retrySearch}>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Försök igen
                  </button>
                )}

                {/* Progress */}
                {searchProgress > 0 && (
                  <div className={styles.progress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${searchProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Results */}
                {projects.length > 0 && (
                  <div className={styles.projects}>
                    <div className={styles.sectionTitle}>
                      <FileText className="w-3.5 h-3.5" />
                      Projekt ({projects.length})
                    </div>
                    {projects.map((p) => (
                      <div
                        key={p.diarienummer}
                        className={`${styles.project} ${expandedProject === p.diarienummer ? styles.projectExpanded : ''}`}
                        onClick={() => setExpandedProject(expandedProject === p.diarienummer ? null : p.diarienummer)}
                      >
                        <div className={styles.projectHeader}>
                          <div className={styles.projectTitle}>{p.titel || p.diarienummer}</div>
                          <div className={styles.projectId}>{p.diarienummer}</div>
                        </div>
                        {expandedProject === p.diarienummer && (
                          <div className={styles.projectDetails}>
                            {p.programnamn && (
                              <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Program</span>
                                <span className={styles.detailValue}>{p.programnamn}</span>
                              </div>
                            )}
                            {p.koordinator && (
                              <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Koordinator</span>
                                <span className={styles.detailValue}>{p.koordinator}</span>
                              </div>
                            )}
                            {p.vinnovaBidrag && (
                              <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Bidrag</span>
                                <span className={`${styles.detailValue} ${styles.detailValueHighlight}`}>{formatCurrency(p.vinnovaBidrag)}</span>
                              </div>
                            )}
                            {p.totalbudget && (
                              <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Total budget</span>
                                <span className={styles.detailValue}>{formatCurrency(p.totalbudget)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Log */}
                <div className={styles.logPanel}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTitle}>Aktivitet</span>
                    {searchLogs.length > 0 && (
                      <button className={styles.logClear} onClick={() => clearLog("search")}>Rensa</button>
                    )}
                  </div>
                  <div className={styles.logContent} ref={logContainerRef}>
                    {searchLogs.length === 0 ? (
                      <div className={styles.logEmpty}>Sök efter ett bolag för att se aktivitet</div>
                    ) : (
                      searchLogs.map(log => (
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

            {/* Batch View - Search all watched companies */}
            {currentView === "batch" && (
              <div className={styles.view}>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <Building2 className="w-4 h-4" />
                    <div className={styles.statContent}>
                      <div className={styles.statLabel}>Bevakade</div>
                      <div className={styles.statValue}>{watchedCompanies.length || "..."}</div>
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
                  <button
                    className={`${styles.btn} ${isRunning ? styles.btnDanger : styles.btnSuccess}`}
                    onClick={startRun}
                    style={{ flex: 1 }}
                  >
                    {isRunning ? <><Square className="w-3.5 h-3.5" />Stoppa</> : <><Play className="w-3.5 h-3.5" />Starta sökning</>}
                  </button>
                </div>

                {batchProgress > 0 && (
                  <div className={styles.progress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${batchProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className={styles.logPanel}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTitle}>Aktivitet</span>
                    {batchLogs.length > 0 && <button className={styles.logClear} onClick={() => clearLog("batch")}>Rensa</button>}
                  </div>
                  <div className={styles.logContent}>
                    {batchLogs.length === 0 ? (
                      <div className={styles.logEmpty}>Starta sökning för att se aktivitet</div>
                    ) : batchLogs.map(log => (
                      <div key={log.id} className={`${styles.logLine} ${log.type === "success" ? styles.logLineSuccess : log.type === "warning" ? styles.logLineWarning : log.type === "error" ? styles.logLineError : log.type === "step" ? styles.logLineStep : styles.logLineInfo}`}>
                        <span className={styles.logTime}>{log.time}</span>
                        <span className={styles.logMsg}>{log.message}</span>
                      </div>
                    ))}
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
                    <Building2 className="w-4 h-4" />
                    <div className={styles.statContent}>
                      <div className={styles.statLabel}>Bevakade</div>
                      <div className={styles.statValue}>{watchedCompanies.length}</div>
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
                    {statusLogs.length > 0 && <button className={styles.logClear} onClick={() => clearLog("status")}>Rensa</button>}
                  </div>
                  <div className={styles.logContent} ref={logContainerRef}>
                    {statusLogs.length === 0 ? (
                      <div className={styles.logEmpty}>Starta en körning för att se aktivitet</div>
                    ) : statusLogs.map(log => (
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
