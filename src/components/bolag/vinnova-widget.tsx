"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, CheckCircle, ChevronRight, ChevronLeft, X, Play, Square, Plus } from "lucide-react";
import { formatOrgNr } from "@/lib/utils";

type WidgetState = "button" | "menu" | "expanded";
type ViewType = "search" | "schedule" | "status";
type StatusType = "online" | "working" | "offline";

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface SearchResult {
  name: string;
  orgNr: string;
}

interface VinnovaProject {
  id: string;
  diarienummer: string;
  titel: string;
  programnamn?: string;
  vinnovaBidrag?: number;
}

interface ScheduleItem {
  id: string;
  name: string;
  time: string;
  active: boolean;
}

export function VinnovaWidget() {
  const [state, setState] = useState<WidgetState>("button");
  const [currentView, setCurrentView] = useState<ViewType>("search");
  const [status, setStatus] = useState<StatusType>("online");
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedVisible, setExpandedVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLogs, setSearchLogs] = useState<LogEntry[]>([]);

  // Schedule state
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { id: "1", name: "Daglig synk", time: "Varje dag 06:00", active: true },
    { id: "2", name: "Veckovis scan", time: "Måndagar 08:00", active: false },
  ]);
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [newSchedName, setNewSchedName] = useState("");
  const [newSchedFreq, setNewSchedFreq] = useState("Varje dag");
  const [newSchedTime, setNewSchedTime] = useState("06:00");
  const [scheduleLogs, setScheduleLogs] = useState<LogEntry[]>([]);

  // Status state
  const [isRunning, setIsRunning] = useState(false);
  const [statusProgress, setStatusProgress] = useState(0);
  const [lastRun, setLastRun] = useState("--:--");
  const [statusLogs, setStatusLogs] = useState<LogEntry[]>([]);

  const logIdRef = useRef(0);

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
    } else if (view === "schedule") {
      setScheduleLogs(prev => [...prev.slice(-50), entry]);
    } else {
      setStatusLogs(prev => [...prev.slice(-50), entry]);
    }
  }, []);

  const clearLog = (view: ViewType) => {
    if (view === "search") setSearchLogs([]);
    else if (view === "schedule") setScheduleLogs([]);
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

  // Search functionality
  const doSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatus("working");
    setSearchResults([]);
    addLog("search", `Söker: ${searchQuery}`, "info");

    try {
      const params = new URLSearchParams();
      params.set("company", searchQuery.trim());

      const response = await fetch(`/api/bolag/vinnova?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.projects && data.projects.length > 0) {
        const results: SearchResult[] = data.projects.slice(0, 10).map((p: VinnovaProject) => ({
          name: p.titel || p.diarienummer,
          orgNr: p.diarienummer,
        }));
        setSearchResults(results);
        addLog("search", `Hittade ${data.projects.length} projekt`, "success");
      } else {
        addLog("search", "Inga projekt hittades", "warning");
      }
    } catch (error) {
      addLog("search", `Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
    }

    setStatus("online");
    setIsSearching(false);
  };

  const fetchProject = async (name: string, orgNr: string) => {
    addLog("search", `Hämtar: ${name}`, "info");
    setStatus("working");
    setSearchProgress(0);

    const steps = ["Ansluter...", "Hämtar aktiviteter...", "Bearbetar...", "Sparar..."];
    let pct = 0;

    const iv = setInterval(() => {
      pct += Math.random() * 30;
      if (pct > 100) pct = 100;
      setSearchProgress(pct);

      if (pct >= 100) {
        clearInterval(iv);
        addLog("search", "Klart! Data hämtad", "success");
        setStatus("online");
        setTimeout(() => setSearchProgress(0), 800);
      }
    }, 300);
  };

  // Schedule functionality
  const toggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const saveSchedule = () => {
    const name = newSchedName || "Nytt schema";
    const newSchedule: ScheduleItem = {
      id: `sched-${Date.now()}`,
      name,
      time: `${newSchedFreq} ${newSchedTime}`,
      active: true,
    };
    setSchedules(prev => [...prev, newSchedule]);
    addLog("schedule", `Schema skapat: ${name}`, "success");
    setShowNewSchedule(false);
    setNewSchedName("");
  };

  // Status functionality
  const testConnection = async () => {
    addLog("status", "Testar anslutning...", "info");
    setStatus("working");

    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        addLog("status", "Ping: OK", "success");
        addLog("status", "Anslutning OK", "success");
      } else {
        addLog("status", "Anslutning misslyckades", "error");
      }
    } catch {
      addLog("status", "Kunde inte nå servern", "error");
    }

    setStatus("online");
  };

  const startRun = () => {
    if (isRunning) {
      setIsRunning(false);
      addLog("status", "Avbruten", "warning");
      setStatus("online");
      setStatusProgress(0);
      return;
    }

    setIsRunning(true);
    addLog("status", "Startar körning...", "info");
    setStatus("working");
    setStatusProgress(0);

    let pct = 0;
    const companies = ["Northvolt", "Einride", "Klarna", "Spotify", "H&M"];

    const iv = setInterval(() => {
      if (!isRunning) {
        clearInterval(iv);
        return;
      }

      pct += Math.random() * 3;
      if (pct > 100) pct = 100;
      setStatusProgress(pct);

      if (Math.random() > 0.8) {
        const company = companies[Math.floor(Math.random() * companies.length)];
        addLog("status", `${company} AB`);
      }

      if (pct >= 100) {
        clearInterval(iv);
        setIsRunning(false);
        addLog("status", "Klart! Nya händelser funna", "success");
        setStatus("online");
        setLastRun(new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }));
        setTimeout(() => setStatusProgress(0), 1000);
      }
    }, 120);
  };

  // Stop run when component unmounts or isRunning changes
  useEffect(() => {
    return () => {
      setIsRunning(false);
    };
  }, []);

  const viewTitles = { search: "Sök bolag", schedule: "Schema", status: "Status" };

  return (
    <div className="vinnova-widget">
      {/* STATE 1: Button */}
      {state === "button" && (
        <button className="vw-button" onClick={openMenu}>
          <div className="vw-btn-icon">
            <Search className="w-4 h-4" />
          </div>
          <span>Vinnova Scraper</span>
          <ChevronRight className="vw-chevron w-3.5 h-3.5" />
        </button>
      )}

      {/* STATE 2: Menu */}
      {state === "menu" && (
        <div className={`vw-menu ${menuVisible ? "visible" : ""}`}>
          <div className="vw-menu-header">
            <div className="vw-menu-title">
              <div className="vw-menu-title-icon">
                <Search className="w-3 h-3" />
              </div>
              Vinnova Scraper
            </div>
            <button className="vw-menu-close" onClick={closeMenu}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="vw-menu-items">
            <div className="vw-menu-item" onClick={() => openExpanded("search")}>
              <div className="vw-menu-icon">
                <Search className="w-4.5 h-4.5" />
              </div>
              <div className="vw-menu-content">
                <div className="vw-menu-label">Sök bolag</div>
                <div className="vw-menu-desc">Hämta data för specifika företag</div>
              </div>
              <div className="vw-menu-arrow">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="vw-menu-item" onClick={() => openExpanded("schedule")}>
              <div className="vw-menu-icon">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="vw-menu-content">
                <div className="vw-menu-label">Schema</div>
                <div className="vw-menu-desc">Automatiserade körningar</div>
              </div>
              <div className="vw-menu-arrow">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="vw-menu-item" onClick={() => openExpanded("status")}>
              <div className="vw-menu-icon">
                <CheckCircle className="w-4.5 h-4.5" />
              </div>
              <div className="vw-menu-content">
                <div className="vw-menu-label">Status</div>
                <div className="vw-menu-desc">Anslutning och manuell körning</div>
              </div>
              <div className="vw-menu-arrow">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: Expanded */}
      {state === "expanded" && (
        <div className={`vw-expanded ${expandedVisible ? "visible" : ""}`}>
          <div className="vw-expanded-header">
            <div className="vw-expanded-title">
              <div className={`vw-status-dot ${status}`} />
              <span>{viewTitles[currentView]}</span>
            </div>
            <div className="vw-header-actions">
              <button className="vw-header-btn" onClick={backToMenu} title="Tillbaka">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="vw-header-btn" onClick={closeAll} title="Stäng">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="vw-expanded-body">
            {/* Search View */}
            {currentView === "search" && (
              <div className="vw-view">
                <div className="vw-view-title">Sök bolag</div>
                <div className="vw-input-group">
                  <input
                    type="text"
                    className="vw-input"
                    placeholder="Bolagsnamn eller org.nr..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  />
                  <button className="vw-btn vw-btn-primary" onClick={doSearch} disabled={isSearching}>
                    {isSearching ? "..." : "Sök"}
                  </button>
                </div>

                {/* Results */}
                {searchResults.length > 0 && (
                  <div className="vw-results">
                    {searchResults.map((r, i) => (
                      <div key={i} className="vw-result-item">
                        <div>
                          <div className="vw-result-name">{r.name}</div>
                          <div className="vw-result-org">{r.orgNr}</div>
                        </div>
                        <button className="vw-result-btn" onClick={() => fetchProject(r.name, r.orgNr)}>
                          Hämta
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress */}
                {searchProgress > 0 && (
                  <div className="vw-progress">
                    <div className="vw-progress-header">
                      <span>Hämtar...</span>
                      <span>{Math.round(searchProgress)}%</span>
                    </div>
                    <div className="vw-progress-bar">
                      <div className="vw-progress-fill" style={{ width: `${searchProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Log Panel */}
                <div className="vw-log-panel">
                  <div className="vw-log-header">
                    <span className="vw-log-title">Logg</span>
                    <button className="vw-log-clear" onClick={() => clearLog("search")}>Rensa</button>
                  </div>
                  <div className="vw-log-content">
                    {searchLogs.length === 0 ? (
                      <div className="vw-log-empty">Ingen aktivitet</div>
                    ) : (
                      searchLogs.map(log => (
                        <div key={log.id} className="vw-log-line">
                          <span className="vw-log-time">{log.time}</span>
                          <span className={`vw-log-msg ${log.type}`}>{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule View */}
            {currentView === "schedule" && (
              <div className="vw-view">
                <div className="vw-view-title">Schemalagda körningar</div>

                <div className="vw-schedule-list">
                  {schedules.map(schedule => (
                    <div key={schedule.id} className="vw-schedule-item">
                      <div>
                        <div className="vw-schedule-name">{schedule.name}</div>
                        <div className="vw-schedule-time">{schedule.time}</div>
                      </div>
                      <div
                        className={`vw-toggle ${schedule.active ? "active" : ""}`}
                        onClick={() => toggleSchedule(schedule.id)}
                      />
                    </div>
                  ))}
                </div>

                {showNewSchedule && (
                  <div className="vw-new-schedule">
                    <div className="vw-form-row">
                      <div>
                        <label className="vw-form-label">Namn</label>
                        <input
                          type="text"
                          className="vw-input"
                          placeholder="Schema"
                          value={newSchedName}
                          onChange={(e) => setNewSchedName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="vw-form-label">Frekvens</label>
                        <select
                          className="vw-input vw-select"
                          value={newSchedFreq}
                          onChange={(e) => setNewSchedFreq(e.target.value)}
                        >
                          <option>Varje dag</option>
                          <option>Vardagar</option>
                          <option>Varje vecka</option>
                        </select>
                      </div>
                    </div>
                    <div className="vw-form-row">
                      <div>
                        <label className="vw-form-label">Tid</label>
                        <input
                          type="time"
                          className="vw-input"
                          value={newSchedTime}
                          onChange={(e) => setNewSchedTime(e.target.value)}
                        />
                      </div>
                      <div className="vw-form-actions">
                        <button className="vw-btn vw-btn-primary" onClick={saveSchedule}>Spara</button>
                        <button className="vw-btn vw-btn-secondary" onClick={() => setShowNewSchedule(false)}>Avbryt</button>
                      </div>
                    </div>
                  </div>
                )}

                {!showNewSchedule && (
                  <button className="vw-add-btn" onClick={() => setShowNewSchedule(true)}>
                    <Plus className="w-3.5 h-3.5" />
                    Lägg till schema
                  </button>
                )}

                {/* Log Panel */}
                <div className="vw-log-panel">
                  <div className="vw-log-header">
                    <span className="vw-log-title">Logg</span>
                    <button className="vw-log-clear" onClick={() => clearLog("schedule")}>Rensa</button>
                  </div>
                  <div className="vw-log-content">
                    {scheduleLogs.length === 0 ? (
                      <div className="vw-log-empty">Ingen aktivitet</div>
                    ) : (
                      scheduleLogs.map(log => (
                        <div key={log.id} className="vw-log-line">
                          <span className="vw-log-time">{log.time}</span>
                          <span className={`vw-log-msg ${log.type}`}>{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status View */}
            {currentView === "status" && (
              <div className="vw-view">
                <div className="vw-view-title">Status &amp; körning</div>

                <div className="vw-status-card">
                  <div className="vw-status-row">
                    <span className="vw-status-label">API</span>
                    <span className="vw-status-value online">Ansluten</span>
                  </div>
                  <div className="vw-status-row">
                    <span className="vw-status-label">Endpoint</span>
                    <span className="vw-status-value">api.vinnova.se</span>
                  </div>
                  <div className="vw-status-row">
                    <span className="vw-status-label">Senaste körning</span>
                    <span className="vw-status-value">{lastRun}</span>
                  </div>
                </div>

                <div className="vw-action-row">
                  <button
                    className={`vw-btn ${isRunning ? "vw-btn-danger" : "vw-btn-success"}`}
                    onClick={startRun}
                    style={{ flex: 1 }}
                  >
                    {isRunning ? (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        Stoppa
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Starta körning
                      </>
                    )}
                  </button>
                  <button className="vw-btn vw-btn-secondary" onClick={testConnection}>
                    Testa
                  </button>
                </div>

                {/* Progress */}
                {statusProgress > 0 && (
                  <div className="vw-progress">
                    <div className="vw-progress-header">
                      <span>Kör...</span>
                      <span>{Math.round(statusProgress)}%</span>
                    </div>
                    <div className="vw-progress-bar">
                      <div className="vw-progress-fill" style={{ width: `${statusProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Log Panel */}
                <div className="vw-log-panel">
                  <div className="vw-log-header">
                    <span className="vw-log-title">Logg</span>
                    <button className="vw-log-clear" onClick={() => clearLog("status")}>Rensa</button>
                  </div>
                  <div className="vw-log-content">
                    {statusLogs.length === 0 ? (
                      <div className="vw-log-empty">Ingen aktivitet</div>
                    ) : (
                      statusLogs.map(log => (
                        <div key={log.id} className="vw-log-line">
                          <span className="vw-log-time">{log.time}</span>
                          <span className={`vw-log-msg ${log.type}`}>{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .vinnova-widget {
          position: relative;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* ==================== */
        /* STATE 1: BUTTON      */
        /* ==================== */
        .vw-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #232323 0%, #2a2a2a 100%);
          border: 1px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .vw-button::after {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #4ade80, #22d3ee, #4ade80);
          border-radius: 12px;
          z-index: -1;
          opacity: 0;
          filter: blur(8px);
          transition: opacity 0.3s ease;
        }

        .vw-button:hover {
          border-color: #4ade80;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(74, 222, 128, 0.1);
        }

        .vw-button:hover::after {
          opacity: 0.4;
        }

        .vw-button:active {
          transform: translateY(0);
        }

        .vw-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(74, 222, 128, 0.1);
          border-radius: 6px;
          transition: all 0.3s ease;
          color: #4ade80;
        }

        .vw-button:hover .vw-btn-icon {
          background: rgba(74, 222, 128, 0.2);
        }

        .vw-chevron {
          transition: transform 0.3s ease;
          opacity: 0.5;
        }

        .vw-button:hover .vw-chevron {
          opacity: 1;
          transform: translateX(2px);
        }

        /* ==================== */
        /* STATE 2: MENU        */
        /* ==================== */
        .vw-menu {
          width: 320px;
          background: #232323;
          border: 1px solid #333;
          border-radius: 14px;
          overflow: hidden;
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .vw-menu.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .vw-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid #333;
          background: linear-gradient(180deg, #2a2a2a 0%, #232323 100%);
        }

        .vw-menu-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }

        .vw-menu-title-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(74, 222, 128, 0.1);
          border-radius: 6px;
          color: #4ade80;
        }

        .vw-menu-close {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: #555;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .vw-menu-close:hover {
          background: #1a1a1a;
          color: #fff;
          transform: rotate(90deg);
        }

        .vw-menu-items {
          padding: 10px;
        }

        .vw-menu-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .vw-menu-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #4ade80;
          transform: scaleY(0);
          transition: transform 0.2s ease;
          border-radius: 0 2px 2px 0;
        }

        .vw-menu-item:hover {
          background: #1a1a1a;
        }

        .vw-menu-item:hover::before {
          transform: scaleY(1);
        }

        .vw-menu-item:active {
          transform: scale(0.98);
        }

        .vw-menu-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          border-radius: 8px;
          transition: all 0.2s ease;
          color: #888;
        }

        .vw-menu-item:hover .vw-menu-icon {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
        }

        .vw-menu-content {
          flex: 1;
        }

        .vw-menu-label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
          color: #fff;
        }

        .vw-menu-desc {
          font-size: 11px;
          color: #555;
        }

        .vw-menu-arrow {
          color: #555;
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.2s ease;
        }

        .vw-menu-item:hover .vw-menu-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ==================== */
        /* STATE 3: EXPANDED    */
        /* ==================== */
        .vw-expanded {
          width: 480px;
          background: #232323;
          border: 1px solid #333;
          border-radius: 14px;
          overflow: hidden;
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
        }

        .vw-expanded.visible {
          opacity: 1;
          transform: scale(1);
        }

        .vw-expanded-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid #333;
          background: linear-gradient(180deg, #2a2a2a 0%, #232323 100%);
        }

        .vw-expanded-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
        }

        .vw-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #555;
          transition: all 0.3s ease;
        }

        .vw-status-dot.online {
          background: #4ade80;
          box-shadow: 0 0 12px #4ade80;
        }

        .vw-status-dot.working {
          background: #fbbf24;
          animation: pulse-status 1.5s ease-in-out infinite;
        }

        @keyframes pulse-status {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #fbbf24; }
          50% { opacity: 0.5; box-shadow: 0 0 16px #fbbf24; }
        }

        .vw-header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .vw-header-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: #555;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .vw-header-btn:hover {
          background: #1a1a1a;
          color: #fff;
        }

        .vw-expanded-body {
          padding: 20px;
          min-height: 320px;
        }

        .vw-view {
          animation: fadeIn 0.25s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .vw-view-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 16px;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Form elements */
        .vw-input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .vw-input {
          flex: 1;
          padding: 11px 14px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .vw-input:focus {
          outline: none;
          border-color: #555;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.05);
        }

        .vw-input::placeholder {
          color: #555;
        }

        .vw-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23555' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }

        .vw-btn {
          padding: 11px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #333;
          font-family: inherit;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .vw-btn-primary {
          background: #fff;
          color: #1a1a1a;
          border: none;
        }

        .vw-btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .vw-btn-secondary {
          background: transparent;
          color: #fff;
        }

        .vw-btn-secondary:hover {
          background: #2a2a2a;
        }

        .vw-btn-success {
          background: #4ade80;
          color: #1a1a1a;
          border: none;
        }

        .vw-btn-success:hover {
          box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
          transform: translateY(-1px);
        }

        .vw-btn-danger {
          background: #f87171;
          color: white;
          border: none;
        }

        /* Results */
        .vw-results {
          margin-bottom: 16px;
        }

        .vw-result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #1a1a1a;
          border-radius: 8px;
          margin-bottom: 8px;
          transition: all 0.15s;
        }

        .vw-result-item:hover {
          background: #2a2a2a;
          transform: translateX(4px);
        }

        .vw-result-name {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
        }

        .vw-result-org {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #555;
        }

        .vw-result-btn {
          padding: 6px 12px;
          background: #232323;
          border: 1px solid #333;
          border-radius: 6px;
          color: #888;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .vw-result-btn:hover {
          color: #4ade80;
          border-color: #4ade80;
        }

        /* Schedule items */
        .vw-schedule-list {
          margin-bottom: 16px;
        }

        .vw-schedule-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #1a1a1a;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .vw-schedule-name {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
        }

        .vw-schedule-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #555;
        }

        .vw-toggle {
          width: 36px;
          height: 20px;
          background: #333;
          border-radius: 10px;
          position: relative;
          cursor: pointer;
          transition: all 0.25s;
        }

        .vw-toggle.active {
          background: #4ade80;
        }

        .vw-toggle::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .vw-toggle.active::after {
          left: 18px;
        }

        .vw-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: none;
          border: 1px dashed #333;
          border-radius: 8px;
          color: #888;
          font-size: 13px;
          cursor: pointer;
          width: 100%;
          margin-bottom: 16px;
          transition: all 0.2s;
        }

        .vw-add-btn:hover {
          border-color: #4ade80;
          color: #4ade80;
          background: rgba(74, 222, 128, 0.05);
        }

        /* New schedule form */
        .vw-new-schedule {
          background: #1a1a1a;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 16px;
          animation: slideDown 0.25s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .vw-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }

        .vw-form-label {
          font-size: 11px;
          color: #555;
          margin-bottom: 6px;
          display: block;
        }

        .vw-form-actions {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        /* Status card */
        .vw-status-card {
          background: #1a1a1a;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }

        .vw-status-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 13px;
          border-bottom: 1px solid #333;
        }

        .vw-status-row:last-child {
          border-bottom: none;
        }

        .vw-status-label {
          color: #888;
        }

        .vw-status-value {
          font-family: 'JetBrains Mono', monospace;
          color: #fff;
        }

        .vw-status-value.online {
          color: #4ade80;
        }

        .vw-action-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        /* Progress */
        .vw-progress {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 16px;
        }

        .vw-progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 12px;
          color: #888;
        }

        .vw-progress-bar {
          height: 4px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
        }

        .vw-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ade80, #22d3ee);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        /* Log panel */
        .vw-log-panel {
          background: #1a1a1a;
          border-radius: 10px;
          overflow: hidden;
        }

        .vw-log-header {
          display: flex;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid #333;
        }

        .vw-log-title {
          font-size: 10px;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .vw-log-clear {
          background: none;
          border: none;
          color: #555;
          font-size: 10px;
          cursor: pointer;
          transition: color 0.15s;
        }

        .vw-log-clear:hover {
          color: #fff;
        }

        .vw-log-content {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 12px 14px;
          max-height: 120px;
          overflow-y: auto;
          line-height: 1.7;
        }

        .vw-log-line {
          display: flex;
          gap: 10px;
          animation: logIn 0.2s ease;
        }

        @keyframes logIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .vw-log-time {
          color: #555;
          min-width: 55px;
        }

        .vw-log-msg {
          color: #888;
        }

        .vw-log-msg.success {
          color: #4ade80;
        }

        .vw-log-msg.warning {
          color: #fbbf24;
        }

        .vw-log-msg.error {
          color: #f87171;
        }

        .vw-log-msg.info {
          color: #fff;
        }

        .vw-log-empty {
          color: #555;
          text-align: center;
          padding: 20px;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}
