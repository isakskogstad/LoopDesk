"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Play, Square, Settings, Loader2, Building2,
  Check, AlertCircle, Shield, Scale, Zap,
  StopCircle, RefreshCw
} from "lucide-react";

interface WatchedCompany {
  orgNumber: string;
  name: string;
  hasLogo: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error" | "captcha" | "detail" | "progress";
  message: string;
  details?: string;
}

interface ActiveSearch {
  id: string;
  company: string;
  orgNumber: string;
  status: string;
  statusDetail?: string;
  progress: number;
  found: number;
  startedAt: Date;
  stages: { name: string; completed: boolean; current: boolean }[];
}

interface ScraperPanelProps {
  companies: WatchedCompany[];
  onComplete: () => void;
  onClose: () => void;
}

// Search stages for progress tracking
const SEARCH_STAGES = [
  "Ansluter",
  "CAPTCHA",
  "Söker",
  "Resultat",
  "Detaljer",
  "Sparar"
];

export function ScraperPanel({ companies, onComplete, onClose }: ScraperPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [activeSearches, setActiveSearches] = useState<ActiveSearch[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<WatchedCompany | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "pending" | "done">("all");
  const [parallelCount, setParallelCount] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [companyResults, setCompanyResults] = useState<Record<string, number>>({});
  const [searchedCompanies, setSearchedCompanies] = useState<Set<string>>(new Set());
  const [latestLog, setLatestLog] = useState<LogEntry | null>(null);
  const [logFading, setLogFading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const queueRef = useRef<string[]>([]);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const forceStopRef = useRef(false);

  // Add log entry - now also updates latest log with animation
  const addLog = useCallback((type: LogEntry["type"], message: string, details?: string) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
      details,
    };

    setLogs(prev => [...prev.slice(-299), newLog]);

    // Animate the latest log change
    setLogFading(true);
    setTimeout(() => {
      setLatestLog(newLog);
      setLogFading(false);
    }, 150);
  }, []);

  // Load existing results count
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/kungorelser/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.byCompany) {
            setCompanyResults(data.byCompany);
            setSearchedCompanies(new Set(Object.keys(data.byCompany)));
          }
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    }
    loadStats();
  }, []);

  // Update search stage
  const updateSearchStage = useCallback((searchId: string, stageName: string) => {
    setActiveSearches(prev => prev.map(s => {
      if (s.id !== searchId) return s;
      const stageIndex = SEARCH_STAGES.indexOf(stageName);
      return {
        ...s,
        stages: SEARCH_STAGES.map((name, i) => ({
          name,
          completed: i < stageIndex,
          current: i === stageIndex,
        })),
      };
    }));
  }, []);

  // Search a single company with streaming progress
  const searchCompany = useCallback(async (company: WatchedCompany) => {
    if (forceStopRef.current) return;

    const searchId = crypto.randomUUID();

    setActiveSearches(prev => [...prev, {
      id: searchId,
      company: company.name,
      orgNumber: company.orgNumber,
      status: "Startar...",
      progress: 0,
      found: 0,
      startedAt: new Date(),
      stages: SEARCH_STAGES.map((name, i) => ({
        name,
        completed: false,
        current: i === 0,
      })),
    }]);

    addLog("info", `${company.name}: Startar webbläsare...`);

    try {
      abortControllerRef.current = new AbortController();

      const res = await fetch("/api/kungorelser/search/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: company.name,
          orgNumber: company.orgNumber,
          detailLimit: 5,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let foundCount = 0;

      while (true) {
        if (forceStopRef.current) {
          reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));

              switch (event.type) {
                case "status":
                  addLog("info", `${company.name}: ${event.message}`);
                  updateSearchStage(searchId, "Ansluter");
                  setActiveSearches(prev => prev.map(s =>
                    s.id === searchId ? {
                      ...s,
                      status: event.message.slice(0, 40),
                      statusDetail: event.data?.detail,
                      progress: Math.min(s.progress + 5, 20)
                    } : s
                  ));
                  break;

                case "captcha":
                  updateSearchStage(searchId, "CAPTCHA");
                  const captchaMsg = event.data?.solving
                    ? "Löser CAPTCHA..."
                    : event.data?.solved
                      ? `CAPTCHA löst!`
                      : "Väntar på CAPTCHA...";
                  addLog("captcha", `${company.name}: ${captchaMsg}`);
                  setActiveSearches(prev => prev.map(s =>
                    s.id === searchId ? {
                      ...s,
                      status: "Löser CAPTCHA",
                      statusDetail: captchaMsg,
                      progress: 30
                    } : s
                  ));
                  break;

                case "search":
                  updateSearchStage(searchId, "Söker");
                  addLog("progress", `${company.name}: Söker: "${company.name}"...`);
                  setActiveSearches(prev => prev.map(s =>
                    s.id === searchId ? {
                      ...s,
                      status: "Söker i registret",
                      statusDetail: "Väntar på svar...",
                      progress: 40
                    } : s
                  ));
                  break;

                case "result":
                  updateSearchStage(searchId, "Resultat");
                  foundCount = event.data?.count || 0;
                  addLog("success", `${company.name}: ${foundCount} kungörelser hittade`);
                  setActiveSearches(prev => prev.map(s =>
                    s.id === searchId ? {
                      ...s,
                      status: `${foundCount} hittade`,
                      statusDetail: foundCount > 0 ? "Hämtar detaljer..." : "Inga resultat",
                      progress: 50,
                      found: foundCount
                    } : s
                  ));
                  break;

                case "detail":
                  updateSearchStage(searchId, "Detaljer");
                  const current = event.data?.current || 0;
                  const total = event.data?.total || 1;
                  const detailProgress = 50 + (current / total) * 40;
                  addLog("detail", `${company.name}: Hämtar ${current}/${total}...`);
                  setActiveSearches(prev => prev.map(s =>
                    s.id === searchId ? {
                      ...s,
                      status: `Detaljer ${current}/${total}`,
                      statusDetail: event.data?.title?.slice(0, 50),
                      progress: detailProgress
                    } : s
                  ));
                  break;

                case "success":
                  addLog("success", `${company.name}: ${event.message}`);
                  break;

                case "error":
                  addLog("error", `${company.name}: ${event.message}`);
                  break;

                case "complete":
                  updateSearchStage(searchId, "Sparar");
                  const saved = event.data?.saved || 0;
                  addLog("success", `${company.name}: ${saved} sparade`);
                  setActiveSearches(prev => prev.map(s =>
                    s.id === searchId ? {
                      ...s,
                      status: "Klart",
                      statusDetail: `${saved} sparade`,
                      progress: 100,
                      found: saved,
                      stages: SEARCH_STAGES.map(name => ({ name, completed: true, current: false })),
                    } : s
                  ));
                  setCompanyResults(prev => ({ ...prev, [company.orgNumber]: saved }));
                  setSearchedCompanies(prev => new Set([...prev, company.orgNumber]));
                  break;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        addLog("warning", `${company.name}: Avbruten`);
      } else {
        addLog("error", `${company.name}: Fel - ${error instanceof Error ? error.message : "Okänt"}`);
      }
      setActiveSearches(prev => prev.map(s =>
        s.id === searchId ? { ...s, status: "Fel", progress: 100 } : s
      ));
    }

    setTimeout(() => {
      setActiveSearches(prev => prev.filter(s => s.id !== searchId));
    }, 3000);
  }, [addLog, updateSearchStage]);

  // Keep refs in sync
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  const queueUnsearched = useCallback(() => {
    const unsearched = companies
      .filter(c => !searchedCompanies.has(c.orgNumber))
      .map(c => c.orgNumber);
    setQueue(unsearched);
    queueRef.current = unsearched;
    addLog("info", `${unsearched.length} bolag köade`);
  }, [companies, searchedCompanies, addLog]);

  const queueAll = useCallback(() => {
    const all = companies.map(c => c.orgNumber);
    setQueue(all);
    queueRef.current = all;
    addLog("info", `${all.length} bolag köade`);
  }, [companies, addLog]);

  const forceStop = useCallback(() => {
    forceStopRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsPaused(true);
    setIsRunning(false);
    setQueue([]);
    queueRef.current = [];
    setActiveSearches([]);
    addLog("error", "Alla sökningar avbrutna");
    setTimeout(() => { forceStopRef.current = false; }, 500);
  }, [addLog]);

  const processQueue = useCallback(async () => {
    if (forceStopRef.current) return;

    const currentQueue = queueRef.current;

    if (currentQueue.length === 0 || isPausedRef.current) {
      setIsRunning(false);
      isRunningRef.current = false;
      if (currentQueue.length === 0 && isRunningRef.current) {
        addLog("success", "Alla sökningar klara!");
        onComplete();
      }
      return;
    }

    setIsRunning(true);
    isRunningRef.current = true;

    const batch = currentQueue.slice(0, parallelCount);
    const remaining = currentQueue.slice(parallelCount);

    setQueue(remaining);
    queueRef.current = remaining;

    await Promise.all(batch.map(async (orgNumber) => {
      if (forceStopRef.current) return;
      const company = companies.find(c => c.orgNumber === orgNumber);
      if (company) {
        await searchCompany(company);
      }
    }));

    if (!forceStopRef.current && !isPausedRef.current && queueRef.current.length > 0) {
      setTimeout(() => { processQueue(); }, 2000);
    } else if (queueRef.current.length === 0) {
      setIsRunning(false);
      isRunningRef.current = false;
      if (!forceStopRef.current) {
        addLog("success", "Alla sökningar klara!");
        onComplete();
      }
    }
  }, [parallelCount, companies, searchCompany, addLog, onComplete]);

  const startQueue = useCallback(() => {
    forceStopRef.current = false;
    if (queue.length === 0) {
      queueUnsearched();
    }
    setIsPaused(false);
    processQueue();
  }, [queue.length, queueUnsearched, processQueue]);

  const pauseQueue = useCallback(() => {
    setIsPaused(true);
    addLog("warning", "Pausad");
  }, [addLog]);

  const resumeQueue = useCallback(() => {
    setIsPaused(false);
    processQueue();
  }, [processQueue]);

  const filteredCompanies = companies.filter(c => {
    if (searchFilter) {
      const query = searchFilter.toLowerCase();
      if (!c.name.toLowerCase().includes(query) && !c.orgNumber.includes(query)) {
        return false;
      }
    }
    if (categoryFilter === "pending") return !searchedCompanies.has(c.orgNumber);
    if (categoryFilter === "done") return searchedCompanies.has(c.orgNumber);
    return true;
  });

  const formatDuration = (start: Date) => {
    const seconds = Math.floor((Date.now() - start.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  // Get log indicator color
  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success": return "text-emerald-500";
      case "error": return "text-red-500";
      case "warning": return "text-amber-500";
      case "captcha": return "text-purple-500";
      default: return "text-blue-500";
    }
  };

  return (
    <div className="bg-card text-foreground rounded-2xl border border-border overflow-hidden shadow-2xl animate-in slide-in-from-top-2 duration-300">
      {/* Minimal Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
            isRunning
              ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"
              : "bg-muted-foreground/30"
          }`} />
          <h2 className="text-base font-semibold tracking-tight">Kungörelsescraper</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showSettings
                ? "bg-primary text-primary-foreground rotate-90"
                : "hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Settings Panel - Animated */}
      <div className={`overflow-hidden transition-all duration-300 ease-out ${
        showSettings ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-5 py-4 bg-secondary/20 border-b border-border/50">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Säker", icon: Shield, parallel: 1 },
              { label: "Balanserad", icon: Scale, parallel: 3 },
              { label: "Snabb", icon: Zap, parallel: 5 },
            ].map(({ label, icon: Icon, parallel }) => (
              <button
                key={parallel}
                onClick={() => setParallelCount(parallel)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  parallelCount === parallel
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-background/50 border-b border-border/50">
        <input
          type="text"
          placeholder="Sök företag..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="flex-1 min-w-[150px] max-w-[200px] px-3 py-1.5 bg-secondary/30 border-0 rounded-lg text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => selectedCompany && searchCompany(selectedCompany)}
            disabled={!selectedCompany || isRunning}
            className="px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
          >
            Sök vald
          </button>
          <button
            onClick={queueUnsearched}
            disabled={isRunning}
            className="px-3 py-1.5 bg-secondary/70 hover:bg-secondary disabled:opacity-40 text-foreground rounded-lg text-xs font-medium transition-all duration-200"
          >
            Köa osökta
          </button>
          <button
            onClick={queueAll}
            disabled={isRunning}
            className="px-3 py-1.5 bg-secondary/70 hover:bg-secondary disabled:opacity-40 text-foreground rounded-lg text-xs font-medium transition-all duration-200"
          >
            Köa alla
          </button>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {queue.length > 0 && !isRunning && !isPaused && (
            <button
              onClick={startQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <Play size={12} />
              Starta ({queue.length})
            </button>
          )}

          {isRunning && !isPaused && (
            <button
              onClick={pauseQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-all duration-200"
            >
              <Square size={12} />
              Pausa
            </button>
          )}

          {isPaused && queue.length > 0 && (
            <button
              onClick={resumeQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-all duration-200"
            >
              <Play size={12} />
              Fortsätt
            </button>
          )}

          {(isRunning || activeSearches.length > 0) && (
            <button
              onClick={forceStop}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-all duration-200"
            >
              <StopCircle size={12} />
              Stopp
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[400px]">
        {/* Company List */}
        <div className="w-full lg:w-[280px] flex flex-col border-b lg:border-b-0 lg:border-r border-border/50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
            <span className="text-xs font-medium text-muted-foreground">Bolag ({filteredCompanies.length})</span>
            <div className="flex gap-0.5">
              {(["all", "pending", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setCategoryFilter(f)}
                  className={`px-2 py-0.5 text-[10px] rounded-full transition-all duration-200 ${
                    categoryFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {f === "all" ? "Alla" : f === "pending" ? "Kvar" : "Klara"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCompanies.map((company, index) => {
              const isSearching = activeSearches.some(s => s.orgNumber === company.orgNumber);
              const resultCount = companyResults[company.orgNumber] || 0;
              const hasSearched = searchedCompanies.has(company.orgNumber);

              return (
                <div
                  key={company.orgNumber}
                  onClick={() => setSelectedCompany(company)}
                  style={{ animationDelay: `${index * 20}ms` }}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-all duration-200 border-b border-border/20 animate-in fade-in slide-in-from-left-1 ${
                    selectedCompany?.orgNumber === company.orgNumber
                      ? "bg-primary/5 border-l-2 border-l-primary"
                      : "hover:bg-secondary/30"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                    <Building2 size={12} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{company.name}</div>
                    <div className="text-[10px] text-muted-foreground/70">{company.orgNumber}</div>
                  </div>
                  {isSearching ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : hasSearched ? (
                    resultCount > 0 ? (
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-medium">
                        {resultCount}
                      </span>
                    ) : (
                      <Check size={12} className="text-muted-foreground/50" />
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side: Active searches + Single log line */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Active Searches */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeSearches.length > 0 ? (
              <div className="space-y-3">
                {activeSearches.map((search) => (
                  <div
                    key={search.id}
                    className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-xl border border-border/30 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Loader2 size={16} className="animate-spin text-primary" />
                          <div className="absolute inset-0 animate-ping opacity-30">
                            <Loader2 size={16} className="text-primary" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">{search.company}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{formatDuration(search.startedAt)}</span>
                    </div>

                    {/* Animated stage indicators */}
                    <div className="flex items-center gap-1 mb-3">
                      {search.stages.map((stage, i) => (
                        <div key={stage.name} className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full transition-all duration-500 ${
                              stage.completed
                                ? "bg-emerald-500 scale-100"
                                : stage.current
                                  ? "bg-primary animate-pulse scale-110"
                                  : "bg-muted-foreground/20 scale-90"
                            }`}
                          />
                          {i < search.stages.length - 1 && (
                            <div className={`w-6 h-0.5 transition-all duration-500 ${
                              stage.completed ? "bg-emerald-500" : "bg-muted-foreground/10"
                            }`} />
                          )}
                        </div>
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-2 font-medium">
                        {search.stages.find(s => s.current)?.name || "Klart"}
                      </span>
                    </div>

                    {/* Smooth progress bar */}
                    <div className="h-1 bg-secondary/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700 ease-out rounded-full"
                        style={{ width: `${search.progress}%` }}
                      />
                    </div>

                    {search.statusDetail && (
                      <p className="text-[10px] text-muted-foreground mt-2 truncate opacity-70">
                        {search.statusDetail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                {queue.length > 0 ? (
                  <div className="text-center animate-in fade-in duration-500">
                    <div className="text-4xl font-bold text-primary mb-1 animate-pulse">{queue.length}</div>
                    <div className="text-sm mb-4 text-muted-foreground/70">bolag i kö</div>
                    <button
                      onClick={startQueue}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:scale-105"
                    >
                      <Play size={16} />
                      Starta sökningar
                    </button>
                  </div>
                ) : (
                  <div className="text-center animate-in fade-in duration-500">
                    <AlertCircle size={32} className="mx-auto mb-3 opacity-30" />
                    <div className="text-sm text-muted-foreground/50">
                      {selectedCompany
                        ? `Klicka "Sök vald" för att söka ${selectedCompany.name}`
                        : "Välj ett bolag eller klicka 'Köa osökta'"}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Single Log Line - Animated */}
          <div className="px-4 py-3 border-t border-border/30 bg-secondary/10">
            <div className="flex items-center gap-2 h-5">
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                isRunning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
              }`} />
              <div className={`flex-1 text-xs truncate transition-all duration-300 ${
                logFading ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
              }`}>
                {latestLog ? (
                  <span className={getLogColor(latestLog.type)}>
                    {latestLog.message}
                  </span>
                ) : (
                  <span className="text-muted-foreground/50">Redo att söka kungörelser...</span>
                )}
              </div>
              {logs.length > 0 && (
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  {logs.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
