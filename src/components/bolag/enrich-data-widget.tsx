"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Database, RefreshCw, Clock, CheckCircle, ChevronRight, ChevronLeft, X, Play, Square, Activity, Building2 } from "lucide-react";

type WidgetState = "button" | "menu" | "expanded";
type ViewType = "enrich" | "status";
type StatusType = "online" | "working" | "offline";

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

export function EnrichDataWidget() {
  const [state, setState] = useState<WidgetState>("button");
  const [currentView, setCurrentView] = useState<ViewType>("enrich");
  const [status, setStatus] = useState<StatusType>("online");
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedVisible, setExpandedVisible] = useState(false);

  // Enrich state
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<EnrichStats>({ total: 0, enriched: 0, failed: 0, skipped: 0 });
  const [lastRun, setLastRun] = useState("--:--");
  const [companyCount, setCompanyCount] = useState<number | null>(null);

  const logIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Fetch company count on mount
  useEffect(() => {
    fetchCompanyCount();
  }, []);

  const fetchCompanyCount = async () => {
    try {
      const response = await fetch("/api/bevakning");
      if (response.ok) {
        const data = await response.json();
        setCompanyCount(data.companies?.length || 0);
      }
    } catch {
      // Ignore errors
    }
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

  const startEnrichment = async () => {
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

    setIsEnriching(true);
    setStatus("working");
    setProgress(0);
    setStats({ total: 0, enriched: 0, failed: 0, skipped: 0 });

    addLog("Startar berikning av bolagsdata...", "step");

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/bevakning/enrich/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchSize: 50 }),
        signal: abortControllerRef.current.signal,
      });

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
        addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
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

  const viewTitles = { enrich: "Berika data", status: "Status" };

  return (
    <div className="enrich-widget">
      {/* STATE 1: Button */}
      {state === "button" && (
        <button className="ew-button" onClick={openMenu}>
          <div className="ew-btn-icon">
            <Database className="w-4 h-4" />
          </div>
          <span>Berika data</span>
          <ChevronRight className="ew-chevron w-3.5 h-3.5" />
        </button>
      )}

      {/* STATE 2: Menu */}
      {state === "menu" && (
        <div className={`ew-menu ${menuVisible ? "visible" : ""}`}>
          <div className="ew-menu-header">
            <div className="ew-menu-title">
              <div className="ew-menu-title-icon">
                <Database className="w-3 h-3" />
              </div>
              Berika data
            </div>
            <button className="ew-menu-close" onClick={closeMenu}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="ew-menu-items">
            <div className="ew-menu-item" onClick={() => openExpanded("enrich")}>
              <div className="ew-menu-icon"><RefreshCw className="w-4 h-4" /></div>
              <div className="ew-menu-content">
                <div className="ew-menu-label">Berika alla</div>
                <div className="ew-menu-desc">
                  {companyCount !== null ? `Uppdatera ${companyCount} bolag från Allabolag` : "Hämta data från Allabolag"}
                </div>
              </div>
            </div>
            <div className="ew-menu-item" onClick={() => openExpanded("status")}>
              <div className="ew-menu-icon"><Activity className="w-4 h-4" /></div>
              <div className="ew-menu-content">
                <div className="ew-menu-label">Status</div>
                <div className="ew-menu-desc">Anslutning och senaste körning</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: Expanded */}
      {state === "expanded" && (
        <div className={`ew-expanded ${expandedVisible ? "visible" : ""}`}>
          <div className="ew-expanded-header">
            <div className="ew-expanded-title">
              <div className={`ew-status-dot ${status}`} />
              <span>{viewTitles[currentView]}</span>
            </div>
            <div className="ew-header-actions">
              <button className="ew-header-btn" onClick={backToMenu}><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button className="ew-header-btn" onClick={closeAll}><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="ew-expanded-body">
            {/* Enrich View */}
            {currentView === "enrich" && (
              <div className="ew-view">
                {/* Stats grid */}
                <div className="ew-stats-grid">
                  <div className="ew-stat-card">
                    <Building2 className="w-4 h-4" />
                    <div className="ew-stat-content">
                      <div className="ew-stat-label">Totalt</div>
                      <div className="ew-stat-value">{stats.total || companyCount || "-"}</div>
                    </div>
                  </div>
                  <div className="ew-stat-card">
                    <CheckCircle className="w-4 h-4" />
                    <div className="ew-stat-content">
                      <div className="ew-stat-label">Berikade</div>
                      <div className="ew-stat-value success">{stats.enriched}</div>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="ew-action-row">
                  <button
                    className={`ew-btn ${isEnriching ? "ew-btn-danger" : "ew-btn-primary"}`}
                    onClick={startEnrichment}
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
                  <div className="ew-progress">
                    <div className="ew-progress-bar">
                      <div className="ew-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="ew-progress-text">{Math.round(progress)}%</span>
                  </div>
                )}

                {/* Stats summary when enriching */}
                {(stats.enriched > 0 || stats.failed > 0 || stats.skipped > 0) && (
                  <div className="ew-summary">
                    <span className="ew-summary-item success">{stats.enriched} berikade</span>
                    {stats.skipped > 0 && <span className="ew-summary-item">{stats.skipped} hoppades över</span>}
                    {stats.failed > 0 && <span className="ew-summary-item error">{stats.failed} misslyckades</span>}
                  </div>
                )}

                {/* Live Log */}
                <div className="ew-log-panel">
                  <div className="ew-log-header">
                    <span className="ew-log-title">Aktivitet</span>
                    {logs.length > 0 && (
                      <button className="ew-log-clear" onClick={clearLogs}>Rensa</button>
                    )}
                  </div>
                  <div className="ew-log-content" ref={logContainerRef}>
                    {logs.length === 0 ? (
                      <div className="ew-log-empty">Starta berikning för att se aktivitet</div>
                    ) : (
                      logs.map(log => (
                        <div key={log.id} className={`ew-log-line ${log.type}`}>
                          <span className="ew-log-time">{log.time}</span>
                          <span className="ew-log-msg">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status View */}
            {currentView === "status" && (
              <div className="ew-view">
                <div className="ew-status-grid">
                  <div className="ew-stat-card">
                    <Activity className="w-4 h-4" />
                    <div className="ew-stat-content">
                      <div className="ew-stat-label">API</div>
                      <div className="ew-stat-value online">Ansluten</div>
                    </div>
                  </div>
                  <div className="ew-stat-card">
                    <Clock className="w-4 h-4" />
                    <div className="ew-stat-content">
                      <div className="ew-stat-label">Senaste</div>
                      <div className="ew-stat-value">{lastRun}</div>
                    </div>
                  </div>
                </div>

                <div className="ew-action-row">
                  <button className="ew-btn ew-btn-ghost" onClick={testConnection}>
                    Testa anslutning
                  </button>
                </div>

                <div className="ew-log-panel">
                  <div className="ew-log-header">
                    <span className="ew-log-title">Aktivitet</span>
                    {logs.length > 0 && <button className="ew-log-clear" onClick={clearLogs}>Rensa</button>}
                  </div>
                  <div className="ew-log-content">
                    {logs.length === 0 ? (
                      <div className="ew-log-empty">Ingen aktivitet</div>
                    ) : logs.map(log => (
                      <div key={log.id} className={`ew-log-line ${log.type}`}>
                        <span className="ew-log-time">{log.time}</span>
                        <span className="ew-log-msg">{log.message}</span>
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
        .enrich-widget {
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Button */
        .ew-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
          border: 1px solid #333;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .ew-button:hover {
          border-color: #60a5fa;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(96, 165, 250, 0.15);
        }

        .ew-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(96, 165, 250, 0.15);
          border-radius: 8px;
          color: #60a5fa;
        }

        .ew-chevron {
          opacity: 0.4;
          transition: all 0.2s;
        }

        .ew-button:hover .ew-chevron {
          opacity: 1;
          transform: translateX(2px);
        }

        /* Menu */
        .ew-menu {
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

        .ew-menu.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .ew-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid #2a2a2a;
        }

        .ew-menu-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }

        .ew-menu-title-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(96, 165, 250, 0.15);
          border-radius: 6px;
          color: #60a5fa;
        }

        .ew-menu-close {
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

        .ew-menu-close:hover {
          background: #252525;
          color: #fff;
        }

        .ew-menu-items {
          padding: 8px;
        }

        .ew-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ew-menu-item:hover {
          background: #252525;
        }

        .ew-menu-icon {
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

        .ew-menu-item:hover .ew-menu-icon {
          background: rgba(96, 165, 250, 0.15);
          color: #60a5fa;
        }

        .ew-menu-label {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
        }

        .ew-menu-desc {
          font-size: 11px;
          color: #555;
          margin-top: 2px;
        }

        /* Expanded */
        .ew-expanded {
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

        .ew-expanded.visible {
          opacity: 1;
          transform: scale(1);
        }

        .ew-expanded-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #2a2a2a;
        }

        .ew-expanded-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
        }

        .ew-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #555;
        }

        .ew-status-dot.online {
          background: #4ade80;
          box-shadow: 0 0 8px #4ade80;
        }

        .ew-status-dot.working {
          background: #60a5fa;
          animation: pulse 1.2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .ew-header-actions {
          display: flex;
          gap: 4px;
        }

        .ew-header-btn {
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

        .ew-header-btn:hover {
          background: #252525;
          color: #fff;
        }

        .ew-expanded-body {
          padding: 16px;
        }

        .ew-view {
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Stats grid */
        .ew-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .ew-stat-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #252525;
          border-radius: 10px;
          color: #666;
        }

        .ew-stat-content {
          flex: 1;
        }

        .ew-stat-label {
          font-size: 10px;
          color: #555;
          text-transform: uppercase;
        }

        .ew-stat-value {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
        }

        .ew-stat-value.online {
          color: #4ade80;
        }

        .ew-stat-value.success {
          color: #4ade80;
        }

        /* Actions */
        .ew-action-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .ew-btn {
          flex: 1;
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

        .ew-btn-primary {
          background: #60a5fa;
          color: #1a1a1a;
        }

        .ew-btn-primary:hover {
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
        }

        .ew-btn-danger {
          background: #f87171;
          color: white;
        }

        .ew-btn-ghost {
          background: transparent;
          color: #888;
          border: 1px solid #333;
        }

        .ew-btn-ghost:hover {
          background: #252525;
          color: #fff;
        }

        /* Progress */
        .ew-progress {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .ew-progress-bar {
          flex: 1;
          height: 3px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
        }

        .ew-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #60a5fa, #22d3ee);
          transition: width 0.3s ease;
        }

        .ew-progress-text {
          font-size: 11px;
          color: #60a5fa;
          font-family: 'JetBrains Mono', monospace;
          min-width: 35px;
        }

        /* Summary */
        .ew-summary {
          display: flex;
          gap: 12px;
          font-size: 11px;
          margin-bottom: 12px;
          padding: 8px 12px;
          background: #252525;
          border-radius: 8px;
        }

        .ew-summary-item {
          color: #888;
        }

        .ew-summary-item.success {
          color: #4ade80;
        }

        .ew-summary-item.error {
          color: #f87171;
        }

        /* Log panel */
        .ew-log-panel {
          background: #151515;
          border-radius: 10px;
          overflow: hidden;
        }

        .ew-log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid #252525;
        }

        .ew-log-title {
          font-size: 10px;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ew-log-clear {
          background: none;
          border: none;
          color: #555;
          font-size: 10px;
          cursor: pointer;
          transition: color 0.15s;
        }

        .ew-log-clear:hover {
          color: #fff;
        }

        .ew-log-content {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 10px 12px;
          max-height: 140px;
          overflow-y: auto;
          line-height: 1.6;
        }

        .ew-log-content::-webkit-scrollbar {
          width: 4px;
        }

        .ew-log-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .ew-log-content::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 2px;
        }

        .ew-log-line {
          display: flex;
          gap: 8px;
          padding: 2px 0;
          animation: logIn 0.15s ease;
        }

        @keyframes logIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .ew-log-time {
          color: #444;
          min-width: 55px;
        }

        .ew-log-msg {
          color: #888;
        }

        .ew-log-line.success .ew-log-msg {
          color: #4ade80;
        }

        .ew-log-line.warning .ew-log-msg {
          color: #fbbf24;
        }

        .ew-log-line.error .ew-log-msg {
          color: #f87171;
        }

        .ew-log-line.step .ew-log-msg {
          color: #60a5fa;
        }

        .ew-log-line.info .ew-log-msg {
          color: #e5e5e5;
        }

        .ew-log-empty {
          color: #444;
          text-align: center;
          padding: 16px;
          font-size: 11px;
        }

        .ew-status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}
