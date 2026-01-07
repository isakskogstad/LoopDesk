"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronRight, ChevronLeft, X, Building2, ExternalLink, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/hooks/use-click-outside";
import styles from "./widget-styles.module.css";

type WidgetState = "button" | "menu" | "expanded";
type StatusType = "online" | "working" | "offline";

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "step";
}

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

export function BolagsverketWidget() {
  const router = useRouter();
  const [state, setState] = useState<WidgetState>("button");
  const [status, setStatus] = useState<StatusType>("online");
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedVisible, setExpandedVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Global loading state for button
  const [isGloballyBusy, setIsGloballyBusy] = useState(false);

  const logIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Click outside to close menu/expanded
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
    setLogs(prev => [...prev.slice(-50), entry]);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bolagsverket-recent-searches");
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecentSearches(parsed.slice(0, 5));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Update global busy state
  useEffect(() => {
    setIsGloballyBusy(isSearching);
  }, [isSearching]);

  const saveRecentSearch = (orgNr: string, name: string) => {
    const newSearch: RecentSearch = { orgNr, name, timestamp: Date.now() };
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.orgNr !== orgNr);
      const updated = [newSearch, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("bolagsverket-recent-searches", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const clearLogs = () => setLogs([]);

  const openMenu = () => {
    setState("menu");
    setTimeout(() => setMenuVisible(true), 10);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setTimeout(() => setState("button"), 250);
  };

  const openExpanded = () => {
    setMenuVisible(false);
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

  // Debounced search
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

  // Handle search input with debounce
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

  // Navigate to company page
  const selectCompany = (result: SearchResult) => {
    saveRecentSearch(result.orgNr, result.name);
    addLog(`Öppnar: ${result.name}`, "success");
    closeAll();
    router.push(`/bolag/${result.orgNr}`);
  };

  // Open recent search
  const openRecent = (recent: RecentSearch) => {
    saveRecentSearch(recent.orgNr, recent.name);
    closeAll();
    router.push(`/bolag/${recent.orgNr}`);
  };

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
            <img src="/logos/bolagsverket.png" alt="Bolagsverket" />
          </div>
          <span className={styles.btnSubtitle}>Bolagssök</span>
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
                <Building2 className="w-3 h-3" />
              </div>
              Bolagsverket
            </div>
            <button className={styles.menuClose} onClick={closeMenu}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className={styles.menuItems}>
            <div className={styles.menuItem} onClick={openExpanded}>
              <div className={styles.menuIcon}><Search className="w-4 h-4" /></div>
              <div>
                <div className={styles.menuLabel}>Sök företag</div>
                <div className={styles.menuDesc}>Sök på namn eller org.nr</div>
              </div>
            </div>
            {recentSearches.length > 0 && (
              <div className={styles.menuItem} onClick={openExpanded}>
                <div className={styles.menuIcon}><Clock className="w-4 h-4" /></div>
                <div>
                  <div className={styles.menuLabel}>Senaste sökningar</div>
                  <div className={styles.menuDesc}>{recentSearches.length} företag</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE 3: Expanded */}
      {state === "expanded" && (
        <div className={`${styles.expanded} ${expandedVisible ? styles.expandedVisible : ""}`}>
          <div className={styles.expandedHeader}>
            <div className={styles.expandedTitle}>
              <div className={`${styles.statusDot} ${status === "online" ? styles.statusDotOnline : status === "working" ? styles.statusDotWorking : ""}`} />
              <span>Sök företag</span>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.headerBtn} onClick={backToMenu}><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button className={styles.headerBtn} onClick={closeAll}><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className={styles.expandedBody}>
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
                  className={`${styles.btn} ${styles.btnPrimary}`}
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
          </div>
        </div>
      )}
    </div>
  );
}
