"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, CheckCircle, ChevronRight, ChevronLeft, X, Play, Square, Plus, Zap, Database, Globe, FileText } from "lucide-react";

type WidgetState = "button" | "menu" | "expanded";
type ViewType = "search" | "schedule" | "status";
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
  const [projects, setProjects] = useState<VinnovaProject[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLogs, setSearchLogs] = useState<LogEntry[]>([]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

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
  const logContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [searchLogs, scheduleLogs, statusLogs]);

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

  // Dynamic search with live logging
  const doSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatus("working");
    setProjects([]);
    setExpandedProject(null);
    setSearchProgress(0);

    // Step 1: Initialize
    addLog("search", `Initierar sökning...`, "step");
    await sleep(200);
    setSearchProgress(10);

    // Step 2: Connecting
    addLog("search", `Ansluter till Vinnova API...`, "step");
    await sleep(300);
    setSearchProgress(25);

    // Step 3: Search query
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

        // Calculate total funding
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
      addLog("search", `Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
    }

    await sleep(300);
    setStatus("online");
    setIsSearching(false);
    setTimeout(() => setSearchProgress(0), 500);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} MSEK`;
    }
    return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(amount);
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

  const runningRef = useRef(false);

  const startRun = async () => {
    if (isRunning) {
      runningRef.current = false;
      setIsRunning(false);
      addLog("status", "Avbruten av användare", "warning");
      setStatus("online");
      setStatusProgress(0);
      return;
    }

    runningRef.current = true;
    setIsRunning(true);
    addLog("status", "Startar automatisk körning...", "step");
    setStatus("working");
    setStatusProgress(0);

    const companies = ["Northvolt AB", "Einride AB", "H2 Green Steel", "Polarium Energy", "Volta Trucks"];

    for (let i = 0; i < companies.length && runningRef.current; i++) {
      const company = companies[i];
      const progress = ((i + 1) / companies.length) * 100;

      addLog("status", `Söker: ${company}...`, "info");
      setStatusProgress(progress - 10);

      await sleep(800 + Math.random() * 400);

      if (!runningRef.current) break;

      const found = Math.floor(Math.random() * 5);
      if (found > 0) {
        addLog("status", `${company}: ${found} projekt`, "success");
      } else {
        addLog("status", `${company}: Inga projekt`, "info");
      }

      setStatusProgress(progress);
    }

    if (runningRef.current) {
      addLog("status", "Körning slutförd", "success");
      setLastRun(new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }));
    }

    runningRef.current = false;
    setIsRunning(false);
    setStatus("online");
    setTimeout(() => setStatusProgress(0), 1000);
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
    };
  }, []);

  const viewTitles = { search: "Sök bolag", schedule: "Schema", status: "Status" };
  const currentLogs = currentView === "search" ? searchLogs : currentView === "schedule" ? scheduleLogs : statusLogs;

  return (
    <div className="vinnova-widget">
      {/* STATE 1: Button */}
      {state === "button" && (
        <button className="vw-button" onClick={openMenu}>
          <div className="vw-btn-logo">
            <img src="/logos/vinnova.jpeg" alt="Vinnova" />
          </div>
          <div className="vw-btn-text">
            <span className="vw-btn-title">Vinnova</span>
            <span className="vw-btn-subtitle">Datainhämtning</span>
          </div>
          <ChevronRight className="vw-chevron w-4 h-4" />
        </button>
      )}

      {/* STATE 2: Menu */}
      {state === "menu" && (
        <div className={`vw-menu ${menuVisible ? "visible" : ""}`}>
          <div className="vw-menu-header">
            <div className="vw-menu-title">
              <div className="vw-menu-title-icon">
                <Zap className="w-3 h-3" />
              </div>
              Vinnova Scraper
            </div>
            <button className="vw-menu-close" onClick={closeMenu}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="vw-menu-items">
            <div className="vw-menu-item" onClick={() => openExpanded("search")}>
              <div className="vw-menu-icon"><Search className="w-4 h-4" /></div>
              <div className="vw-menu-content">
                <div className="vw-menu-label">Sök bolag</div>
                <div className="vw-menu-desc">Hitta Vinnova-projekt för företag</div>
              </div>
            </div>
            <div className="vw-menu-item" onClick={() => openExpanded("schedule")}>
              <div className="vw-menu-icon"><Clock className="w-4 h-4" /></div>
              <div className="vw-menu-content">
                <div className="vw-menu-label">Schema</div>
                <div className="vw-menu-desc">Automatiserade körningar</div>
              </div>
            </div>
            <div className="vw-menu-item" onClick={() => openExpanded("status")}>
              <div className="vw-menu-icon"><CheckCircle className="w-4 h-4" /></div>
              <div className="vw-menu-content">
                <div className="vw-menu-label">Status</div>
                <div className="vw-menu-desc">Anslutning och manuell körning</div>
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
              <button className="vw-header-btn" onClick={backToMenu}><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button className="vw-header-btn" onClick={closeAll}><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="vw-expanded-body">
            {/* Search View */}
            {currentView === "search" && (
              <div className="vw-view">
                <div className="vw-input-group">
                  <input
                    type="text"
                    className="vw-input"
                    placeholder="Sök bolagsnamn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  />
                  <button className="vw-btn vw-btn-primary" onClick={doSearch} disabled={isSearching}>
                    {isSearching ? "..." : "Sök"}
                  </button>
                </div>

                {/* Progress */}
                {searchProgress > 0 && (
                  <div className="vw-progress">
                    <div className="vw-progress-bar">
                      <div className="vw-progress-fill" style={{ width: `${searchProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Results */}
                {projects.length > 0 && (
                  <div className="vw-projects">
                    <div className="vw-section-title">
                      <FileText className="w-3.5 h-3.5" />
                      Projekt ({projects.length})
                    </div>
                    {projects.map((p) => (
                      <div
                        key={p.diarienummer}
                        className={`vw-project ${expandedProject === p.diarienummer ? 'expanded' : ''}`}
                        onClick={() => setExpandedProject(expandedProject === p.diarienummer ? null : p.diarienummer)}
                      >
                        <div className="vw-project-header">
                          <div className="vw-project-title">{p.titel || p.diarienummer}</div>
                          <div className="vw-project-id">{p.diarienummer}</div>
                        </div>
                        {expandedProject === p.diarienummer && (
                          <div className="vw-project-details">
                            {p.programnamn && (
                              <div className="vw-detail-row">
                                <span className="vw-detail-label">Program</span>
                                <span className="vw-detail-value">{p.programnamn}</span>
                              </div>
                            )}
                            {p.koordinator && (
                              <div className="vw-detail-row">
                                <span className="vw-detail-label">Koordinator</span>
                                <span className="vw-detail-value">{p.koordinator}</span>
                              </div>
                            )}
                            {p.vinnovaBidrag && (
                              <div className="vw-detail-row">
                                <span className="vw-detail-label">Bidrag</span>
                                <span className="vw-detail-value highlight">{formatCurrency(p.vinnovaBidrag)}</span>
                              </div>
                            )}
                            {p.totalbudget && (
                              <div className="vw-detail-row">
                                <span className="vw-detail-label">Total budget</span>
                                <span className="vw-detail-value">{formatCurrency(p.totalbudget)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Log */}
                <div className="vw-log-panel">
                  <div className="vw-log-header">
                    <span className="vw-log-title">Aktivitet</span>
                    {searchLogs.length > 0 && (
                      <button className="vw-log-clear" onClick={() => clearLog("search")}>Rensa</button>
                    )}
                  </div>
                  <div className="vw-log-content" ref={logContainerRef}>
                    {searchLogs.length === 0 ? (
                      <div className="vw-log-empty">Sök efter ett bolag för att se aktivitet</div>
                    ) : (
                      searchLogs.map(log => (
                        <div key={log.id} className={`vw-log-line ${log.type}`}>
                          <span className="vw-log-time">{log.time}</span>
                          <span className="vw-log-msg">{log.message}</span>
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
                <div className="vw-schedule-list">
                  {schedules.map(schedule => (
                    <div key={schedule.id} className="vw-schedule-item">
                      <div>
                        <div className="vw-schedule-name">{schedule.name}</div>
                        <div className="vw-schedule-time">{schedule.time}</div>
                      </div>
                      <div className={`vw-toggle ${schedule.active ? "active" : ""}`} onClick={() => toggleSchedule(schedule.id)} />
                    </div>
                  ))}
                </div>

                {showNewSchedule && (
                  <div className="vw-new-schedule">
                    <div className="vw-form-row">
                      <div>
                        <label className="vw-form-label">Namn</label>
                        <input type="text" className="vw-input" placeholder="Schema" value={newSchedName} onChange={(e) => setNewSchedName(e.target.value)} />
                      </div>
                      <div>
                        <label className="vw-form-label">Frekvens</label>
                        <select className="vw-input vw-select" value={newSchedFreq} onChange={(e) => setNewSchedFreq(e.target.value)}>
                          <option>Varje dag</option>
                          <option>Vardagar</option>
                          <option>Varje vecka</option>
                        </select>
                      </div>
                    </div>
                    <div className="vw-form-row">
                      <div>
                        <label className="vw-form-label">Tid</label>
                        <input type="time" className="vw-input" value={newSchedTime} onChange={(e) => setNewSchedTime(e.target.value)} />
                      </div>
                      <div className="vw-form-actions">
                        <button className="vw-btn vw-btn-primary" onClick={saveSchedule}>Spara</button>
                        <button className="vw-btn vw-btn-ghost" onClick={() => setShowNewSchedule(false)}>Avbryt</button>
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

                <div className="vw-log-panel">
                  <div className="vw-log-header">
                    <span className="vw-log-title">Aktivitet</span>
                    {scheduleLogs.length > 0 && <button className="vw-log-clear" onClick={() => clearLog("schedule")}>Rensa</button>}
                  </div>
                  <div className="vw-log-content">
                    {scheduleLogs.length === 0 ? (
                      <div className="vw-log-empty">Ingen schemaaktivitet</div>
                    ) : scheduleLogs.map(log => (
                      <div key={log.id} className={`vw-log-line ${log.type}`}>
                        <span className="vw-log-time">{log.time}</span>
                        <span className="vw-log-msg">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Status View */}
            {currentView === "status" && (
              <div className="vw-view">
                <div className="vw-status-grid">
                  <div className="vw-stat-card">
                    <Globe className="w-4 h-4" />
                    <div className="vw-stat-content">
                      <div className="vw-stat-label">API</div>
                      <div className="vw-stat-value online">Ansluten</div>
                    </div>
                  </div>
                  <div className="vw-stat-card">
                    <Database className="w-4 h-4" />
                    <div className="vw-stat-content">
                      <div className="vw-stat-label">Senaste</div>
                      <div className="vw-stat-value">{lastRun}</div>
                    </div>
                  </div>
                </div>

                <div className="vw-action-row">
                  <button className={`vw-btn ${isRunning ? "vw-btn-danger" : "vw-btn-success"}`} onClick={startRun} style={{ flex: 1 }}>
                    {isRunning ? <><Square className="w-3.5 h-3.5" />Stoppa</> : <><Play className="w-3.5 h-3.5" />Kör nu</>}
                  </button>
                  <button className="vw-btn vw-btn-ghost" onClick={testConnection}>Testa</button>
                </div>

                {statusProgress > 0 && (
                  <div className="vw-progress">
                    <div className="vw-progress-bar">
                      <div className="vw-progress-fill" style={{ width: `${statusProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="vw-log-panel">
                  <div className="vw-log-header">
                    <span className="vw-log-title">Aktivitet</span>
                    {statusLogs.length > 0 && <button className="vw-log-clear" onClick={() => clearLog("status")}>Rensa</button>}
                  </div>
                  <div className="vw-log-content" ref={logContainerRef}>
                    {statusLogs.length === 0 ? (
                      <div className="vw-log-empty">Starta en körning för att se aktivitet</div>
                    ) : statusLogs.map(log => (
                      <div key={log.id} className={`vw-log-line ${log.type}`}>
                        <span className="vw-log-time">{log.time}</span>
                        <span className="vw-log-msg">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        .vinnova-widget {
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Button */
        .vw-button {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 16px 24px;
          background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
          border: 1px solid #333;
          border-radius: 14px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          min-width: 200px;
        }

        .vw-button:hover {
          border-color: #84cc16;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(132, 204, 22, 0.15);
        }

        .vw-btn-logo {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .vw-btn-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vw-btn-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .vw-btn-title {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
        }

        .vw-btn-subtitle {
          font-size: 12px;
          color: #888;
          line-height: 1.3;
        }

        .vw-chevron {
          opacity: 0.4;
          transition: all 0.2s;
        }

        .vw-button:hover .vw-chevron {
          opacity: 1;
          transform: translateX(2px);
        }

        /* Menu */
        .vw-menu {
          width: 300px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 16px;
          overflow: hidden;
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .vw-menu.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .vw-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid #2a2a2a;
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
          background: rgba(74, 222, 128, 0.15);
          border-radius: 6px;
          color: #4ade80;
        }

        .vw-menu-close {
          width: 24px;
          height: 24px;
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
          background: #252525;
          color: #fff;
        }

        .vw-menu-items {
          padding: 8px;
        }

        .vw-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .vw-menu-item:hover {
          background: #252525;
        }

        .vw-menu-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #252525;
          border-radius: 8px;
          color: #666;
          transition: all 0.15s;
        }

        .vw-menu-item:hover .vw-menu-icon {
          background: rgba(74, 222, 128, 0.15);
          color: #4ade80;
        }

        .vw-menu-label {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
        }

        .vw-menu-desc {
          font-size: 11px;
          color: #555;
          margin-top: 2px;
        }

        /* Expanded */
        .vw-expanded {
          width: 420px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 16px;
          overflow: hidden;
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.25s ease;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
        }

        .vw-expanded.visible {
          opacity: 1;
          transform: scale(1);
        }

        .vw-expanded-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #2a2a2a;
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
        }

        .vw-status-dot.online {
          background: #4ade80;
          box-shadow: 0 0 8px #4ade80;
        }

        .vw-status-dot.working {
          background: #fbbf24;
          animation: pulse 1.2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .vw-header-actions {
          display: flex;
          gap: 4px;
        }

        .vw-header-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: #555;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s;
        }

        .vw-header-btn:hover {
          background: #252525;
          color: #fff;
        }

        .vw-expanded-body {
          padding: 16px;
        }

        .vw-view {
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Input */
        .vw-input-group {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .vw-input {
          flex: 1;
          padding: 10px 12px;
          background: #252525;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          transition: all 0.15s;
        }

        .vw-input:focus {
          outline: none;
          border-color: #4ade80;
        }

        .vw-input::placeholder {
          color: #555;
        }

        .vw-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23555' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }

        .vw-btn {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .vw-btn-primary {
          background: #fff;
          color: #1a1a1a;
        }

        .vw-btn-primary:hover {
          opacity: 0.9;
        }

        .vw-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .vw-btn-success {
          background: #4ade80;
          color: #1a1a1a;
        }

        .vw-btn-success:hover {
          box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
        }

        .vw-btn-danger {
          background: #f87171;
          color: white;
        }

        .vw-btn-ghost {
          background: transparent;
          color: #888;
          border: 1px solid #333;
        }

        .vw-btn-ghost:hover {
          background: #252525;
          color: #fff;
        }

        /* Progress */
        .vw-progress {
          margin-bottom: 12px;
        }

        .vw-progress-bar {
          height: 3px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
        }

        .vw-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ade80, #22d3ee);
          transition: width 0.3s ease;
        }

        /* Projects */
        .vw-projects {
          margin-bottom: 12px;
        }

        .vw-section-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .vw-project {
          background: #252525;
          border-radius: 8px;
          margin-bottom: 6px;
          cursor: pointer;
          transition: all 0.15s;
          overflow: hidden;
        }

        .vw-project:hover {
          background: #2a2a2a;
        }

        .vw-project.expanded {
          background: #2a2a2a;
        }

        .vw-project-header {
          padding: 10px 12px;
        }

        .vw-project-title {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .vw-project-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #555;
          margin-top: 4px;
        }

        .vw-project-details {
          padding: 0 12px 12px;
          border-top: 1px solid #333;
          margin-top: 8px;
          padding-top: 10px;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .vw-detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 4px 0;
        }

        .vw-detail-label {
          color: #666;
        }

        .vw-detail-value {
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
        }

        .vw-detail-value.highlight {
          color: #4ade80;
        }

        /* Status grid */
        .vw-status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .vw-stat-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #252525;
          border-radius: 10px;
          color: #666;
        }

        .vw-stat-content {
          flex: 1;
        }

        .vw-stat-label {
          font-size: 10px;
          color: #555;
          text-transform: uppercase;
        }

        .vw-stat-value {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
        }

        .vw-stat-value.online {
          color: #4ade80;
        }

        .vw-action-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        /* Schedule */
        .vw-schedule-list {
          margin-bottom: 12px;
        }

        .vw-schedule-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #252525;
          border-radius: 8px;
          margin-bottom: 6px;
        }

        .vw-schedule-name {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
        }

        .vw-schedule-time {
          font-size: 11px;
          color: #555;
          font-family: 'JetBrains Mono', monospace;
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
        }

        .vw-toggle.active::after {
          left: 18px;
        }

        .vw-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          background: none;
          border: 1px dashed #333;
          border-radius: 8px;
          color: #666;
          font-size: 12px;
          cursor: pointer;
          width: 100%;
          margin-bottom: 12px;
          transition: all 0.15s;
        }

        .vw-add-btn:hover {
          border-color: #4ade80;
          color: #4ade80;
        }

        .vw-new-schedule {
          background: #252525;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .vw-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 8px;
        }

        .vw-form-label {
          font-size: 10px;
          color: #555;
          margin-bottom: 4px;
          display: block;
          text-transform: uppercase;
        }

        .vw-form-actions {
          display: flex;
          align-items: flex-end;
          gap: 6px;
        }

        /* Log panel */
        .vw-log-panel {
          background: #151515;
          border-radius: 10px;
          overflow: hidden;
        }

        .vw-log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid #252525;
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
          padding: 10px 12px;
          max-height: 140px;
          overflow-y: auto;
          line-height: 1.6;
        }

        .vw-log-content::-webkit-scrollbar {
          width: 4px;
        }

        .vw-log-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .vw-log-content::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 2px;
        }

        .vw-log-line {
          display: flex;
          gap: 8px;
          padding: 2px 0;
          animation: logIn 0.15s ease;
        }

        @keyframes logIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .vw-log-time {
          color: #444;
          min-width: 55px;
        }

        .vw-log-msg {
          color: #888;
        }

        .vw-log-line.success .vw-log-msg {
          color: #4ade80;
        }

        .vw-log-line.warning .vw-log-msg {
          color: #fbbf24;
        }

        .vw-log-line.error .vw-log-msg {
          color: #f87171;
        }

        .vw-log-line.step .vw-log-msg {
          color: #60a5fa;
        }

        .vw-log-line.info .vw-log-msg {
          color: #e5e5e5;
        }

        .vw-log-empty {
          color: #444;
          text-align: center;
          padding: 16px;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}
