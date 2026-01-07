"use client";

import { useState, useCallback, useRef } from "react";
import { FileSearch, Search, Activity, ExternalLink, Loader2, FileText, Download, Building2 } from "lucide-react";
import { ToolPanel, ToolTabs, LogPanel, ProgressBar, StatusBadge } from "../shared";
import type { ToolTab, LogEntry, ToolStatus } from "../shared/types";
import { formatOrgNr } from "@/lib/utils";

interface BolagsverketToolProps {
  onClose: () => void;
}

interface CompanyData {
  basic: {
    orgNr: string;
    name: string;
    companyType?: { code: string; name: string };
    status?: { active: boolean; status: string; statusDate?: string };
    registrationDate?: string;
    purpose?: string;
  };
  postalAddress?: {
    street?: string;
    coAddress?: string;
    zipCode?: string;
    city?: string;
    country?: string;
  };
  industries?: Array<{ code: string; name: string }>;
  flags?: {
    marketingProtection?: boolean;
  };
  sources?: {
    bolagsverket?: boolean;
  };
}

interface AnnualReport {
  dokumentId: string;
  period: string;
  date: string;
  year: number | null;
}

const TABS: ToolTab[] = [
  { id: "search", label: "Sök", icon: <Search className="w-3.5 h-3.5" /> },
  { id: "reports", label: "Årsredovisningar", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "status", label: "Status", icon: <Activity className="w-3.5 h-3.5" /> },
];

export function BolagsverketTool({ onClose }: BolagsverketToolProps) {
  const [activeTab, setActiveTab] = useState("search");
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [orgNr, setOrgNr] = useState("");
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [reports, setReports] = useState<AnnualReport[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{ orgNr: string; name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    const entry: LogEntry = {
      id: `log-${++logIdRef.current}`,
      timestamp: new Date(),
      message,
      type,
    };
    setLogs((prev) => [...prev.slice(-99), entry]);
    return entry;
  }, []);

  const cleanOrgNr = (input: string) => {
    return input.replace(/[^0-9]/g, "");
  };

  const handleSearch = async () => {
    const cleaned = cleanOrgNr(orgNr);
    if (cleaned.length < 10) {
      addLog("Ange ett giltigt organisationsnummer (10 siffror)", "warning");
      return;
    }

    setIsSearching(true);
    setStatus("running");
    setProgress(10);
    setCompanyData(null);
    setReports([]);
    addLog(`Söker i Bolagsverket för ${formatOrgNr(cleaned)}...`, "info");

    try {
      setProgress(30);
      const response = await fetch(`/api/bolag/company/${cleaned}`);
      setProgress(60);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Företaget hittades inte");
        }
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setProgress(90);

      if (data.basic) {
        setCompanyData(data);
        addLog(`Hittade: ${data.basic.name}`, "success");

        // Add to search history
        setSearchHistory((prev) => {
          const exists = prev.find((h) => h.orgNr === cleaned);
          if (exists) return prev;
          return [{ orgNr: cleaned, name: data.basic.name }, ...prev.slice(0, 9)];
        });

        // Check data source
        if (data.sources?.bolagsverket) {
          addLog("Data från Bolagsverkets officiella API", "info");
        }
      } else {
        addLog("Företaget hittades inte", "warning");
      }

      setProgress(100);
      setStatus("success");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
      setStatus("error");
    }

    setIsSearching(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const loadAnnualReports = async () => {
    if (!companyData?.basic.orgNr) {
      addLog("Sök efter ett företag först", "warning");
      return;
    }

    setIsLoadingReports(true);
    setStatus("running");
    setProgress(20);
    addLog(`Hämtar årsredovisningar för ${companyData.basic.name}...`, "info");

    try {
      setProgress(50);
      const response = await fetch(`/api/bolag/annual-reports?orgNr=${companyData.basic.orgNr}`);
      setProgress(80);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setProgress(95);

      if (data.reports && data.reports.length > 0) {
        setReports(data.reports);
        addLog(`Hittade ${data.reports.length} årsredovisningar`, "success");
      } else {
        addLog("Inga årsredovisningar hittades", "warning");
      }

      setProgress(100);
      setStatus("success");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
      setStatus("error");
    }

    setIsLoadingReports(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const downloadReport = async (report: AnnualReport) => {
    addLog(`Laddar ner årsredovisning ${report.year || report.period}...`, "info");

    try {
      const response = await fetch(`/api/bolag/annual-reports/${report.dokumentId}`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `arsredovisning-${companyData?.basic.orgNr}-${report.year || report.period}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addLog(`Nedladdning startad för ${report.year || report.period}`, "success");
    } catch (error) {
      addLog(`Fel vid nedladdning: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("sv-SE");
    } catch {
      return dateStr;
    }
  };

  return (
    <ToolPanel
      tool="bolagsverket"
      title="Bolagsverket API"
      icon={<FileSearch className="w-5 h-5" />}
      isOpen={true}
      onClose={onClose}
    >
      <ToolTabs
        tool="bolagsverket"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="tool-content space-y-4">
        {activeTab === "search" && (
          <>
            {/* Search input */}
            <div className="space-y-3">
              <label className="text-label">Organisationsnummer</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="XXXXXX-XXXX"
                  value={orgNr}
                  onChange={(e) => setOrgNr(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn-primary px-4"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Hämtar officiella uppgifter från Bolagsverkets API.
              </p>
            </div>

            {/* Status and progress */}
            <div className="flex items-center justify-between">
              <StatusBadge status={status} />
              {progress > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
                  {progress}%
                </span>
              )}
            </div>

            {progress > 0 && (
              <ProgressBar tool="bolagsverket" progress={progress} />
            )}

            {/* Company data */}
            {companyData && (
              <div className="space-y-3">
                <label className="text-label">Bolagsuppgifter</label>
                <div className="p-4 rounded-lg border border-border bg-secondary/50 space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Building2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{companyData.basic.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {formatOrgNr(companyData.basic.orgNr)}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  {companyData.basic.status && (
                    <div className={`text-sm ${
                      companyData.basic.status.active
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                      {companyData.basic.status.status}
                      {companyData.basic.status.statusDate && (
                        <span className="text-muted-foreground ml-2">
                          ({formatDate(companyData.basic.status.statusDate)})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {companyData.basic.companyType && (
                      <div>
                        <span className="text-muted-foreground">Bolagsform:</span>{" "}
                        {companyData.basic.companyType.name}
                      </div>
                    )}
                    {companyData.basic.registrationDate && (
                      <div>
                        <span className="text-muted-foreground">Registrerat:</span>{" "}
                        {formatDate(companyData.basic.registrationDate)}
                      </div>
                    )}
                  </div>

                  {/* Purpose */}
                  {companyData.basic.purpose && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Verksamhetsbeskrivning</div>
                      <p className="text-sm line-clamp-3">{companyData.basic.purpose}</p>
                    </div>
                  )}

                  {/* Address */}
                  {companyData.postalAddress && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Adress</div>
                      <div className="text-sm">
                        {companyData.postalAddress.street && (
                          <div>{companyData.postalAddress.street}</div>
                        )}
                        {companyData.postalAddress.coAddress && (
                          <div>c/o {companyData.postalAddress.coAddress}</div>
                        )}
                        <div>
                          {companyData.postalAddress.zipCode} {companyData.postalAddress.city}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Industries */}
                  {companyData.industries && companyData.industries.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Näringsgrenar (SNI)
                      </div>
                      <div className="space-y-1">
                        {companyData.industries.slice(0, 3).map((ind, i) => (
                          <div key={i} className="text-sm flex items-baseline gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {ind.code}
                            </span>
                            <span>{ind.name}</span>
                          </div>
                        ))}
                        {companyData.industries.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{companyData.industries.length - 3} fler...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Flags */}
                  {companyData.flags?.marketingProtection && (
                    <div className="text-xs text-amber-500">
                      Reklamsparr aktiverad
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => {
                        setActiveTab("reports");
                        loadAnnualReports();
                      }}
                      className="btn-secondary text-xs gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Årsredovisningar
                    </button>
                    <a
                      href={`https://bolagsverket.se/foretag/sok-foretag-registrerade-hos-bolagsverket`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Bolagsverket.se
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Search history */}
            {searchHistory.length > 0 && !companyData && (
              <div className="space-y-2">
                <label className="text-label text-xs">Senaste sökningar</label>
                <div className="space-y-1">
                  {searchHistory.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setOrgNr(h.orgNr);
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs bg-secondary rounded hover:bg-secondary/80 flex items-center justify-between"
                    >
                      <span className="truncate">{h.name}</span>
                      <span className="font-mono text-muted-foreground">
                        {formatOrgNr(h.orgNr)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "reports" && (
          <>
            {companyData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{companyData.basic.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {formatOrgNr(companyData.basic.orgNr)}
                    </div>
                  </div>
                  <button
                    onClick={loadAnnualReports}
                    disabled={isLoadingReports}
                    className="btn-secondary text-xs gap-1.5"
                  >
                    {isLoadingReports ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    Hämta
                  </button>
                </div>

                {progress > 0 && (
                  <ProgressBar tool="bolagsverket" progress={progress} />
                )}

                {reports.length > 0 ? (
                  <div className="space-y-2">
                    <label className="text-label">Årsredovisningar ({reports.length})</label>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {reports.map((report) => (
                        <div
                          key={report.dokumentId}
                          className="p-3 rounded-lg border border-border bg-secondary/50 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {report.year ? `År ${report.year}` : report.period}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Registrerad: {formatDate(report.date)}
                            </div>
                          </div>
                          <button
                            onClick={() => downloadReport(report)}
                            className="btn-secondary text-xs gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Ladda ner
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Årsredovisningar laddas ned som ZIP-filer med iXBRL-format.
                    </p>
                  </div>
                ) : (
                  <div className="empty-state py-8">
                    <FileText className="empty-state-icon w-10 h-10" />
                    <p className="empty-state-title text-sm">Inga årsredovisningar</p>
                    <p className="empty-state-description text-xs">
                      Klicka på "Hämta" för att ladda årsredovisningar.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state py-8">
                <Building2 className="empty-state-icon w-10 h-10" />
                <p className="empty-state-title text-sm">Inget företag valt</p>
                <p className="empty-state-description text-xs">
                  Sök efter ett företag först för att se årsredovisningar.
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="btn-primary text-xs mt-3"
                >
                  <Search className="w-3.5 h-3.5" />
                  Gå till sök
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "status" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Aktivitetslogg</span>
              <StatusBadge status={status} />
            </div>
            <LogPanel entries={logs} maxHeight={300} />
          </div>
        )}
      </div>
    </ToolPanel>
  );
}
