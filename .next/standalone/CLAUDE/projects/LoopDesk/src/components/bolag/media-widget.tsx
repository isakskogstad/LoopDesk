"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Image, ChevronRight, ChevronLeft, X, Play, Square, Activity, Building2, Clock, RefreshCw, Download, ExternalLink, Linkedin } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import styles from "./widget-styles.module.css";

type WidgetState = "button" | "menu" | "expanded";
type ViewType = "search" | "batch" | "status" | "linkedin";
type StatusType = "online" | "working" | "offline";

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "step";
}

interface LogoFile {
  url: string;
  format: string;
  width?: number;
  height?: number;
  type: string;
}

interface LogoResult {
  domain: string;
  success: boolean;
  source?: string;
  files: LogoFile[];
  error?: string;
}

interface WatchedCompany {
  id: string;
  orgNumber: string;
  name: string;
  domain?: string;
}

interface LinkedInCompany {
  name: string | null;
  about_us: string | null;
  website: string | null;
  headquarters: string | null;
  founded: string | null;
  industry: string | null;
  company_type: string | null;
  company_size: string | null;
  specialties: string[] | null;
  headcount: number | null;
}

interface LinkedInResult {
  success: boolean;
  company: string;
  data?: LinkedInCompany;
  linkedinUrl?: string;
  error?: string;
}

export function MediaWidget() {
  const [state, setState] = useState<WidgetState>("button");
  const [currentView, setCurrentView] = useState<ViewType>("search");
  const [status, setStatus] = useState<StatusType>("online");
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedVisible, setExpandedVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [logoResult, setLogoResult] = useState<LogoResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLogs, setSearchLogs] = useState<LogEntry[]>([]);

  // Batch state
  const [batchLogs, setBatchLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [lastRun, setLastRun] = useState("--:--");
  const [watchedCompanies, setWatchedCompanies] = useState<WatchedCompany[]>([]);
  const [batchResults, setBatchResults] = useState<LogoResult[]>([]);

  // Status state
  const [statusLogs, setStatusLogs] = useState<LogEntry[]>([]);
  const [apiStats, setApiStats] = useState<Record<string, { success: number; fail: number }>>({});

  // LinkedIn state
  const [linkedinQuery, setLinkedinQuery] = useState("");
  const [linkedinResult, setLinkedinResult] = useState<LinkedInResult | null>(null);
  const [linkedinLogs, setLinkedinLogs] = useState<LogEntry[]>([]);
  const [isLinkedinSearching, setIsLinkedinSearching] = useState(false);

  // Global loading state
  const [isGloballyBusy, setIsGloballyBusy] = useState(false);

  const logIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);

  // Click outside to close
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
    } else if (view === "linkedin") {
      setLinkedinLogs(prev => [...prev.slice(-50), entry]);
    } else {
      setStatusLogs(prev => [...prev.slice(-50), entry]);
    }
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [searchLogs, batchLogs, statusLogs, linkedinLogs]);

  // Fetch watched companies
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
    if (state === "expanded" && currentView === "batch") {
      fetchWatchedCompanies();
    }
  }, [state, currentView, fetchWatchedCompanies]);

  // Update global busy state
  useEffect(() => {
    setIsGloballyBusy(isSearching || isRunning || isLinkedinSearching);
  }, [isSearching, isRunning, isLinkedinSearching]);

  const clearLog = (view: ViewType) => {
    if (view === "search") setSearchLogs([]);
    else if (view === "batch") setBatchLogs([]);
    else if (view === "linkedin") setLinkedinLogs([]);
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

  // Search for logo
  const doSearch = async (retryCount = 0) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatus("working");
    setLogoResult(null);

    addLog("search", `Söker logo för: "${searchQuery}"...`, "step");

    try {
      const response = await fetch(`/api/media/logo?domain=${encodeURIComponent(searchQuery.trim())}&all=true`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: LogoResult = await response.json();

      if (data.success && data.files.length > 0) {
        setLogoResult(data);
        addLog("search", `Hittade ${data.files.length} logotyp(er) via ${data.source}`, "success");

        // Log file details
        for (const file of data.files) {
          const dims = file.width ? `${file.width}x${file.height}` : "okänd storlek";
          addLog("search", `  ${file.format.toUpperCase()} (${file.type}) - ${dims}`, "info");
        }
      } else {
        addLog("search", data.error || "Ingen logo hittades", "warning");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Okänt fel";

      if (retryCount < 2) {
        addLog("search", `Fel: ${errorMsg}. Försöker igen...`, "warning");
        await sleep(1000);
        return doSearch(retryCount + 1);
      }

      addLog("search", `Fel: ${errorMsg}`, "error");
    }

    setStatus("online");
    setIsSearching(false);
  };

  // Batch fetch logos for all watched companies
  const startBatch = async () => {
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
      addLog("batch", "Inga bevakade bolag att hämta logos för", "warning");
      return;
    }

    runningRef.current = true;
    setIsRunning(true);
    setBatchResults([]);
    addLog("batch", `Startar logo-hämtning för ${companies.length} bolag...`, "step");
    setStatus("working");
    setBatchProgress(0);

    let successCount = 0;
    const results: LogoResult[] = [];
    const stats: Record<string, { success: number; fail: number }> = {};

    for (let i = 0; i < companies.length && runningRef.current; i++) {
      const company = companies[i];
      const progress = ((i + 1) / companies.length) * 100;

      // Try to derive domain from company name
      const domain = company.domain || guessDomainFromName(company.name);

      addLog("batch", `Söker: ${company.name} (${domain})...`, "info");
      setBatchProgress(progress - 5);

      try {
        const response = await fetch(`/api/media/logo?domain=${encodeURIComponent(domain)}`);

        if (!runningRef.current) break;

        if (response.ok) {
          const data: LogoResult = await response.json();
          results.push(data);

          if (data.success) {
            addLog("batch", `${company.name}: OK (${data.source})`, "success");
            successCount++;

            // Update stats
            const source = data.source || "unknown";
            if (!stats[source]) stats[source] = { success: 0, fail: 0 };
            stats[source].success++;
          } else {
            addLog("batch", `${company.name}: Ingen logo`, "warning");
          }
        } else {
          addLog("batch", `${company.name}: API-fel`, "warning");
        }
      } catch {
        addLog("batch", `${company.name}: Misslyckades`, "error");
      }

      setBatchProgress(progress);

      // Small delay between requests
      if (runningRef.current && i < companies.length - 1) {
        await sleep(300);
      }
    }

    if (runningRef.current) {
      setBatchResults(results);
      setApiStats(stats);
      addLog("batch", `Körning slutförd: ${successCount}/${companies.length} logos hämtade`, "success");
      setLastRun(new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }));
    }

    runningRef.current = false;
    setIsRunning(false);
    setStatus("online");
    setTimeout(() => setBatchProgress(0), 1000);
  };

  // Test API connection
  const testConnection = async () => {
    addLog("status", "Testar API-anslutningar...", "step");
    setStatus("working");

    const apis = [
      { name: "Brandfetch API", domain: "google.com" },
      { name: "Unavatar", domain: "spotify.com" },
      { name: "Google Favicons", domain: "github.com" },
    ];

    for (const api of apis) {
      addLog("status", `Testar ${api.name}...`, "info");
      await sleep(300);

      try {
        const response = await fetch(`/api/media/logo?domain=${api.domain}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            addLog("status", `${api.name}: OK (${data.source})`, "success");
          } else {
            addLog("status", `${api.name}: Ingen logo`, "warning");
          }
        } else {
          addLog("status", `${api.name}: Fel (${response.status})`, "error");
        }
      } catch {
        addLog("status", `${api.name}: Kunde inte nå`, "error");
      }
    }

    addLog("status", "Test slutfört", "success");
    setStatus("online");
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // LinkedIn company search
  const doLinkedinSearch = async () => {
    if (!linkedinQuery.trim()) return;

    setIsLinkedinSearching(true);
    setStatus("working");
    setLinkedinResult(null);

    addLog("linkedin", `Söker LinkedIn-profil för: "${linkedinQuery}"...`, "step");

    try {
      const response = await fetch(`/api/media/linkedin?company=${encodeURIComponent(linkedinQuery.trim())}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: LinkedInResult = await response.json();

      if (data.success && data.data) {
        setLinkedinResult(data);
        addLog("linkedin", `Hittade: ${data.data.name || linkedinQuery}`, "success");

        if (data.data.industry) {
          addLog("linkedin", `Bransch: ${data.data.industry}`, "info");
        }
        if (data.data.company_size) {
          addLog("linkedin", `Storlek: ${data.data.company_size}`, "info");
        }
        if (data.data.headquarters) {
          addLog("linkedin", `HQ: ${data.data.headquarters}`, "info");
        }
      } else {
        addLog("linkedin", data.error || "Ingen LinkedIn-profil hittades", "warning");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Okänt fel";
      addLog("linkedin", `Fel: ${errorMsg}`, "error");
    }

    setStatus("online");
    setIsLinkedinSearching(false);
  };

  // Helper to guess domain from company name
  const guessDomainFromName = (name: string): string => {
    // Remove common Swedish company suffixes
    const domain = name
      .toLowerCase()
      .replace(/\s*(ab|aktiebolag|hb|kb|ek\.?\s*för\.?|ekonomisk förening)\s*$/i, "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/[åä]/g, "a")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9]/g, "");

    return `${domain}.se`;
  };

  // Download logo
  const downloadLogo = async (file: LogoFile, domain: string) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${domain.replace(/\./g, "_")}_logo.${file.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addLog("search", `Laddade ner ${file.format.toUpperCase()} logo`, "success");
    } catch {
      addLog("search", "Kunde inte ladda ner logo", "error");
    }
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
    };
  }, []);

  const viewTitles: Record<ViewType, string> = { search: "Hämta logo", batch: "Batch-hämtning", status: "Status", linkedin: "LinkedIn" };

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
            <Image className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <span className={styles.btnSubtitle}>Media & Logos</span>
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
                <Image className="w-3 h-3" />
              </div>
              Media
            </div>
            <button className={styles.menuClose} onClick={closeMenu}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className={styles.menuItems}>
            <div className={styles.menuItem} onClick={() => openExpanded("search")}>
              <div className={styles.menuIcon}><Search className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>Hämta logo</div>
                <div className={styles.menuDesc}>Sök på domän eller bolagsnamn</div>
              </div>
            </div>
            <div className={styles.menuItem} onClick={() => openExpanded("batch")}>
              <div className={styles.menuIcon}><RefreshCw className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>Batch-hämtning</div>
                <div className={styles.menuDesc}>Hämta logos för alla bevakade bolag</div>
              </div>
            </div>
            <div className={styles.menuItem} onClick={() => openExpanded("linkedin")}>
              <div className={styles.menuIcon}><Linkedin className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>LinkedIn</div>
                <div className={styles.menuDesc}>Hämta bolagsprofil från LinkedIn</div>
              </div>
            </div>
            <div className={styles.menuItem} onClick={() => openExpanded("status")}>
              <div className={styles.menuIcon}><Activity className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>Status</div>
                <div className={styles.menuDesc}>API-status och statistik</div>
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
                    placeholder="Domän (t.ex. volvo.com)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                    autoFocus
                  />
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => doSearch()} disabled={isSearching}>
                    {isSearching ? "..." : "Sök"}
                  </button>
                </div>

                {/* Logo Preview */}
                {logoResult && logoResult.success && logoResult.files.length > 0 && (
                  <div className={styles.projects}>
                    <div className={styles.sectionTitle}>
                      <Image className="w-3.5 h-3.5" />
                      Resultat ({logoResult.files.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                      {logoResult.files.slice(0, 4).map((file, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "var(--widget-surface)",
                            borderRadius: "8px",
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            flex: "1 1 calc(50% - 4px)",
                            minWidth: "120px",
                          }}
                        >
                          <div style={{
                            width: "80px",
                            height: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "white",
                            borderRadius: "4px",
                            padding: "8px",
                          }}>
                            <img
                              src={file.url}
                              alt={`Logo ${file.type}`}
                              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                          <div style={{ fontSize: "10px", color: "var(--widget-text-dim)", textAlign: "center" }}>
                            {file.format.toUpperCase()} {file.width ? `(${file.width}px)` : ""}
                          </div>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              className={`${styles.btn} ${styles.btnGhost}`}
                              style={{ padding: "4px 8px", fontSize: "10px" }}
                              onClick={() => downloadLogo(file, logoResult.domain)}
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.btn} ${styles.btnGhost}`}
                              style={{ padding: "4px 8px", fontSize: "10px" }}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      <div className={styles.logEmpty}>Sök efter en domän för att hämta logo</div>
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

            {/* Batch View */}
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
                    onClick={startBatch}
                    style={{ flex: 1 }}
                  >
                    {isRunning ? <><Square className="w-3.5 h-3.5" />Stoppa</> : <><Play className="w-3.5 h-3.5" />Starta hämtning</>}
                  </button>
                </div>

                {batchProgress > 0 && (
                  <div className={styles.progress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${batchProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Results summary */}
                {batchResults.length > 0 && !isRunning && (
                  <div className={styles.summary}>
                    <span className={`${styles.summaryItem} ${styles.summaryItemSuccess}`}>
                      {batchResults.filter(r => r.success).length} hämtade
                    </span>
                    <span className={styles.summaryItem}>
                      {batchResults.filter(r => !r.success).length} missade
                    </span>
                  </div>
                )}

                <div className={styles.logPanel}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTitle}>Aktivitet</span>
                    {batchLogs.length > 0 && <button className={styles.logClear} onClick={() => clearLog("batch")}>Rensa</button>}
                  </div>
                  <div className={styles.logContent}>
                    {batchLogs.length === 0 ? (
                      <div className={styles.logEmpty}>Starta hämtning för att se aktivitet</div>
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

            {/* LinkedIn View */}
            {currentView === "linkedin" && (
              <div className={styles.view}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Bolagsnamn (t.ex. volvo, klarna)..."
                    value={linkedinQuery}
                    onChange={(e) => setLinkedinQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doLinkedinSearch()}
                    autoFocus
                  />
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={doLinkedinSearch} disabled={isLinkedinSearching}>
                    {isLinkedinSearching ? "..." : "Sök"}
                  </button>
                </div>

                {/* LinkedIn Result */}
                {linkedinResult && linkedinResult.success && linkedinResult.data && (
                  <div className={styles.projects}>
                    <div className={styles.sectionTitle}>
                      <Linkedin className="w-3.5 h-3.5" />
                      {linkedinResult.data.name || linkedinResult.company}
                    </div>
                    <div style={{ background: "var(--widget-surface)", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
                      {linkedinResult.data.about_us && (
                        <p style={{ fontSize: "12px", color: "var(--widget-text)", lineHeight: "1.5", marginBottom: "12px" }}>
                          {linkedinResult.data.about_us.length > 200
                            ? linkedinResult.data.about_us.slice(0, 200) + "..."
                            : linkedinResult.data.about_us}
                        </p>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                        {linkedinResult.data.industry && (
                          <div>
                            <span style={{ color: "var(--widget-text-dim)" }}>Bransch:</span>{" "}
                            <span style={{ color: "var(--widget-text)" }}>{linkedinResult.data.industry}</span>
                          </div>
                        )}
                        {linkedinResult.data.company_size && (
                          <div>
                            <span style={{ color: "var(--widget-text-dim)" }}>Storlek:</span>{" "}
                            <span style={{ color: "var(--widget-text)" }}>{linkedinResult.data.company_size}</span>
                          </div>
                        )}
                        {linkedinResult.data.headquarters && (
                          <div>
                            <span style={{ color: "var(--widget-text-dim)" }}>HQ:</span>{" "}
                            <span style={{ color: "var(--widget-text)" }}>{linkedinResult.data.headquarters}</span>
                          </div>
                        )}
                        {linkedinResult.data.founded && (
                          <div>
                            <span style={{ color: "var(--widget-text-dim)" }}>Grundat:</span>{" "}
                            <span style={{ color: "var(--widget-text)" }}>{linkedinResult.data.founded}</span>
                          </div>
                        )}
                        {linkedinResult.data.headcount && (
                          <div>
                            <span style={{ color: "var(--widget-text-dim)" }}>Anställda:</span>{" "}
                            <span style={{ color: "var(--widget-text)" }}>{linkedinResult.data.headcount.toLocaleString()}</span>
                          </div>
                        )}
                        {linkedinResult.data.website && (
                          <div>
                            <span style={{ color: "var(--widget-text-dim)" }}>Webb:</span>{" "}
                            <a href={linkedinResult.data.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--widget-accent)" }}>
                              {linkedinResult.data.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        )}
                      </div>
                      {linkedinResult.data.specialties && linkedinResult.data.specialties.length > 0 && (
                        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {linkedinResult.data.specialties.slice(0, 5).map((spec, idx) => (
                            <span key={idx} style={{
                              background: "var(--widget-bg)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              color: "var(--widget-text-dim)"
                            }}>
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                      {linkedinResult.linkedinUrl && (
                        <div style={{ marginTop: "12px" }}>
                          <a
                            href={linkedinResult.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.btn} ${styles.btnGhost}`}
                            style={{ fontSize: "11px" }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Öppna på LinkedIn
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Live Log */}
                <div className={styles.logPanel}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTitle}>Aktivitet</span>
                    {linkedinLogs.length > 0 && (
                      <button className={styles.logClear} onClick={() => clearLog("linkedin")}>Rensa</button>
                    )}
                  </div>
                  <div className={styles.logContent} ref={logContainerRef}>
                    {linkedinLogs.length === 0 ? (
                      <div className={styles.logEmpty}>Sök efter ett bolag för att hämta LinkedIn-profil</div>
                    ) : (
                      linkedinLogs.map(log => (
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
                      <div className={`${styles.statValue} ${styles.statValueOnline}`}>6 källor</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <Image className="w-4 h-4" />
                    <div className={styles.statContent}>
                      <div className={styles.statLabel}>Format</div>
                      <div className={styles.statValue}>SVG, PNG</div>
                    </div>
                  </div>
                </div>

                {/* API sources list */}
                <div className={styles.projects} style={{ marginBottom: "12px" }}>
                  <div className={styles.sectionTitle}>
                    <Activity className="w-3.5 h-3.5" />
                    API-källor (prioritetsordning)
                  </div>
                  {[
                    { name: "Brandfetch API", desc: "SVG/PNG, flera storlekar" },
                    { name: "Brandfetch CDN", desc: "Snabb, en fil" },
                    { name: "Unavatar", desc: "Aggregerar källor" },
                    { name: "Google Favicons", desc: "128px ikoner" },
                    { name: "DuckDuckGo", desc: "ICO-ikoner" },
                    { name: "Logo.dev", desc: "Backup" },
                  ].map((api, idx) => (
                    <div key={idx} className={styles.project} style={{ cursor: "default" }}>
                      <div className={styles.projectHeader}>
                        <div className={styles.projectTitle}>{idx + 1}. {api.name}</div>
                        <div className={styles.projectId}>{api.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.actionRow}>
                  <button className={`${styles.btn} ${styles.btnGhost}`} onClick={testConnection}>
                    Testa anslutningar
                  </button>
                </div>

                <div className={styles.logPanel}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTitle}>Aktivitet</span>
                    {statusLogs.length > 0 && <button className={styles.logClear} onClick={() => clearLog("status")}>Rensa</button>}
                  </div>
                  <div className={styles.logContent} ref={logContainerRef}>
                    {statusLogs.length === 0 ? (
                      <div className={styles.logEmpty}>Testa anslutningar för att se status</div>
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
