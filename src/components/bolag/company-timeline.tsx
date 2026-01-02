"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanyData } from "@/lib/bolag";

interface TimelineEvent {
  date: string;
  year: number;
  type: "foundation" | "name_change" | "merger" | "announcement" | "annual_report";
  title: string;
  description?: string;
}

interface CompanyTimelineProps {
  data: CompanyData;
}

export function CompanyTimeline({ data }: CompanyTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const events: TimelineEvent[] = [];

  // Add foundation
  if (data.basic.foundationYear) {
    events.push({
      date: data.basic.foundationDate || data.basic.foundationYear,
      year: parseInt(data.basic.foundationYear),
      type: "foundation",
      title: "Företaget grundas",
      description: data.basic.name,
    });
  }

  // Add name changes from alternative names (if we have announcements with NAME type)
  if (data.announcements) {
    data.announcements
      .filter((ann) => ann.type === "NAME")
      .forEach((ann) => {
        const year = parseInt(ann.date.split(".")[2] || ann.date.split("-")[0]);
        events.push({
          date: ann.date,
          year: year || 2000,
          type: "name_change",
          title: "Namnändring",
          description: ann.text,
        });
      });
  }

  // Add mergers
  if (data.mergers) {
    data.mergers.forEach((merger) => {
      const year = parseInt(merger.date.split("-")[0] || merger.date.split(".")[2]);
      events.push({
        date: merger.date,
        year: year || 2000,
        type: "merger",
        title: merger.type,
        description: merger.otherCompanyName,
      });
    });
  }

  // Add significant announcements
  if (data.announcements) {
    const significantTypes = ["REGISTERED_ANNUAL_REPORT", "SIGNATORY", "DOMICILE"];
    data.announcements
      .filter((ann) => significantTypes.includes(ann.type))
      .slice(0, 5)
      .forEach((ann) => {
        const year = parseInt(ann.date.split(".")[2] || ann.date.split("-")[0]);
        events.push({
          date: ann.date,
          year: year || 2000,
          type: "announcement",
          title: ann.text,
          description: formatAnnouncementType(ann.type),
        });
      });
  }

  // Add annual reports
  if (data.financials?.annualReports) {
    data.financials.annualReports.slice(0, 3).forEach((report) => {
      events.push({
        date: report.periodEnd,
        year: report.year,
        type: "annual_report",
        title: `Bokslut ${report.year}`,
        description: getReportSummary(report),
      });
    });
  }

  // Sort by date descending
  events.sort((a, b) => b.year - a.year);

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tidslinje</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ingen tidslinjedata tillgänglig för detta företag.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxEvents = 8;
  const visibleEvents = showAll ? events : events.slice(0, maxEvents);
  let lastYear: number | null = null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tidslinje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-secondary dark:bg-gray-700" />

          <div className="space-y-6">
            {visibleEvents.map((event, eventIndex) => {
              const showYear = event.year !== lastYear;
              lastYear = event.year;
              const eventKey = `${event.type}-${event.date}-${eventIndex}`;

              return (
              <div key={eventKey} className="relative pl-10">
                {showYear && (
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    {event.year}
                  </div>
                )}
                {/* Dot */}
                <div
                  className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${getEventColor(event.type)}`}
                />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatDate(event.date)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getEventLabel(event.type)}
                    </Badge>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {events.length > maxEvents && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showAll ? "Visa färre" : `Visa ${events.length - maxEvents} fler`}
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(date: string): string {
  // Handle both DD.MM.YYYY and YYYY-MM-DD formats
  if (date.includes(".")) {
    return date;
  }
  const parts = date.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return date;
}

function formatAnnouncementType(type: string): string {
  const types: Record<string, string> = {
    REGISTERED_ANNUAL_REPORT: "Årsredovisning registrerad",
    SIGNATORY: "Firmateckning ändrad",
    DOMICILE: "Säte ändrat",
    NAME: "Namnändring",
    CONTACT_ADDRESS: "Adressändring",
  };
  return types[type] || type;
}

function getEventColor(type: TimelineEvent["type"]): string {
  switch (type) {
    case "foundation":
      return "bg-green-500";
    case "name_change":
      return "bg-blue-500";
    case "merger":
      return "bg-purple-500";
    case "annual_report":
      return "bg-muted-foreground/50";
    default:
      return "bg-muted-foreground/40";
  }
}

function getEventLabel(type: TimelineEvent["type"]): string {
  switch (type) {
    case "foundation":
      return "Grundat";
    case "name_change":
      return "Namn";
    case "merger":
      return "Fusion";
    case "annual_report":
      return "Bokslut";
    default:
      return "Händelse";
  }
}

function getReportSummary(report: { accounts: { code: string; amount: number | null }[] }): string {
  const revenue = report.accounts.find((a) => a.code === "SDI")?.amount;
  const result = report.accounts.find((a) => a.code === "DR")?.amount;

  const parts: string[] = [];
  if (revenue) parts.push(`Oms: ${(revenue / 1000).toFixed(0)}M`);
  if (result) parts.push(`Res: ${(result / 1000).toFixed(0)}M`);

  return parts.join(", ") || "Bokslut";
}
