"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  History,
  Rocket,
  UserCircle,
  Building2,
  GitMerge,
  TrendingUp,
  FileText,
  Flag,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { CompanyData, Merger, CompanyAnnouncement, AnnualReport } from "@/lib/bolag";

interface HistoryTimelineProps {
  data: CompanyData;
}

type EventType = "founding" | "ceo" | "name" | "merger" | "financial" | "announcement" | "status";

interface TimelineEvent {
  id: string;
  date: string;
  sortDate: Date;
  type: EventType;
  title: string;
  description?: string;
  isKeyEvent?: boolean;
  link?: {
    href: string;
    label: string;
  };
}

export function HistoryTimeline({ data }: HistoryTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Key event types that should always be shown in compact view
  const keyEventTypes: EventType[] = ["founding", "merger", "status", "financial"];
  const MAX_COMPACT_EVENTS = 4;

  const events = useMemo(() => {
    const allEvents: TimelineEvent[] = [];

    // Founding event
    const foundingDate = data.basic.foundationDate || data.basic.registrationDate;
    if (foundingDate) {
      allEvents.push({
        id: "founding",
        date: formatDate(foundingDate),
        sortDate: new Date(foundingDate),
        type: "founding",
        title: "Bolaget grundades",
        description: data.basic.companyType?.name
          ? `Registrerades som ${data.basic.companyType.name}`
          : undefined,
      });
    } else if (data.basic.foundationYear) {
      allEvents.push({
        id: "founding",
        date: data.basic.foundationYear,
        sortDate: new Date(`${data.basic.foundationYear}-01-01`),
        type: "founding",
        title: "Bolaget grundades",
        description: data.basic.companyType?.name
          ? `Registrerades som ${data.basic.companyType.name}`
          : undefined,
      });
    }

    // Alternative names (name changes)
    if (data.alternativeNames && data.alternativeNames.length > 0) {
      data.alternativeNames.forEach((name, i) => {
        allEvents.push({
          id: `name-${i}`,
          date: "Tidigare",
          sortDate: new Date(1900 + i, 0, 1), // Approximate ordering
          type: "name",
          title: "Tidigare firmanamn",
          description: name,
        });
      });
    }

    // Mergers
    if (data.mergers && data.mergers.length > 0) {
      data.mergers.forEach((merger, i) => {
        allEvents.push({
          id: `merger-${i}`,
          date: formatDate(merger.date),
          sortDate: new Date(merger.date),
          type: "merger",
          title: getMergerTitle(merger.type),
          description: merger.otherCompanyName
            ? `${merger.description || ""} ${merger.otherCompanyName}`.trim()
            : merger.description,
          link: merger.otherCompanyOrgNr
            ? {
                href: `/company/${merger.otherCompanyOrgNr}`,
                label: merger.otherCompanyName || "Se bolag",
              }
            : undefined,
        });
      });
    }

    // Announcements - include all when expanded, only important ones in compact view
    if (data.announcements && data.announcements.length > 0) {
      // Filter out irrelevant announcements first
      const relevantAnnouncements = data.announcements.filter((a) => isRelevantAnnouncement(a));

      // Add important announcements (always included)
      const importantAnnouncements = relevantAnnouncements.filter((a) => isImportantAnnouncement(a));

      importantAnnouncements.forEach((announcement, i) => {
        allEvents.push({
          id: `announcement-important-${i}`,
          date: formatDate(announcement.date),
          sortDate: new Date(announcement.date),
          type: "announcement",
          title: formatAnnouncementTitle(announcement.type),
          description: formatAnnouncementText(announcement.text),
          isKeyEvent: true,
        });
      });

      // Add other announcements (only shown when expanded)
      const otherAnnouncements = relevantAnnouncements.filter((a) => !isImportantAnnouncement(a));

      otherAnnouncements.forEach((announcement, i) => {
        allEvents.push({
          id: `announcement-other-${i}`,
          date: formatDate(announcement.date),
          sortDate: new Date(announcement.date),
          type: "announcement",
          title: formatAnnouncementTitle(announcement.type),
          description: formatAnnouncementText(announcement.text),
          isKeyEvent: false,
        });
      });
    }

    // Status remarks (bankruptcies, liquidations, etc)
    if (data.statusRemarks && data.statusRemarks.length > 0) {
      data.statusRemarks.forEach((remark, i) => {
        // Skip irrelevant status remarks
        const codeLC = (remark.code || "").toLowerCase();
        const descLC = (remark.description || "").toLowerCase();

        // Skip contact/address related changes
        if (
          codeLC.includes("contact") ||
          codeLC.includes("address") ||
          codeLC.includes("phone") ||
          codeLC.includes("email") ||
          descLC.includes("telefon") ||
          descLC.includes("adress")
        ) {
          return;
        }

        allEvents.push({
          id: `status-${i}`,
          date: formatDate(remark.date),
          sortDate: new Date(remark.date),
          type: "status",
          title: formatStatusCode(remark.code),
          description: remark.description,
        });
      });
    }

    // Financial milestones from annual reports
    if (data.financials?.annualReports && data.financials.annualReports.length > 0) {
      const reports = [...data.financials.annualReports].sort((a, b) => a.year - b.year);

      // Find first profitable year
      const firstProfitable = reports.find((r) => {
        const profit = r.accounts.find((a) => a.code === "DR" || a.code === "ROR");
        return profit && profit.amount && profit.amount > 0;
      });

      if (firstProfitable) {
        allEvents.push({
          id: "first-profit",
          date: String(firstProfitable.year),
          sortDate: new Date(firstProfitable.year, 11, 31),
          type: "financial",
          title: "Första lönsamma året",
          description: `Bolaget redovisade positivt resultat för första gången`,
        });
      }

      // Find revenue milestones
      const revenueBreaks = [1000000, 10000000, 100000000, 1000000000]; // 1M, 10M, 100M, 1B

      revenueBreaks.forEach((milestone) => {
        const firstOver = reports.find((r) => {
          const revenue = r.accounts.find((a) => a.code === "SDI" || a.code === "NOS");
          return revenue && revenue.amount && revenue.amount >= milestone;
        });

        if (firstOver) {
          const label = milestone >= 1000000000
            ? `${milestone / 1000000000} miljard`
            : `${milestone / 1000000} miljoner`;

          allEvents.push({
            id: `revenue-${milestone}`,
            date: String(firstOver.year),
            sortDate: new Date(firstOver.year, 6, 1),
            type: "financial",
            title: `Omsättning passerade ${label} kr`,
            description: `Bolaget nådde en omsättning på över ${label} kronor`,
          });
        }
      });
    }

    // Sort by date (newest first)
    return allEvents.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
  }, [data]);

  // Filter events for compact view
  const visibleEvents = useMemo(() => {
    if (isExpanded) {
      return events;
    }

    // In compact view, prioritize key event types and limit count
    const keyEvents = events.filter(
      (e) => keyEventTypes.includes(e.type) || e.isKeyEvent
    );

    // If we have enough key events, show those
    if (keyEvents.length >= MAX_COMPACT_EVENTS) {
      return keyEvents.slice(0, MAX_COMPACT_EVENTS);
    }

    // Otherwise, show what we have up to the limit
    return events.slice(0, MAX_COMPACT_EVENTS);
  }, [events, isExpanded]);

  const hiddenCount = events.length - visibleEvents.length;

  if (events.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-title flex items-center gap-2">
            <History className="h-5 w-5 text-purple-500" />
            Bolagshistorik
          </CardTitle>
          <span className="text-xs text-gray-500">
            {events.length} händelser
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="history-timeline">
          <div className="history-timeline-line" aria-hidden="true" />

          {visibleEvents.map((event, index) => (
            <div
              key={event.id}
              className="history-timeline-item"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={`history-timeline-dot history-timeline-dot-${event.type}`} aria-hidden="true" />

              <div className="history-timeline-content">
                <div className="history-timeline-date">{event.date}</div>
                <div className="history-timeline-title">{event.title}</div>
                {event.description && (
                  <div className="history-timeline-description">{event.description}</div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className={`history-timeline-badge history-timeline-badge-${event.type}`}>
                    {getEventIcon(event.type)}
                    {getEventLabel(event.type)}
                  </span>

                  {event.link && (
                    <Link
                      href={event.link.href}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {event.link.label} &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expand/Collapse button */}
        {events.length > MAX_COMPACT_EVENTS && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Visa mindre
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Expandera ({hiddenCount} fler händelser)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getMergerTitle(type: string): string {
  const typeLC = type?.toLowerCase() || "";

  if (typeLC.includes("fusion")) return "Fusion";
  if (typeLC.includes("delning")) return "Bolagsdelning";
  if (typeLC.includes("forvärv") || typeLC.includes("forvarv")) return "Förvärv";
  if (typeLC.includes("avyttring")) return "Avyttring";

  return type || "Strukturförändring";
}

function formatAnnouncementTitle(type: string | undefined): string {
  if (!type) return "Kungörelse";

  // Map common technical types to readable Swedish
  const typeMap: Record<string, string> = {
    "konkurs": "Konkurs",
    "likvidation": "Likvidation",
    "fusion": "Fusion",
    "nyemission": "Nyemission",
    "aktiekapital": "Ändring av aktiekapital",
    "styrelse": "Styrelseändring",
    "verkställande direktör": "Ny VD",
    "stadgeändring": "Stadgeändring",
    "firmaändring": "Namnändring",
    "rekonstruktion": "Företagsrekonstruktion",
    "avregistrering": "Avregistrering",
  };

  const typeLC = type.toLowerCase();

  // Check for matches in typeMap
  for (const [key, value] of Object.entries(typeMap)) {
    if (typeLC.includes(key)) return value;
  }

  // If it looks like a technical code, return generic title
  if (/^[A-Z_]+$/.test(type) || type.includes("_")) {
    return "Kungörelse";
  }

  // Capitalize first letter of the type
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

function formatAnnouncementText(text: string | undefined): string | undefined {
  if (!text) return undefined;

  // Remove technical prefixes/suffixes
  const cleaned = text
    .replace(/^(KUNGÖRELSE|ANNOUNCEMENT|UPDATE|CHANGE)[:\s]*/i, "")
    .replace(/\s*(KUNGÖRELSE|ANNOUNCEMENT)$/i, "")
    .trim();

  // If the text is too short or looks like a technical code, skip it
  if (cleaned.length < 5 || /^[A-Z_]+$/.test(cleaned)) {
    return undefined;
  }

  return cleaned;
}

function formatStatusCode(code: string | undefined): string {
  if (!code) return "Statusändring";

  // Map common status codes to readable Swedish
  const codeMap: Record<string, string> = {
    "konkurs": "Konkurs",
    "likvidation": "Likvidation",
    "avregistrerad": "Avregistrerad",
    "rekonstruktion": "Företagsrekonstruktion",
    "vilande": "Vilande bolag",
    "aktiv": "Aktivt bolag",
    "fusionerad": "Fusionerat",
  };

  const codeLC = code.toLowerCase();

  for (const [key, value] of Object.entries(codeMap)) {
    if (codeLC.includes(key)) return value;
  }

  // If it looks like a technical code, return generic title
  if (/^[A-Z_]+$/.test(code) || code.includes("_")) {
    return "Statusändring";
  }

  return code;
}

function isRelevantAnnouncement(announcement: CompanyAnnouncement): boolean {
  const text = (announcement.text || "").toLowerCase();
  const type = (announcement.type || "").toLowerCase();

  // Skip technical/irrelevant announcements (raw API codes)
  const irrelevantPatterns = [
    "contact_phone",
    "contact_email",
    "contact_fax",
    "contact_",
    "telefonnummer",
    "faxnummer",
    "e-postadress",
    "email",
    "address_",
    "adress",
    "ändring av telefon",
    "ändring av adress",
    "ändring av fax",
    "change_",
    "update_",
    "_update",
    "_change",
  ];

  const combined = `${type} ${text}`;
  const isIrrelevant = irrelevantPatterns.some((pattern) => combined.includes(pattern));

  if (isIrrelevant) return false;

  // Skip if type looks like a technical code (all uppercase with underscores)
  if (/^[A-Z_]+$/.test(announcement.type || "")) return false;

  return true;
}

function isImportantAnnouncement(announcement: CompanyAnnouncement): boolean {
  // First check if it's even relevant
  if (!isRelevantAnnouncement(announcement)) return false;

  const text = (announcement.text || "").toLowerCase();
  const type = (announcement.type || "").toLowerCase();

  // Filter for important announcements
  const importantKeywords = [
    "konkurs",
    "likvidation",
    "fusion",
    "delning",
    "nyemission",
    "aktiekapital",
    "stadgeändring",
    "firmaändring",
    "byte av styrelse",
    "verkställande",
    "likvidator",
    "rekonstruktion",
    "avregistrering",
  ];

  return importantKeywords.some((kw) => text.includes(kw) || type.includes(kw));
}

function getEventIcon(type: EventType): React.ReactNode {
  const iconClass = "h-3 w-3";

  switch (type) {
    case "founding":
      return <Rocket className={iconClass} />;
    case "ceo":
      return <UserCircle className={iconClass} />;
    case "name":
      return <FileText className={iconClass} />;
    case "merger":
      return <GitMerge className={iconClass} />;
    case "financial":
      return <TrendingUp className={iconClass} />;
    case "announcement":
      return <Flag className={iconClass} />;
    case "status":
      return <AlertTriangle className={iconClass} />;
    default:
      return <Building2 className={iconClass} />;
  }
}

function getEventLabel(type: EventType): string {
  switch (type) {
    case "founding":
      return "Grundande";
    case "ceo":
      return "Ledning";
    case "name":
      return "Namnändring";
    case "merger":
      return "Strukturförändring";
    case "financial":
      return "Milstolpe";
    case "announcement":
      return "Kungörelse";
    case "status":
      return "Status";
    default:
      return "Händelse";
  }
}
