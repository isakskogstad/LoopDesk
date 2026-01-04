"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Play, Square, Trash2, Settings, Loader2, Building2,
  Check, AlertCircle, Zap, Scale, Shield, Clock, FileText,
  ChevronDown, ChevronUp, StopCircle, RefreshCw
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

const typeIcons: Record<LogEntry["type"], typeof Clock> = {
  info: Clock,
  success: Check,
  warning: AlertCircle,
  error: X,
  captcha: Shield,
  detail: FileText,
  progress: RefreshCw,
};

const typeStyles: Record<LogEntry["type"], { bg: string; text: string; border: string }> = {
  info: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/30" },
  success: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/30" },
  warning: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/30" },
  error: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-500/30" },
  captcha: { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-500/30" },
  detail: { bg: "bg-cyan-50 dark:bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-500/30" },
  progress: { bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-500/30" },
};

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
  // Default to safe mode (1 parallel)
  const [parallelCount, setParallelCount] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [companyResults, setCompanyResults] = useState<Record<string, number>>({});
  const [searchedCompanies, setSearchedCompanies] = useState<Set<string>>(new Set());
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const logRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queueRef = useRef<string[]>([]);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const forceStopRef = useRef(false);

  // Add log entry with optional details
  const addLog = useCallback((type: LogEntry["type"], message: string, details?: string) => {
    setLogs(prev => [...prev.slice(-299), {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
      details,
    }]);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

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

    // Add to active searches with stage tracking
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

    addLog("info", `Startar sökning för ${company.name}`, `Org.nr: ${company.orgNumber}`);

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

              // Map event types to progress, stages, and detailed logs
              switch (event.type) {
                case "status":
                  addLog("info", `${company.name}: ${event.message}`, event.data?.detail);
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
                  const captchaDetail = event.data?.solving
                    ? "Löser CAPTCHA med 2Captcha..."
                    : event.data?.solved
                      ? `Löst på ${event.data.time}s`
                      : "Väntar på CAPTCHA...";
                  addLog("captcha", `${company.name}: ${event.message}`, captchaDetail);
                  setActiveSearches(prev => prev.map(s =>
                    s.id === searchId ? {
                      ...s,
                      status: "Löser CAPTCHA",
                      statusDetail: captchaDetail,
                      progress: 30
                    } : s
                  ));
                  break;

                case "search":
                  updateSearchStage(searchId, "Söker");
                  addLog("progress", `${company.name}: ${event.message}`, "Väntar på resultat från Bolagsverket...");
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
                  addLog("success", `${company.name}: Hittade ${foundCount} kungörelser`,
                    foundCount > 0 ? `Börjar hämta detaljer...` : "Inga kungörelser att hämta");
                  setActiveSearches(prev => prev.map(s =>
                    s.id === searchId ? {
                      ...s,
                      status: `${foundCount} kungörelser hittade`,
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
                  addLog("detail", `${company.name}: Hämtar detalj ${current}/${total}`, event.data?.title);
                  setActiveSearches(prev => prev.map(s =>
                    s.id === searchId ? {
                      ...s,
                      status: `Hämtar detaljer (${current}/${total})`,
                      statusDetail: event.data?.title?.slice(0, 50),
                      progress: detailProgress
                    } : s
                  ));
                  break;

                case "success":
                  addLog("success", `${company.name}: ${event.message}`, event.data?.details);
                  break;

                case "error":
                  addLog("error", `${company.name}: ${event.message}`, event.data?.stack);
                  break;

                case "complete":
                  updateSearchStage(searchId, "Sparar");
                  const saved = event.data?.saved || 0;
                  const duration = event.data?.duration
                    ? `Tog ${Math.round(event.data.duration / 1000)}s`
                    : "";
                  addLog("success", `✓ ${company.name}: ${saved} kungörelser sparade`, duration);
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
                  // Update results
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
        addLog("warning", `${company.name}: Sökning avbruten`);
      } else {
        addLog("error", `${company.name}: Sökning misslyckades`, error instanceof Error ? error.message : "Okänt fel");
      }
      setActiveSearches(prev => prev.map(s =>
        s.id === searchId ? { ...s, status: "Fel", progress: 100 } : s
      ));
    }

    // Remove from active after delay
    setTimeout(() => {
      setActiveSearches(prev => prev.filter(s => s.id !== searchId));
    }, 3000);
  }, [addLog, updateSearchStage]);

  // Keep refs in sync with state
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Queue all unsearched companies
  const queueUnsearched = useCallback(() => {
    const unsearched = companies
      .filter(c => !searchedCompanies.has(c.orgNumber))
      .map(c => c.orgNumber);
    setQueue(unsearched);
    queueRef.current = unsearched;
    addLog("info", `Köade ${unsearched.length} osökta bolag`);
  }, [companies, searchedCompanies, addLog]);

  // Queue all companies
  const queueAll = useCallback(() => {
    const all = companies.map(c => c.orgNumber);
    setQueue(all);
    queueRef.current = all;
    addLog("info", `Köade alla ${all.length} bolag`);
  }, [companies, addLog]);

  // Force stop everything
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
    addLog("error", "Alla sökningar tvångsavbrutna");

    // Reset force stop after a short delay
    setTimeout(() => {
      forceStopRef.current = false;
    }, 500);
  }, [addLog]);

  // Process queue - using refs to avoid stale closure issues
  const processQueue = useCallback(async () => {
    if (forceStopRef.current) return;

    // Use refs for accurate current values
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

    // Get batch from ref
    const batch = currentQueue.slice(0, parallelCount);
    const remaining = currentQueue.slice(parallelCount);

    // Update both state and ref
    setQueue(remaining);
    queueRef.current = remaining;

    // Search in parallel (or sequentially if parallelCount is 1)
    await Promise.all(batch.map(async (orgNumber) => {
      if (forceStopRef.current) return;
      const company = companies.find(c => c.orgNumber === orgNumber);
      if (company) {
        await searchCompany(company);
      }
    }));

    // Continue with delay - check ref for current state
    if (!forceStopRef.current && !isPausedRef.current && queueRef.current.length > 0) {
      setTimeout(() => {
        processQueue();
      }, 2000);
    } else if (queueRef.current.length === 0) {
      setIsRunning(false);
      isRunningRef.current = false;
      if (!forceStopRef.current) {
        addLog("success", "Alla sökningar klara!");
        onComplete();
      }
    }
  }, [parallelCount, companies, searchCompany, addLog, onComplete]);

  // Start queue processing
  const startQueue = useCallback(() => {
    forceStopRef.current = false;
    if (queue.length === 0) {
      queueUnsearched();
    }
    setIsPaused(false);
    processQueue();
  }, [queue.length, queueUnsearched, processQueue]);

  // Pause queue (soft stop)
  const pauseQueue = useCallback(() => {
    setIsPaused(true);
    addLog("warning", "Sökningar pausade - pågående slutförs");
  }, [addLog]);

  // Resume queue
  const resumeQueue = useCallback(() => {
    setIsPaused(false);
    processQueue();
  }, [processQueue]);

  // Filter companies
  const filteredCompanies = companies.filter(c => {
    if (searchFilter) {
      const query = searchFilter.toLowerCase();
      if (!c.name.toLowerCase().includes(query) && !c.orgNumber.includes(query)) {
        return false;
      }
    }
    if (categoryFilter === "pending") {
      return !searchedCompanies.has(c.orgNumber);
    }
    if (categoryFilter === "done") {
      return searchedCompanies.has(c.orgNumber);
    }
    return true;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (start: Date) => {
    const seconds = Math.floor((Date.now() - start.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  // Stats
  const totalSearched = searchedCompanies.size;
  const totalWithResults = Object.values(companyResults).filter(c => c > 0).length;
  const totalAnnouncements = Object.values(companyResults).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-card text-foreground rounded-2xl border border-border overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-secondary/50 dark:bg-secondary/30 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"}`} />
            <h2 className="text-lg font-semibold">Kungörelsescraper</h2>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
            <span className="px-2 py-0.5 bg-background rounded-md">{totalSearched}/{companies.length} sökta</span>
            <span className="px-2 py-0.5 bg-background rounded-md">{totalWithResults} med träff</span>
            <span className="px-2 py-0.5 bg-background rounded-md">{totalAnnouncements} kungörelser</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            <Settings size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-5 py-4 bg-secondary/30 dark:bg-secondary/20 border-b border-border">
          <div className="flex flex-wrap items-center gap-6">
            {/* Presets */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hastighet:</span>
              {[
                { key: "safe", label: "Säker", icon: Shield, parallel: 1, desc: "1 åt gången (rekommenderas)" },
                { key: "balanced", label: "Balanserad", icon: Scale, parallel: 3, desc: "3 parallellt" },
                { key: "fast", label: "Snabb", icon: Zap, parallel: 5, desc: "5 parallellt (riskabelt)" },
              ].map(({ key, label, icon: Icon, parallel, desc }) => (
                <button
                  key={key}
                  onClick={() => setParallelCount(parallel)}
                  title={desc}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    parallelCount === parallel
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Parallel count input */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Parallella sökningar:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={parallelCount}
                onChange={(e) => setParallelCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="w-16 px-2 py-1.5 bg-background border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {parallelCount === 1
              ? "Säkert läge: En sökning åt gången minskar risken för blockering från Bolagsverket."
              : parallelCount <= 3
                ? "Balanserat läge: Snabbare men ökad risk för rate limiting."
                : "Varning: Hög parallellitet kan leda till tillfällig blockering."}
          </p>
        </div>
      )}

      {/* Action Bar with Stop Button */}
      <div className="flex items-center gap-3 px-4 py-3 bg-background border-b border-border flex-wrap">
        <input
          type="text"
          placeholder="Sök företag..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="flex-1 min-w-[200px] max-w-xs px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => selectedCompany && searchCompany(selectedCompany)}
            disabled={!selectedCompany || isRunning}
            className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg text-sm font-medium transition-colors"
          >
            Sök vald
          </button>
          <button
            onClick={queueUnsearched}
            disabled={isRunning}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 disabled:opacity-50 text-foreground rounded-lg text-sm font-medium transition-colors"
          >
            Köa osökta
          </button>
          <button
            onClick={queueAll}
            disabled={isRunning}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 disabled:opacity-50 text-foreground rounded-lg text-sm font-medium transition-colors"
          >
            Köa alla
          </button>
        </div>

        {/* Start/Pause/Stop controls */}
        <div className="flex items-center gap-2 ml-auto">
          {queue.length > 0 && !isRunning && !isPaused && (
            <button
              onClick={startQueue}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Play size={16} />
              Starta ({queue.length})
            </button>
          )}

          {isRunning && !isPaused && (
            <button
              onClick={pauseQueue}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Square size={16} />
              Pausa
            </button>
          )}

          {isPaused && queue.length > 0 && (
            <button
              onClick={resumeQueue}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Play size={16} />
              Fortsätt ({queue.length})
            </button>
          )}

          {(isRunning || activeSearches.length > 0) && (
            <button
              onClick={forceStop}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              title="Tvångsavbryt alla pågående sökningar"
            >
              <StopCircle size={16} />
              Stopp
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[450px]">
        {/* Company List */}
        <div className="w-full lg:w-[300px] flex flex-col border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">Bolag ({filteredCompanies.length})</span>
            <div className="flex gap-1">
              {(["all", "pending", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setCategoryFilter(f)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    categoryFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {f === "all" ? "Alla" : f === "pending" ? "Kvar" : "Klara"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[150px] lg:max-h-none">
            {filteredCompanies.map((company) => {
              const isSearching = activeSearches.some(s => s.orgNumber === company.orgNumber);
              const resultCount = companyResults[company.orgNumber] || 0;
              const hasSearched = searchedCompanies.has(company.orgNumber);

              return (
                <div
                  key={company.orgNumber}
                  onClick={() => setSelectedCompany(company)}
                  className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors border-b border-border/50 ${
                    selectedCompany?.orgNumber === company.orgNumber
                      ? "bg-primary/10 border-l-2 border-l-primary"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{company.name}</div>
                    <div className="text-xs text-muted-foreground">{company.orgNumber}</div>
                  </div>
                  {isSearching ? (
                    <Loader2 size={16} className="animate-spin text-primary" />
                  ) : hasSearched ? (
                    resultCount > 0 ? (
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                        {resultCount}
                      </span>
                    ) : (
                      <Check size={16} className="text-muted-foreground" />
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side: Active searches + Logs */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Active Searches */}
          <div className="border-b border-border">
            <div className="px-4 py-2 bg-secondary/30 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {activeSearches.length > 0 ? `Pågående (${activeSearches.length})` : "Status"}
              </span>
              {queue.length > 0 && (
                <span className="text-xs text-muted-foreground">{queue.length} i kö</span>
              )}
            </div>
            <div className="h-[140px] overflow-y-auto p-3">
              {activeSearches.length > 0 ? (
                <div className="space-y-3">
                  {activeSearches.map((search) => (
                    <div
                      key={search.id}
                      className="p-3 bg-secondary/30 rounded-xl border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-primary" />
                          <span className="text-sm font-medium">{search.company}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDuration(search.startedAt)}</span>
                      </div>

                      {/* Stage indicators */}
                      <div className="flex items-center gap-1 mb-2">
                        {search.stages.map((stage, i) => (
                          <div key={stage.name} className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full transition-colors ${
                                stage.completed ? "bg-emerald-500" :
                                stage.current ? "bg-primary animate-pulse" :
                                "bg-muted-foreground/30"
                              }`}
                              title={stage.name}
                            />
                            {i < search.stages.length - 1 && (
                              <div className={`w-4 h-0.5 ${stage.completed ? "bg-emerald-500" : "bg-muted-foreground/20"}`} />
                            )}
                          </div>
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-2">{search.stages.find(s => s.current)?.name || "Klart"}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${search.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">{search.status}</span>
                      </div>

                      {/* Status detail */}
                      {search.statusDetail && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{search.statusDetail}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  {queue.length > 0 ? (
                    <>
                      <div className="text-3xl font-bold text-primary mb-1">{queue.length}</div>
                      <div className="text-sm mb-3">bolag i kö</div>
                      <button
                        onClick={startQueue}
                        className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                      >
                        <Play size={16} />
                        Starta sökningar
                      </button>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={24} className="mb-2 opacity-50" />
                      <div className="text-sm text-center">
                        {selectedCompany
                          ? `Klicka "Sök vald" för att söka ${selectedCompany.name}`
                          : "Välj ett bolag eller klicka 'Köa osökta'"}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Log */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-border">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"}`} />
                <span className="text-sm font-medium text-muted-foreground">Händelselogg</span>
              </div>
              <button
                onClick={() => setLogs([])}
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
              >
                <Trash2 size={12} />
                Rensa
              </button>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-2 space-y-1">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm">
                  Redo att söka kungörelser...
                </div>
              ) : (
                logs.map((log) => {
                  const Icon = typeIcons[log.type];
                  const style = typeStyles[log.type];
                  const isExpanded = expandedLog === log.id;

                  return (
                    <div
                      key={log.id}
                      className={`p-2 rounded-lg border transition-colors ${style.bg} ${style.border} ${log.details ? "cursor-pointer hover:shadow-sm" : ""}`}
                      onClick={() => log.details && setExpandedLog(isExpanded ? null : log.id)}
                    >
                      <div className="flex items-start gap-2">
                        <Icon size={14} className={`mt-0.5 shrink-0 ${style.text}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatTime(log.timestamp)}</span>
                            <span className={`text-sm ${style.text}`}>{log.message}</span>
                          </div>
                          {log.details && isExpanded && (
                            <p className="text-xs text-muted-foreground mt-1 pl-0">{log.details}</p>
                          )}
                        </div>
                        {log.details && (
                          <button className="shrink-0 p-0.5">
                            {isExpanded ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
