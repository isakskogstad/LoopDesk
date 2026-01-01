"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Play, Pause, Trash2, Settings, Loader2, Building2,
  ChevronRight, Check, AlertCircle, Zap, Scale, Shield
} from "lucide-react";

interface WatchedCompany {
  orgNumber: string;
  name: string;
  hasLogo: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error" | "captcha" | "detail";
  message: string;
}

interface ActiveSearch {
  id: string;
  company: string;
  orgNumber: string;
  status: string;
  progress: number;
  found: number;
}

interface ScraperPanelProps {
  companies: WatchedCompany[];
  onComplete: () => void;
  onClose: () => void;
}

const typeColors: Record<LogEntry["type"], string> = {
  info: "text-blue-400",
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
  captcha: "text-purple-400",
  detail: "text-cyan-400",
};

const typeBadges: Record<LogEntry["type"], string> = {
  info: "bg-blue-500/20 text-blue-400",
  success: "bg-green-500/20 text-green-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  error: "bg-red-500/20 text-red-400",
  captcha: "bg-purple-500/20 text-purple-400",
  detail: "bg-cyan-500/20 text-cyan-400",
};

export function ScraperPanel({ companies, onComplete, onClose }: ScraperPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [activeSearches, setActiveSearches] = useState<ActiveSearch[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<WatchedCompany | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "pending" | "done">("all");
  const [parallelCount, setParallelCount] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [companyResults, setCompanyResults] = useState<Record<string, number>>({});
  const [searchedCompanies, setSearchedCompanies] = useState<Set<string>>(new Set());

  const logRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Add log entry
  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    setLogs(prev => [...prev.slice(-199), {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
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

  // Search a single company
  const searchCompany = useCallback(async (company: WatchedCompany) => {
    const searchId = crypto.randomUUID();

    // Add to active searches
    setActiveSearches(prev => [...prev, {
      id: searchId,
      company: company.name,
      orgNumber: company.orgNumber,
      status: "Startar",
      progress: 10,
      found: 0,
    }]);

    addLog("info", `Söker kungörelser för ${company.name}...`);

    try {
      // Update status
      setActiveSearches(prev => prev.map(s =>
        s.id === searchId ? { ...s, status: "Söker", progress: 30 } : s
      ));

      const res = await fetch("/api/kungorelser/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: company.name,
          orgNumber: company.orgNumber,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const count = data.results?.length || 0;

        // Update status
        setActiveSearches(prev => prev.map(s =>
          s.id === searchId ? { ...s, status: "Klar", progress: 100, found: count } : s
        ));

        addLog("success", `Hittade ${count} kungörelser för ${company.name}`);

        // Update results
        setCompanyResults(prev => ({ ...prev, [company.orgNumber]: count }));
        setSearchedCompanies(prev => new Set([...prev, company.orgNumber]));
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      addLog("error", `Sökning misslyckades för ${company.name}: ${error}`);
      setActiveSearches(prev => prev.map(s =>
        s.id === searchId ? { ...s, status: "Fel", progress: 100 } : s
      ));
    }

    // Remove from active after delay
    setTimeout(() => {
      setActiveSearches(prev => prev.filter(s => s.id !== searchId));
    }, 2000);
  }, [addLog]);

  // Queue all unsearched companies
  const queueUnsearched = useCallback(() => {
    const unsearched = companies
      .filter(c => !searchedCompanies.has(c.orgNumber))
      .map(c => c.orgNumber);
    setQueue(unsearched);
    addLog("info", `Köade ${unsearched.length} osökta bolag`);
  }, [companies, searchedCompanies, addLog]);

  // Queue all companies
  const queueAll = useCallback(() => {
    const all = companies.map(c => c.orgNumber);
    setQueue(all);
    addLog("info", `Köade alla ${all.length} bolag`);
  }, [companies, addLog]);

  // Process queue
  const processQueue = useCallback(async () => {
    if (queue.length === 0 || isPaused) {
      setIsRunning(false);
      if (queue.length === 0) {
        addLog("success", "Alla sökningar klara!");
        onComplete();
      }
      return;
    }

    setIsRunning(true);

    // Get batch
    const batch = queue.slice(0, parallelCount);
    setQueue(prev => prev.slice(parallelCount));

    // Search in parallel
    await Promise.all(batch.map(async (orgNumber) => {
      const company = companies.find(c => c.orgNumber === orgNumber);
      if (company) {
        await searchCompany(company);
      }
    }));

    // Continue with delay
    setTimeout(() => {
      processQueue();
    }, 2000);
  }, [queue, isPaused, parallelCount, companies, searchCompany, addLog, onComplete]);

  // Start queue processing
  const startQueue = useCallback(() => {
    if (queue.length === 0) {
      queueUnsearched();
    }
    setIsPaused(false);
    processQueue();
  }, [queue.length, queueUnsearched, processQueue]);

  // Stop queue
  const stopQueue = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    setQueue([]);
    addLog("warning", "Sökningar avbrutna");
  }, [addLog]);

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

  // Stats
  const totalSearched = searchedCompanies.size;
  const totalWithResults = Object.values(companyResults).filter(c => c > 0).length;
  const totalAnnouncements = Object.values(companyResults).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-[#0f0f0f] text-[#f0f0f0] rounded-2xl border border-[#2a2a2a] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Kungörelsescraper</h2>
          <div className="px-3 py-1 bg-[#2a2a2a] rounded-full text-sm text-[#888]">
            {totalSearched}/{companies.length} sökta · {totalWithResults} med · {totalAnnouncements} totalt
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-5 py-4 bg-[#151515] border-b border-[#2a2a2a]">
          <div className="flex flex-wrap items-center gap-6">
            {/* Presets */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#888]">Profil:</span>
              {[
                { key: "fast", label: "Snabb", icon: Zap, parallel: 10 },
                { key: "balanced", label: "Balanserad", icon: Scale, parallel: 5 },
                { key: "safe", label: "Säker", icon: Shield, parallel: 2 },
              ].map(({ key, label, icon: Icon, parallel }) => (
                <button
                  key={key}
                  onClick={() => setParallelCount(parallel)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    parallelCount === parallel
                      ? "bg-[#6366f1] text-white"
                      : "bg-[#2a2a2a] text-[#888] hover:bg-[#3a3a3a]"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Parallel count */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#888]">Parallella:</span>
              <input
                type="number"
                min={1}
                max={20}
                value={parallelCount}
                onChange={(e) => setParallelCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="w-16 px-2 py-1 bg-[#0f0f0f] border border-[#3a3a3a] rounded text-sm text-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* Terminal */}
      <div className="border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-[#3a3a3a]"}`} />
            <span className="text-sm font-medium text-[#888]">Logg</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded"
            >
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
              {isPaused ? "Fortsätt" : "Pausa"}
            </button>
            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded"
            >
              <Trash2 size={12} />
              Rensa
            </button>
          </div>
        </div>
        <div ref={logRef} className="h-[120px] overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#444]">
              Redo att söka kungörelser...
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 py-0.5">
                  <span className="text-[#444] shrink-0">{formatTime(log.timestamp)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-medium shrink-0 ${typeBadges[log.type]}`}>
                    {log.type}
                  </span>
                  <span className={typeColors[log.type]}>{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <input
          type="text"
          placeholder="Sök företag..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="flex-1 max-w-xs px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm focus:outline-none focus:border-[#6366f1]"
        />
        <button
          onClick={() => selectedCompany && searchCompany(selectedCompany)}
          disabled={!selectedCompany || isRunning}
          className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          Sök vald
        </button>
        <button
          onClick={queueUnsearched}
          disabled={isRunning}
          className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
        >
          Köa osökta
        </button>
        <button
          onClick={queueAll}
          disabled={isRunning}
          className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
        >
          Köa alla
        </button>
        {queue.length > 0 && !isRunning && (
          <button
            onClick={startQueue}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
          >
            Starta ({queue.length})
          </button>
        )}
        {isRunning && (
          <button
            onClick={stopQueue}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            Avbryt
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex h-[300px]">
        {/* Company List */}
        <div className="w-[280px] flex flex-col border-r border-[#2a2a2a]">
          <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
            <span className="text-sm font-medium text-[#888]">Bolag ({filteredCompanies.length})</span>
            <div className="flex gap-1">
              {(["all", "pending", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setCategoryFilter(f)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    categoryFilter === f
                      ? "bg-[#6366f1] text-white"
                      : "bg-[#2a2a2a] text-[#888] hover:bg-[#3a3a3a]"
                  }`}
                >
                  {f === "all" ? "Alla" : f === "pending" ? "Ej" : "Klara"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCompanies.map((company) => {
              const isSearching = activeSearches.some(s => s.orgNumber === company.orgNumber);
              const resultCount = companyResults[company.orgNumber] || 0;
              const hasSearched = searchedCompanies.has(company.orgNumber);

              return (
                <div
                  key={company.orgNumber}
                  onClick={() => setSelectedCompany(company)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-b border-[#1a1a1a] ${
                    selectedCompany?.orgNumber === company.orgNumber
                      ? "bg-[#6366f1]/10 border-l-2 border-l-[#6366f1]"
                      : "hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-[#2a2a2a] flex items-center justify-center shrink-0">
                    <Building2 size={12} className="text-[#666]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{company.name}</div>
                    <div className="text-xs text-[#666]">{company.orgNumber}</div>
                  </div>
                  {isSearching ? (
                    <Loader2 size={14} className="animate-spin text-blue-400" />
                  ) : hasSearched ? (
                    resultCount > 0 ? (
                      <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                        {resultCount}
                      </span>
                    ) : (
                      <Check size={14} className="text-[#666]" />
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Searches / Status */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
            <span className="text-sm font-medium text-[#888]">
              {activeSearches.length > 0 ? `Aktiva sökningar (${activeSearches.length})` : "Status"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeSearches.length > 0 ? (
              <div className="space-y-2">
                {activeSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg"
                  >
                    <Loader2 size={16} className="animate-spin text-[#6366f1]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{search.company}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#6366f1] transition-all duration-300"
                            style={{ width: `${search.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#666]">{search.status}</span>
                      </div>
                    </div>
                    {search.found > 0 && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        +{search.found}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#666]">
                {queue.length > 0 ? (
                  <>
                    <div className="text-4xl font-bold text-[#6366f1] mb-2">{queue.length}</div>
                    <div className="text-sm">bolag i kö</div>
                    <button
                      onClick={startQueue}
                      className="mt-4 px-6 py-2 bg-[#6366f1] hover:bg-[#5558e3] text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Starta sökningar
                    </button>
                  </>
                ) : (
                  <>
                    <AlertCircle size={32} className="mb-2 opacity-50" />
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
      </div>
    </div>
  );
}
