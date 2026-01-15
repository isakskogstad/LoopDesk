"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Scale, ChevronDown } from "lucide-react";

interface BolagsverketReport {
  year: number;
  dokumentId: string;
  period: string;
}

interface StorageReport {
  name: string;
  year: number | null;
  url: string;
  size: number | null;
  createdAt: string;
}

interface Announcement {
  date: string;
  text: string;
  type?: string;
}

interface DocumentsSectionProps {
  orgNr: string;
  announcements?: Announcement[];
}

export function DocumentsSection({ orgNr, announcements = [] }: DocumentsSectionProps) {
  const [bolagsverketReports, setBolagsverketReports] = useState<BolagsverketReport[]>([]);
  const [storageReports, setStorageReports] = useState<StorageReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);

      // Fetch from Bolagsverket API
      try {
        const response = await fetch(`/api/bolag/annual-reports?orgNr=${encodeURIComponent(orgNr)}`);
        const data = await response.json();
        if (response.ok && Array.isArray(data.reports) && data.reports.length > 0) {
          const mapped = data.reports
            .map((r: { dokumentId: string; year: number | null; period: string }) => ({
              year: r.year ?? parseInt(r.period?.slice(0, 4) || "", 10),
              dokumentId: r.dokumentId,
              period: r.period,
            }))
            .filter((r: { year: number }) => r.year)
            .sort((a: { year: number }, b: { year: number }) => b.year - a.year);
          setBolagsverketReports(mapped);
        }
      } catch {
        // Continue
      }

      // Fetch from Supabase Storage
      try {
        const response = await fetch(`/api/bolag/annual-reports/storage?orgNr=${encodeURIComponent(orgNr)}`);
        const data = await response.json();
        if (response.ok && Array.isArray(data.reports) && data.reports.length > 0) {
          setStorageReports(data.reports);
        }
      } catch {
        // Continue
      }

      setIsLoading(false);
    };

    fetchReports();
  }, [orgNr]);

  // Filter out irrelevant announcements
  const filteredAnnouncements = announcements.filter((ann) => {
    const text = (ann.text || "").toLowerCase();
    const irrelevantPatterns = ["telefonnummer", "telefon", "faxnummer", "fax", "e-postadress", "e-post", "email", "adress", "address", "kontaktuppgift"];
    return !irrelevantPatterns.some((pattern) => text.includes(pattern));
  });

  // Merge and deduplicate reports
  const storageYears = new Set(storageReports.map(r => r.year));
  const uniqueBolagsverketReports = bolagsverketReports.filter(r => !storageYears.has(r.year));
  const hasAnyReports = storageReports.length > 0 || uniqueBolagsverketReports.length > 0;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Årsredovisningar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Scale className="h-5 w-5 text-muted-foreground" />
              Årsredovisningar
            </h3>
            {storageReports.length > 0 && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <FileText className="h-3 w-3 mr-1" />
                Digitala kopior
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-12 bg-secondary rounded-lg" />
              ))}
            </div>
          ) : !hasAnyReports ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Inga årsredovisningar tillgängliga
            </p>
          ) : (
            <div className="divide-y divide-border">
              {/* Storage reports (prioritized) */}
              {storageReports.map((report) => {
                const isXhtml = report.name.endsWith('.xhtml') || report.name.endsWith('.html');
                return (
                  <div
                    key={report.name}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">Årsredovisning {report.year}</p>
                        <p className="text-xs text-muted-foreground">
                          {isXhtml ? "Interaktiv XHTML" : "PDF"} • Sparad kopia
                        </p>
                      </div>
                    </div>
                    <a
                      href={report.url}
                      target={isXhtml ? undefined : "_blank"}
                      rel={isXhtml ? undefined : "noopener noreferrer"}
                      className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {isXhtml ? "Öppna" : "Ladda ner"}
                      {isXhtml ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    </a>
                  </div>
                );
              })}

              {/* Bolagsverket reports */}
              {uniqueBolagsverketReports.map((report) => (
                <div
                  key={report.dokumentId}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Årsredovisning {report.year}</p>
                      <p className="text-xs text-muted-foreground">PDF • Bolagsverket</p>
                    </div>
                  </div>
                  <a
                    href={`/api/bolag/annual-reports/${encodeURIComponent(report.dokumentId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Ladda ner
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kungörelser */}
      {filteredAnnouncements.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Kungörelser</h3>
              <Badge variant="secondary">{filteredAnnouncements.length} st</Badge>
            </div>

            <div className="divide-y divide-border">
              {filteredAnnouncements
                .slice(0, showAllAnnouncements ? undefined : 5)
                .map((ann, idx) => (
                  <div key={`${ann.date}-${idx}`} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-xs text-muted-foreground mb-1">{formatDate(ann.date)}</p>
                    <p className="text-sm">{ann.text}</p>
                  </div>
                ))}
            </div>

            {filteredAnnouncements.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4"
                onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
              >
                <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showAllAnnouncements ? "rotate-180" : ""}`} />
                {showAllAnnouncements ? "Visa färre" : `Visa alla ${filteredAnnouncements.length} kungörelser`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
