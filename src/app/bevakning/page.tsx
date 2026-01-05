"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  MapPin,
  TrendingUp,
  TrendingDown,
  Banknote,
  Calendar,
  Users2,
  User,
  ExternalLink,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatOrgNr } from "@/lib/utils";

// Enrichment log entry type
interface LogEntry {
  timestamp: Date;
  type: "info" | "success" | "error" | "warning" | "start" | "complete";
  message: string;
  company?: string;
}

// Enrichment Modal Component
function EnrichmentModal({
  isOpen,
  onClose,
  logs,
  isRunning,
  stats,
}: {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  isRunning: boolean;
  stats: { processed: number; success: number; errors: number; remaining: number };
}) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  if (!isOpen) return null;

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
      case "start":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />;
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
      default:
        return <Terminal className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />;
    }
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "start":
        return "text-blue-400";
      case "complete":
        return "text-emerald-400 font-semibold";
      default:
        return "text-muted-foreground/50";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="w-full max-w-2xl bg-foreground rounded-xl shadow-xl overflow-hidden border border-border text-background animate-scale-in">
        {/* Header */}
        <div className="px-4 py-3 bg-foreground/95 border-b border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-background">Berika Data - Arbetslogg</h3>
            {isRunning && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" />
                Kör...
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-background/70 hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-2 bg-foreground/90 border-b border-border/20 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-background/70">Bearbetade:</span>
            <span className="font-mono text-background">{stats.processed}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-background/70">Lyckade:</span>
            <span className="font-mono text-green-300">{stats.success}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-background/70">Fel:</span>
            <span className="font-mono text-red-300">{stats.errors}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-background/70">Kvar:</span>
            <span className="font-mono text-yellow-300">{stats.remaining}</span>
          </div>
        </div>

        {/* Log Content */}
        <div className="h-80 overflow-y-auto p-4 font-mono text-sm bg-foreground/95">
          {logs.length === 0 ? (
            <div className="text-background/70 text-center py-8">
              Startar berikning...
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  {getLogIcon(log.type)}
                  <span className="text-background/60 text-xs flex-shrink-0">
                    {log.timestamp.toLocaleTimeString("sv-SE")}
                  </span>
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-foreground/95 border-t border-border/20 flex items-center justify-between">
          <p className="text-xs text-background/70">
            {isRunning ? "Vänta medan berikning pågår..." : "Berikning klar"}
          </p>
          <Button
            onClick={onClose}
            disabled={isRunning}
            variant="outline"
            size="sm"
            className="bg-transparent border-border/40 text-background hover:bg-white/10"
          >
            {isRunning ? "Vänta..." : "Stäng"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface WatchedCompany {
  id: string;
  orgNumber: string;
  name: string;
  hasLogo: boolean;
  impactNiche?: string | null;
  city?: string | null;
  ceo?: string | null;
  startYear?: string | null;
  fundraising?: string | null;
  totalFunding?: string | null;
  latestFundingRound?: string | null;
  latestFundingDate?: string | null;
  latestValuation?: string | null;
  turnover2024?: string | null;
  profit2024?: string | null;
  turnover2023?: string | null;
  profit2023?: string | null;
  growth2023to2024?: string | null;
  largestOwners?: string | null;
  totalFundingNum?: number | null;
  latestValuationNum?: number | null;
  turnover2024Num?: number | null;
  profit2024Num?: number | null;
  growthNum?: number | null;
  // Enriched fields
  legalName?: string | null;
  companyType?: string | null;
  status?: string | null;
  chairman?: string | null;
  employees?: number | null;
  address?: string | null;
  postalCode?: string | null;
  municipality?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  sniCode?: string | null;
  sniDescription?: string | null;
  paymentRemarks?: boolean | null;
  fSkatt?: boolean | null;
  momsRegistered?: boolean | null;
  parentCompany?: string | null;
  subsidiaryCount?: number | null;
  shareCapital?: number | null;
  lastEnriched?: string | null;
  enrichmentError?: string | null;
}

interface FilterOption {
  name: string | null;
  count: number;
}

type SortField = "name" | "impactNiche" | "city" | "turnover2024Num" | "profit2024Num" | "latestValuationNum" | "totalFundingNum" | "growthNum" | "startYear";

// Format large numbers to readable format (e.g., 14.4 mdkr)
function formatSek(value: number | null | undefined): string {
  if (!value && value !== 0) return "-";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} mdkr`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} mkr`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(0)} tkr`;
  }
  return `${value.toLocaleString("sv-SE")} kr`;
}

function formatGrowth(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

export default function BevakningslistaPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<WatchedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [needsSeed, setNeedsSeed] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>("turnover2024Num");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [niches, setNiches] = useState<FilterOption[]>([]);
  const [cities, setCities] = useState<FilterOption[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentStatus, setEnrichmentStatus] = useState<{ processed: number; remaining: number } | null>(null);
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  const [enrichmentLogs, setEnrichmentLogs] = useState<LogEntry[]>([]);
  const [enrichmentStats, setEnrichmentStats] = useState({ processed: 0, success: 0, errors: 0, remaining: 0 });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const INITIAL_LIMIT = 30;
  const LOAD_MORE_LIMIT = 20;

  const fetchCompanies = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const currentPage = reset ? 1 : page;
      const limit = reset ? INITIAL_LIMIT : LOAD_MORE_LIMIT;
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (search) params.set("q", search);
      if (selectedNiche) params.set("impactNiche", selectedNiche);
      if (selectedCity) params.set("city", selectedCity);

      const res = await fetch(`/api/bevakning?${params}`);
      if (res.ok) {
        const data = await res.json();

        if (reset) {
          setCompanies(data.companies);
          setPage(2);
        } else {
          setCompanies(prev => [...prev, ...data.companies]);
          setPage(prev => prev + 1);
        }

        setTotal(data.total);
        setHasMore(data.companies.length === limit && companies.length + data.companies.length < data.total);
        setNeedsSeed(data.total === 0);

        if (data.filters?.impactNiches) {
          setNiches(data.filters.impactNiches);
        }
        if (data.filters?.cities) {
          setCities(data.filters.cities);
        }
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, search, sortBy, sortOrder, selectedNiche, selectedCity, companies.length]);

  // Initial load
  useEffect(() => {
    fetchCompanies(true);
  }, [search, sortBy, sortOrder, selectedNiche, selectedCity]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          fetchCompanies(false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, isLoadingMore, fetchCompanies]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/bevakning/seed", { method: "POST" });
      if (res.ok) {
        await fetchCompanies(true);
      }
    } catch (error) {
      console.error("Failed to seed:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "name" || field === "impactNiche" || field === "city" ? "asc" : "desc");
    }
  };

  const handleCompanyClick = (orgNumber: string) => {
    router.push(`/bolag/${orgNumber}`);
  };

  const clearAllFilters = () => {
    setSelectedNiche(null);
    setSelectedCity(null);
    setSearch("");
    setSearchInput("");
  };

  const addLog = (type: LogEntry["type"], message: string) => {
    setEnrichmentLogs(prev => [...prev, { timestamp: new Date(), type, message }]);
  };

  const handleEnrichBatch = async () => {
    // Open modal and reset state
    setShowEnrichmentModal(true);
    setEnrichmentLogs([]);
    setEnrichmentStats({ processed: 0, success: 0, errors: 0, remaining: 0 });
    setIsEnriching(true);

    addLog("start", "Startar berikningsprocess med realtidsuppdateringar...");

    try {
      // Use streaming endpoint for real-time progress
      const response = await fetch("/api/bevakning/enrich/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 30 }), // Process 30 companies per click
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let totalSuccess = 0;
      let totalErrors = 0;
      let totalProcessed = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              // Map event types to log types
              switch (data.type) {
                case "status":
                case "start":
                  addLog("start", data.message);
                  if (data.total) {
                    setEnrichmentStats(prev => ({ ...prev, remaining: data.remaining || prev.remaining }));
                  }
                  break;

                case "progress":
                  addLog("info", data.message);
                  totalProcessed = data.current;
                  setEnrichmentStats(prev => ({
                    ...prev,
                    processed: data.current,
                  }));
                  break;

                case "success":
                  addLog("success", data.message);
                  totalSuccess++;
                  setEnrichmentStats(prev => ({
                    ...prev,
                    processed: data.current,
                    success: totalSuccess,
                  }));
                  break;

                case "warning":
                  addLog("warning", data.message);
                  totalErrors++;
                  setEnrichmentStats(prev => ({
                    ...prev,
                    errors: totalErrors,
                  }));
                  break;

                case "error":
                  addLog("error", data.message);
                  totalErrors++;
                  setEnrichmentStats(prev => ({
                    ...prev,
                    errors: totalErrors,
                  }));
                  break;

                case "complete":
                  addLog("complete", data.message);
                  setEnrichmentStats({
                    processed: data.total,
                    success: data.successCount,
                    errors: data.errorCount,
                    remaining: data.remaining,
                  });
                  setEnrichmentStatus({ processed: data.total, remaining: data.remaining });
                  break;

                case "fatal":
                  addLog("error", data.message);
                  break;
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      }

      // Refresh the list
      fetchCompanies(true);
    } catch (error) {
      console.error("Enrichment failed:", error);
      addLog("error", `Kritiskt fel: ${error instanceof Error ? error.message : "Okänt fel"}`);
    } finally {
      setIsEnriching(false);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const activeFilterCount = (selectedNiche ? 1 : 0) + (selectedCity ? 1 : 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <header className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Bevakningslista</h1>
              <p className="page-subtitle">Följ dina bevakade bolag och deras utveckling</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {total > 0 ? `${total.toLocaleString("sv-SE")} bolag` : ""}
              </span>
              <Button
                onClick={handleEnrichBatch}
                disabled={isEnriching}
                variant="outline"
                size="sm"
              >
                {isEnriching ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Berikar...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Berika data
                  </>
                )}
              </Button>
            </div>
          </div>
          {enrichmentStatus && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Berikade {enrichmentStatus.processed} bolag. {enrichmentStatus.remaining > 0 ? `${enrichmentStatus.remaining} kvar.` : "Alla klara!"}
            </p>
          )}
        </header>

        {/* Seed button if needed */}
        {needsSeed && !isLoading && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <h2 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Importera bolag
            </h2>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Bevakningslistan ar tom. Klicka nedan for att importera alla bolag med fullstandig data.
            </p>
            <Button onClick={handleSeed} disabled={isSeeding}>
              {isSeeding ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Importerar...
                </>
              ) : (
                "Importera bolag"
              )}
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
              <Input
                type="text"
                placeholder="Sok bolag, nisch, stad, agare..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-secondary" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-4 content-card bg-card border border-border space-y-4">
            {/* Impact Niche Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Impact Nisch</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Rensa alla filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {niches.slice(0, 12).map((niche) => (
                  <button
                    key={niche.name}
                    onClick={() => setSelectedNiche(selectedNiche === niche.name ? null : niche.name)}
                    className={`filter-chip ${selectedNiche === niche.name ? "active" : ""}`}
                  >
                    {niche.name}
                    <span className="opacity-60">({niche.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div>
              <span className="text-label block mb-3">Stad</span>
              <div className="flex flex-wrap gap-2">
                {cities.slice(0, 10).map((city) => (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(selectedCity === city.name ? null : city.name)}
                    className={`filter-chip ${selectedCity === city.name ? "active" : ""}`}
                  >
                    {city.name}
                    <span className="opacity-60">({city.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(search || selectedNiche || selectedCity) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                Sok: {search}
                <button onClick={() => { setSearch(""); setSearchInput(""); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedNiche && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                {selectedNiche}
                <button onClick={() => setSelectedNiche(null)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-sm">
                {selectedCity}
                <button onClick={() => setSelectedCity(null)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <div className="data-table bg-card border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-secondary/60 dark:bg-gray-800/50 border-b border-border dark:border-gray-800 text-sm font-medium text-muted-foreground">
            <div className="col-span-4 lg:col-span-3">
              <button
                onClick={() => handleSort("name")}
                className="flex items-center gap-1 hover:text-foreground dark:hover:text-white"
              >
                Bolag
                <SortIcon field="name" />
              </button>
            </div>
            <div className="col-span-2 hidden lg:block">
              <button
                onClick={() => handleSort("impactNiche")}
                className="flex items-center gap-1 hover:text-foreground dark:hover:text-white"
              >
                Nisch
                <SortIcon field="impactNiche" />
              </button>
            </div>
            <div className="col-span-1 hidden xl:block">
              <button
                onClick={() => handleSort("city")}
                className="flex items-center gap-1 hover:text-foreground dark:hover:text-white"
              >
                <MapPin className="w-3 h-3" />
                <SortIcon field="city" />
              </button>
            </div>
            <div className="col-span-2 text-right">
              <button
                onClick={() => handleSort("turnover2024Num")}
                className="flex items-center gap-1 ml-auto hover:text-foreground dark:hover:text-white"
              >
                Oms. 2024
                <SortIcon field="turnover2024Num" />
              </button>
            </div>
            <div className="col-span-2 text-right hidden sm:flex">
              <button
                onClick={() => handleSort("latestValuationNum")}
                className="flex items-center gap-1 ml-auto hover:text-foreground dark:hover:text-white"
              >
                Vardering
                <SortIcon field="latestValuationNum" />
              </button>
            </div>
            <div className="col-span-2 text-right hidden md:flex">
              <button
                onClick={() => handleSort("totalFundingNum")}
                className="flex items-center gap-1 ml-auto hover:text-foreground dark:hover:text-white"
              >
                <Banknote className="w-3 h-3" />
                Funding
                <SortIcon field="totalFundingNum" />
              </button>
            </div>
            <div className="col-span-1 text-right hidden lg:flex">
              <button
                onClick={() => handleSort("growthNum")}
                className="flex items-center gap-1 ml-auto hover:text-foreground dark:hover:text-white"
              >
                Tillvaxt
                <SortIcon field="growthNum" />
              </button>
            </div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-4 py-4 animate-pulse">
                  <div className="col-span-4 lg:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary dark:bg-gray-700 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-secondary dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="col-span-2 hidden lg:block">
                    <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-2/3" />
                  </div>
                  <div className="col-span-1 hidden xl:block">
                    <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-1/2" />
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-20 ml-auto" />
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-20 ml-auto" />
                  </div>
                  <div className="col-span-2 hidden md:block">
                    <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-16 ml-auto" />
                  </div>
                  <div className="col-span-1 hidden lg:block">
                    <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-12 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {companies.map((company) => {
                const isExpanded = expandedId === company.id;
                return (
                  <div key={company.id}>
                    {/* Main Row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : company.id)}
                      className="w-full grid grid-cols-12 gap-2 px-4 py-3 hover:bg-secondary/60 dark:hover:bg-gray-800/50 transition-colors text-left group"
                    >
                      {/* Expand indicator + Company Name + Logo */}
                      <div className="col-span-4 lg:col-span-3 flex items-center gap-3 min-w-0">
                        <ChevronRight className={`w-4 h-4 text-muted-foreground/70 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-secondary rounded-lg overflow-hidden">
                          {company.hasLogo ? (
                            <img
                              src={`/logos/${company.orgNumber.replace(/-/g, "")}.png`}
                              alt=""
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-muted-foreground/70" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {company.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatOrgNr(company.orgNumber)}</span>
                            {company.startYear && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-0.5">
                                  <Calendar className="w-3 h-3" />
                                  {company.startYear}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Impact Niche */}
                      <div className="col-span-2 hidden lg:flex items-center">
                        {company.impactNiche ? (
                          <span className="text-sm text-muted-foreground truncate">
                            {company.impactNiche}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground/50 dark:text-muted-foreground">-</span>
                        )}
                      </div>

                      {/* City */}
                      <div className="col-span-1 hidden xl:flex items-center">
                        <span className="text-sm text-muted-foreground truncate">
                          {company.city || "-"}
                        </span>
                      </div>

                      {/* Turnover 2024 */}
                      <div className="col-span-2 flex items-center justify-end">
                        <span className="text-sm font-medium text-foreground">
                          {formatSek(company.turnover2024Num)}
                        </span>
                      </div>

                      {/* Latest Valuation */}
                      <div className="col-span-2 hidden sm:flex items-center justify-end">
                        <span className="text-sm text-muted-foreground">
                          {formatSek(company.latestValuationNum)}
                        </span>
                      </div>

                      {/* Total Funding */}
                      <div className="col-span-2 hidden md:flex items-center justify-end">
                        {company.totalFundingNum ? (
                          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatSek(company.totalFundingNum)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground/50 dark:text-muted-foreground">-</span>
                        )}
                      </div>

                      {/* Growth */}
                      <div className="col-span-1 hidden lg:flex items-center justify-end gap-1">
                        {company.growthNum !== null && company.growthNum !== undefined ? (
                          <>
                            {company.growthNum >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              company.growthNum >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}>
                              {formatGrowth(company.growthNum)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground/50 dark:text-muted-foreground">-</span>
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 py-4 bg-secondary/60 dark:bg-gray-800/30 border-t border-border dark:border-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Basic Info */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grundinfo</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Org.nr</span>
                                <span className="font-medium">{formatOrgNr(company.orgNumber)}</span>
                              </div>
                              {company.ceo && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />VD</span>
                                  <span className="font-medium">{company.ceo}</span>
                                </div>
                              )}
                              {company.city && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />Stad</span>
                                  <span className="font-medium">{company.city}</span>
                                </div>
                              )}
                              {company.startYear && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />Grundat</span>
                                  <span className="font-medium">{company.startYear}</span>
                                </div>
                              )}
                              {company.impactNiche && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Impact</span>
                                  <span className="font-medium text-right">{company.impactNiche}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Funding */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Finansiering</h4>
                            <div className="space-y-2 text-sm">
                              {company.totalFunding && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Totalt</span>
                                  <span className="font-medium text-emerald-600">{company.totalFunding}</span>
                                </div>
                              )}
                              {company.latestValuation && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Värdering</span>
                                  <span className="font-medium">{company.latestValuation}</span>
                                </div>
                              )}
                              {company.latestFundingRound && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Senaste runda</span>
                                  <span className="font-medium">{company.latestFundingRound}</span>
                                </div>
                              )}
                              {company.latestFundingDate && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Datum</span>
                                  <span className="font-medium">{company.latestFundingDate}</span>
                                </div>
                              )}
                              {company.fundraising && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status</span>
                                  <span className="font-medium">{company.fundraising}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Financials */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Finansiellt</h4>
                            <div className="space-y-2 text-sm">
                              {company.turnover2024 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Oms. 2024</span>
                                  <span className="font-medium">{company.turnover2024}</span>
                                </div>
                              )}
                              {company.profit2024 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Resultat 2024</span>
                                  <span className={`font-medium ${company.profit2024Num && company.profit2024Num >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {company.profit2024}
                                  </span>
                                </div>
                              )}
                              {company.turnover2023 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Oms. 2023</span>
                                  <span className="font-medium">{company.turnover2023}</span>
                                </div>
                              )}
                              {company.profit2023 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Resultat 2023</span>
                                  <span className="font-medium">{company.profit2023}</span>
                                </div>
                              )}
                              {company.growth2023to2024 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Tillväxt</span>
                                  <span className={`font-medium ${company.growthNum && company.growthNum >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {company.growth2023to2024}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ownership & Actions */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ägare</h4>
                            <div className="space-y-2 text-sm">
                              {company.largestOwners ? (
                                <p className="text-foreground">{company.largestOwners}</p>
                              ) : (
                                <p className="text-muted-foreground/70">Ingen ägarinfo</p>
                              )}
                            </div>
                            <div className="pt-4">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompanyClick(company.orgNumber);
                                }}
                                className="w-full"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Se fullständig bolagsinfo
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Enriched data section */}
                        {(company.employees || company.chairman || company.status || company.website || company.sniDescription) && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Officiell data (Bolagsinfo)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                              {company.employees && (
                                <div>
                                  <span className="text-muted-foreground block">Anställda</span>
                                  <span className="font-medium">{company.employees}</span>
                                </div>
                              )}
                              {company.chairman && (
                                <div>
                                  <span className="text-muted-foreground block">Ordförande</span>
                                  <span className="font-medium">{company.chairman}</span>
                                </div>
                              )}
                              {company.status && (
                                <div>
                                  <span className="text-muted-foreground block">Status</span>
                                  <span className={`font-medium ${company.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                                    {company.status === "ACTIVE" ? "Aktiv" : company.status}
                                  </span>
                                </div>
                              )}
                              {company.companyType && (
                                <div>
                                  <span className="text-muted-foreground block">Bolagstyp</span>
                                  <span className="font-medium">{company.companyType}</span>
                                </div>
                              )}
                              {company.sniDescription && (
                                <div>
                                  <span className="text-muted-foreground block">Bransch</span>
                                  <span className="font-medium">{company.sniDescription}</span>
                                </div>
                              )}
                              {company.website && (
                                <div>
                                  <span className="text-muted-foreground block">Webb</span>
                                  <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline truncate block">
                                    {company.website.replace(/^https?:\/\//, "")}
                                  </a>
                                </div>
                              )}
                              {company.paymentRemarks === true && (
                                <div>
                                  <span className="text-muted-foreground block">Anmärkningar</span>
                                  <span className="font-medium text-red-600">Ja</span>
                                </div>
                              )}
                              {company.subsidiaryCount && company.subsidiaryCount > 0 && (
                                <div>
                                  <span className="text-muted-foreground block">Dotterbolag</span>
                                  <span className="font-medium">{company.subsidiaryCount}</span>
                                </div>
                              )}
                            </div>
                            {company.lastEnriched && (
                              <p className="text-xs text-muted-foreground/70 mt-2">
                                Uppdaterad: {new Date(company.lastEnriched).toLocaleDateString("sv-SE")}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Load More Trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="px-4 py-8 text-center">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Laddar fler...</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground/70">
                      Scrolla for att ladda fler
                    </span>
                  )}
                </div>
              )}

              {/* End of list */}
              {!hasMore && companies.length > 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground/70">
                  Visar alla {companies.length.toLocaleString("sv-SE")} bolag
                </div>
              )}

              {/* No results */}
              {!isLoading && companies.length === 0 && !needsSeed && (
                <div className="px-4 py-12 text-center">
                  <p className="text-muted-foreground">
                    Inga bolag hittades
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            <span>Totalt inhämtat kapital</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>Omsättningstillväxt 2023-2024</span>
          </div>
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4" />
            <span>Klicka for bolagsdetaljer & agare</span>
          </div>
        </div>
      </div>

      {/* Enrichment Modal */}
      <EnrichmentModal
        isOpen={showEnrichmentModal}
        onClose={() => setShowEnrichmentModal(false)}
        logs={enrichmentLogs}
        isRunning={isEnriching}
        stats={enrichmentStats}
      />
    </main>
  );
}
