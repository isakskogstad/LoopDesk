"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Terminal } from "@/components/bolaghandelser/terminal";
import { CompanyList } from "@/components/bolaghandelser/company-list";
import { ResultsPanel } from "@/components/bolaghandelser/results-panel";
import { DetailModal } from "@/components/bolaghandelser/detail-modal";
import { QueueStatus } from "@/components/bolaghandelser/queue-status";
import { ActiveSearches } from "@/components/bolaghandelser/active-searches";
import { SettingsModal } from "@/components/bolaghandelser/settings-modal";
import { Settings, X } from "lucide-react";

export interface Company {
  orgNumber: string;
  name: string;
  hasLogo: boolean;
  resultCount: number;
  lastSearched: string | null;
  status: "idle" | "searching" | "done" | "error";
}

export interface Announcement {
  id: string;
  subject: string;
  type: string | null;
  reporter: string | null;
  pubDate: string | null;
  publishedAt: string | null;
  detailText: string | null;
  fullText: string | null;
  url: string | null;
  orgNumber: string | null;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error" | "captcha" | "detail" | "rate-limit";
  message: string;
}

export interface ActiveSearch {
  id: string;
  company: string;
  status: string;
  progress: number;
  found: number;
}

export default function BolaghandelserPage() {
  // State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [activeSearches, setActiveSearches] = useState<ActiveSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "unsearched" | "with" | "without">("all");
  const [parallelCount, setParallelCount] = useState(5);

  // Stats
  const [stats, setStats] = useState({
    totalCompanies: 0,
    searchedCount: 0,
    withResults: 0,
    totalAnnouncements: 0,
  });

  // Log function
  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
    };
    setLogs(prev => [...prev.slice(-199), entry]); // Keep max 200
  }, []);

  // Load companies from watchlist
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("/api/watchlist");
        if (res.ok) {
          const data = await res.json();
          const companiesWithStatus = data.companies.map((c: { orgNumber: string; name: string; hasLogo?: boolean }) => ({
            orgNumber: c.orgNumber,
            name: c.name,
            hasLogo: c.hasLogo || false,
            resultCount: 0,
            lastSearched: null,
            status: "idle" as const,
          }));
          setCompanies(companiesWithStatus);
          addLog("info", `Laddat ${companiesWithStatus.length} bolag från bevakningslistan`);
        }
      } catch (error) {
        addLog("error", `Kunde inte ladda bolag: ${error}`);
      }
    }
    loadCompanies();
  }, [addLog]);

  // Load announcements count per company
  useEffect(() => {
    async function loadAnnouncementCounts() {
      try {
        const res = await fetch("/api/kungorelser/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.byCompany) {
            setCompanies(prev => prev.map(c => ({
              ...c,
              resultCount: data.byCompany[c.orgNumber] || 0,
              lastSearched: data.byCompany[c.orgNumber] ? "searched" : null,
            })));
          }
          setStats(prev => ({
            ...prev,
            totalAnnouncements: data.total || 0,
          }));
        }
      } catch (error) {
        console.error("Error loading counts:", error);
      }
    }
    if (companies.length > 0) {
      loadAnnouncementCounts();
    }
  }, [companies.length]);

  // Update stats when companies change
  useEffect(() => {
    const searched = companies.filter(c => c.lastSearched !== null).length;
    const withResults = companies.filter(c => c.resultCount > 0).length;
    setStats(prev => ({
      ...prev,
      totalCompanies: companies.length,
      searchedCount: searched,
      withResults,
    }));
  }, [companies]);

  // Load announcements for selected company
  useEffect(() => {
    async function loadAnnouncements() {
      if (!selectedCompany) {
        setAnnouncements([]);
        return;
      }
      try {
        const res = await fetch(`/api/kungorelser/company/${selectedCompany.orgNumber}`);
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        addLog("error", `Kunde inte ladda kungörelser: ${error}`);
      }
    }
    loadAnnouncements();
  }, [selectedCompany, addLog]);

  // Search single company
  const searchCompany = useCallback(async (company: Company) => {
    if (isSearching) return;

    setIsSearching(true);
    setSelectedCompany(company);

    // Update company status
    setCompanies(prev => prev.map(c =>
      c.orgNumber === company.orgNumber ? { ...c, status: "searching" as const } : c
    ));

    addLog("info", `Startar sökning för ${company.name}...`);

    // Add to active searches
    const searchId = crypto.randomUUID();
    setActiveSearches(prev => [...prev, {
      id: searchId,
      company: company.name,
      status: "Startar",
      progress: 0,
      found: 0,
    }]);

    try {
      const res = await fetch("/api/kungorelser/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: company.name, orgNumber: company.orgNumber }),
      });

      if (res.ok) {
        const data = await res.json();
        const count = data.results?.length || 0;

        addLog("success", `Hittade ${count} kungörelser för ${company.name}`);

        // Update company
        setCompanies(prev => prev.map(c =>
          c.orgNumber === company.orgNumber ? {
            ...c,
            status: "done" as const,
            resultCount: count,
            lastSearched: new Date().toISOString(),
          } : c
        ));

        // Reload announcements
        const announcementsRes = await fetch(`/api/kungorelser/company/${company.orgNumber}`);
        if (announcementsRes.ok) {
          const announcementsData = await announcementsRes.json();
          setAnnouncements(announcementsData.announcements || []);
        }
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      addLog("error", `Sökning misslyckades för ${company.name}: ${error}`);
      setCompanies(prev => prev.map(c =>
        c.orgNumber === company.orgNumber ? { ...c, status: "error" as const } : c
      ));
    } finally {
      setActiveSearches(prev => prev.filter(s => s.id !== searchId));
      setIsSearching(false);
    }
  }, [isSearching, addLog]);

  // Queue unsearched companies
  const queueUnsearched = useCallback(() => {
    const unsearched = companies
      .filter(c => c.lastSearched === null)
      .map(c => c.orgNumber);
    setQueue(unsearched);
    addLog("info", `Köade ${unsearched.length} osökta bolag`);
  }, [companies, addLog]);

  // Process queue
  const processQueue = useCallback(async () => {
    if (queue.length === 0 || isPaused) return;

    const batch = queue.slice(0, parallelCount);
    const remaining = queue.slice(parallelCount);
    setQueue(remaining);

    await Promise.all(batch.map(async (orgNumber) => {
      const company = companies.find(c => c.orgNumber === orgNumber);
      if (company) {
        await searchCompany(company);
      }
    }));

    if (remaining.length > 0 && !isPaused) {
      setTimeout(() => processQueue(), 1000);
    } else if (remaining.length === 0) {
      addLog("success", "Alla sökningar klara!");
    }
  }, [queue, isPaused, parallelCount, companies, searchCompany, addLog]);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Filter companies
  const filteredCompanies = companies.filter(c => {
    // Text filter
    if (searchFilter) {
      const query = searchFilter.toLowerCase();
      if (!c.name.toLowerCase().includes(query) && !c.orgNumber.includes(query)) {
        return false;
      }
    }
    // Category filter
    switch (categoryFilter) {
      case "unsearched":
        return c.lastSearched === null;
      case "with":
        return c.resultCount > 0;
      case "without":
        return c.lastSearched !== null && c.resultCount === 0;
      default:
        return true;
    }
  });

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f] text-[#f0f0f0] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Bolagshändelser</h1>
          <div className="px-3 py-1 bg-[#2a2a2a] rounded-full text-sm text-[#888]">
            {stats.searchedCount}/{stats.totalCompanies} sökta · {stats.withResults} med · {stats.totalAnnouncements} totalt
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Terminal */}
      <Terminal
        logs={logs}
        isActive={isSearching || queue.length > 0}
        isPaused={isPaused}
        progress={activeSearches.length > 0 ? (activeSearches[0]?.progress || 0) : 0}
        onPause={() => setIsPaused(!isPaused)}
        onClear={clearLogs}
      />

      {/* Action Bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <input
          type="text"
          placeholder="Sök företag eller org.nr..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="flex-1 max-w-md px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm focus:outline-none focus:border-[#6366f1]"
        />
        <button
          onClick={() => selectedCompany && searchCompany(selectedCompany)}
          disabled={!selectedCompany || isSearching}
          className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          Sök
        </button>
        <button
          onClick={queueUnsearched}
          disabled={isSearching}
          className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
        >
          Köa osökta
        </button>
        {queue.length > 0 && (
          <button
            onClick={() => setQueue([])}
            className="px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] rounded-lg text-sm font-medium transition-colors"
          >
            Avbryt
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Company List */}
        <div className="w-[300px] flex flex-col border-r border-[#2a2a2a]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
            <span className="text-sm font-medium text-[#888]">Bolag</span>
            <div className="flex gap-1">
              {(["all", "unsearched", "with", "without"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCategoryFilter(filter)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    categoryFilter === filter
                      ? "bg-[#6366f1] text-white"
                      : "bg-[#2a2a2a] text-[#888] hover:bg-[#3a3a3a]"
                  }`}
                >
                  {filter === "all" ? "Alla" : filter === "unsearched" ? "Ej" : filter === "with" ? "Med" : "Utan"}
                </button>
              ))}
            </div>
          </div>
          <CompanyList
            companies={filteredCompanies}
            selectedCompany={selectedCompany}
            onSelect={setSelectedCompany}
          />
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ResultsPanel
            company={selectedCompany}
            announcements={announcements}
            onSelectAnnouncement={setSelectedAnnouncement}
          />
        </div>
      </div>

      {/* Queue Status (Fixed bottom right) */}
      {queue.length > 0 && (
        <QueueStatus
          count={queue.length}
          parallelCount={parallelCount}
          onParallelChange={setParallelCount}
          onStart={processQueue}
          onClear={() => setQueue([])}
        />
      )}

      {/* Active Searches */}
      {activeSearches.length > 0 && (
        <ActiveSearches searches={activeSearches} />
      )}

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <DetailModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          parallelCount={parallelCount}
          onParallelChange={setParallelCount}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
