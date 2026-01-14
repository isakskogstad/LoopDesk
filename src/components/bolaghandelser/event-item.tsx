"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Building2,
  FileText,
  AlertTriangle,
  Users,
  TrendingUp,
  Merge,
  XCircle,
  ChevronRight,
  ChevronDown,
  Newspaper,
  Star,
} from "lucide-react";

// Announcement type from parent
interface Announcement {
  id: string;
  type?: string;
  subject: string;
  orgNumber?: string;
  detailText?: string;
  pubDate?: string;
  publishedAt?: string;
  scrapedAt?: string;
}

// Protocol type from parent
interface Protocol {
  id: number;
  orgNumber: string;
  companyName: string | null;
  protocolDate: string;
  purchaseDate: string;
  pdfUrl: string | null;
  eventType: string | null;
  aiSummary: string | null;
  aiDetails: {
    score?: number;
    severity?: string;
    confidence?: number;
    notis?: { titel?: string; sammanfattning?: string };
    faktaruta?: {
      stämmoDatum?: string;
      tid?: string;
      plats?: string;
      stämmoTyp?: string;
      händelse?: string;
      belopp?: string;
      pris_per_aktie?: string;
      nya_aktier?: string;
      utspädning?: string;
      investerare?: string[];
      personer?: string[];
    };
    signals?: string[];
    källa?: {
      typ?: string;
      bolag?: string;
      datum?: string;
      referens?: string;
    };
    artikel?: string;
    shareholderCount?: number;
    analyzedAt?: string;
  } | null;
}

// Protocol search type (discovered protocols without AI analysis)
interface ProtocolSearch {
  id: number;
  orgNumber: string;
  companyName: string;
  companyId: string;
  latestProtocolDate: string | null;
  protocolCount: number;
  lastSearch: string | null;
  createdAt: string;
}

// Unified event item
type EventData =
  | { type: "announcement"; data: Announcement }
  | { type: "protocol"; data: Protocol }
  | { type: "protocolSearch"; data: ProtocolSearch };

interface EventItemProps {
  event: EventData;
  date: Date;
  isFocused?: boolean;
  showGradientLine?: boolean;
  isUnread?: boolean;
  onMarkAsRead?: () => void;
}

// Important event categories with enhanced visual styling (#2)
const EVENT_CATEGORIES: Record<string, {
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
  label: string;
  icon: React.ReactNode;
  priority: number;
}> = {
  konkurs: {
    keywords: ["konkurs", "konkursbeslut"],
    color: "bg-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-l-red-500",
    gradient: "from-red-500/10 to-transparent",
    label: "Konkurs",
    icon: <XCircle className="w-5 h-5" />,
    priority: 1,
  },
  likvidation: {
    keywords: ["likvidation", "likvidator"],
    color: "bg-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-l-orange-500",
    gradient: "from-orange-500/10 to-transparent",
    label: "Likvidation",
    icon: <AlertTriangle className="w-5 h-5" />,
    priority: 2,
  },
  fusion: {
    keywords: ["fusion", "sammanslagning"],
    color: "bg-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-l-purple-500",
    gradient: "from-purple-500/10 to-transparent",
    label: "Fusion",
    icon: <Merge className="w-5 h-5" />,
    priority: 3,
  },
  emission: {
    keywords: ["nyemission", "fondemission", "riktad emission"],
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-l-blue-500",
    gradient: "from-blue-500/10 to-transparent",
    label: "Emission",
    icon: <TrendingUp className="w-5 h-5" />,
    priority: 4,
  },
  styrelse: {
    keywords: ["styrelse", "ledamot", "ordförande", "vd", "firmatecknare"],
    color: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-l-green-500",
    gradient: "from-green-500/10 to-transparent",
    label: "Styrelse",
    icon: <Users className="w-5 h-5" />,
    priority: 5,
  },
};

// Protocol-specific styling
const PROTOCOL_STYLE = {
  color: "bg-indigo-500",
  bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  borderColor: "border-l-indigo-500",
  gradient: "from-indigo-500/10 to-transparent",
};

// Detect event category with full styling info
function detectCategory(text: string): (typeof EVENT_CATEGORIES)[string] & { category: string } | null {
  const lowerText = text.toLowerCase();
  for (const [key, config] of Object.entries(EVENT_CATEGORIES)) {
    if (config.keywords.some((kw) => lowerText.includes(kw))) {
      return { category: key, ...config };
    }
  }
  return null;
}

// Get company logo URL - try Clearbit first, then local
function getCompanyLogoUrl(orgNumber: string | undefined, companyName: string | undefined): string | null {
  if (!orgNumber && !companyName) return null;

  // Try to guess company domain from name for Clearbit
  if (companyName) {
    const cleanName = companyName
      .toLowerCase()
      .replace(/\s*(ab|aktiebolag|hb|kb|ek\.\s*för\.?|handelsbolag)\s*$/gi, "")
      .replace(/[^a-zåäö0-9]/gi, "")
      .trim();

    if (cleanName.length > 2) {
      // Try Swedish .se domain first
      return `https://logo.clearbit.com/${cleanName}.se`;
    }
  }

  // Fallback to local logo
  if (orgNumber) {
    const digits = orgNumber.replace(/\D/g, "");
    if (digits.length >= 10) {
      return `/logos/${digits}.png`;
    }
  }

  return null;
}

// Format time with optional day indicator
function formatTimeWithDay(date: Date): { time: string; day?: string } {
  const now = new Date();
  const time = date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });

  if (date.toDateString() === now.toDateString()) {
    return { time };
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return { time, day: "Igår" };
  }

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date > weekAgo) {
    const dayName = date.toLocaleDateString("sv-SE", { weekday: "short" });
    return { time, day: dayName.charAt(0).toUpperCase() + dayName.slice(1) };
  }

  return { time, day: date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) };
}

// Generate intelligent title based on event type
function generateTitle(event: EventData): string {
  if (event.type === "protocol") {
    const p = event.data;
    const companyName = p.companyName || "Okänt bolag";

    // Use AI-generated title if available
    if (p.aiDetails?.notis?.titel) {
      return p.aiDetails.notis.titel;
    }

    const meetingType = p.aiDetails?.faktaruta?.stämmoTyp;
    if (meetingType) {
      return `${meetingType} i ${companyName}`;
    }

    return `Protokoll från ${companyName}`;
  }

  if (event.type === "protocolSearch") {
    const ps = event.data;
    return `Nytt stämmoprotokoll från ${ps.companyName}`;
  }

  // Announcement
  const a = event.data;
  const companyName = a.subject || "Okänt bolag";
  const text = `${a.type || ""} ${a.detailText || ""}`.toLowerCase();

  // Check for specific event types
  if (text.includes("konkurs")) {
    return `Konkurs i ${companyName}`;
  }
  if (text.includes("likvidation")) {
    return `Likvidation av ${companyName}`;
  }
  if (text.includes("fusion")) {
    return `Fusion: ${companyName}`;
  }
  if (text.includes("nyemission") || text.includes("fondemission")) {
    return `Emission i ${companyName}`;
  }
  if (text.includes("styrelse") || text.includes("ledamot") || text.includes("vd")) {
    return `Styrelseändring i ${companyName}`;
  }
  if (text.includes("firmatecknare")) {
    return `Ändring av firmatecknare i ${companyName}`;
  }
  if (text.includes("revisor")) {
    return `Revisorsbyte i ${companyName}`;
  }
  if (text.includes("bolagsordning")) {
    return `Ny bolagsordning för ${companyName}`;
  }
  if (text.includes("aktiekapital")) {
    return `Ändrat aktiekapital i ${companyName}`;
  }
  if (text.includes("adress") || text.includes("säte")) {
    return `Adressändring för ${companyName}`;
  }

  return `Registrering: ${companyName}`;
}

// Generate summary text
function generateSummary(event: EventData): string {
  if (event.type === "protocol") {
    const p = event.data;

    // Use AI-generated summary if available
    if (p.aiDetails?.notis?.sammanfattning) {
      return p.aiDetails.notis.sammanfattning;
    }

    if (p.aiSummary) {
      return p.aiSummary;
    }

    const parts: string[] = [];
    if (p.aiDetails?.faktaruta?.stämmoTyp) {
      parts.push(p.aiDetails.faktaruta.stämmoTyp);
    }
    if (p.aiDetails?.faktaruta?.stämmoDatum) {
      const date = new Date(p.aiDetails.faktaruta.stämmoDatum);
      parts.push(`den ${date.toLocaleDateString("sv-SE", { day: "numeric", month: "long" })}`);
    }

    if (parts.length > 0) {
      return `${parts.join(" ")} inlämnad till Bolagsverket.`;
    }

    return "Protokoll har lämnats in till Bolagsverket.";
  }

  if (event.type === "protocolSearch") {
    const ps = event.data;
    if (ps.latestProtocolDate) {
      const date = new Date(ps.latestProtocolDate);
      const formattedDate = date.toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return `Ett nytt protokoll har registrerats i Bolagsverkets databas: ${formattedDate}`;
    }
    return "Ett nytt protokoll har registrerats i Bolagsverkets databas.";
  }

  // Announcement
  const a = event.data;
  const text = `${a.type || ""} ${a.detailText || ""}`;

  // Extract changes
  const changesMatch = text.match(/Ändringar har registrerats beträffande:\s*([^\n.]+)/i);
  if (changesMatch) {
    const changes = changesMatch[1].replace(/,\s*$/, "").trim();
    return `Ändringar har registrerats gällande ${changes}.`;
  }

  // Clean up detail text for summary
  let summary = a.detailText || "";

  // Remove common noise
  const noisePatterns = [
    /In English/gi, /Start\s+Sök/gi, /Sök kungörelse/gi, /Bli kund/gi,
    /Logga in/gi, /Skriv ut/gi, /0771-670\s*670/gi, /Bolagsverket/gi,
    /Aktiebolagsregistret/gi, /Sökresultat/gi, /Antal träffar:\s*\d+/gi,
    /K\d{5,}[-/]\d{2}/gi, /\d{4}-\d{2}-\d{2}/g, /\d{6}-\d{4}/g,
    /Org nr:/gi, /Företagsnamn:/gi, /Säte:/gi, /Kungörelsetext/gi,
    /Uppgiftslämnare/gi, /Typ av kungörelse/gi, /Registreringsdatum/gi,
    /Publiceringsdatum/gi, /« Tillbaka/gi, /Publicerad/gi,
  ];

  for (const pattern of noisePatterns) {
    summary = summary.replace(pattern, " ");
  }

  summary = summary.replace(/\s+/g, " ").trim();

  if (summary.length > 200) {
    summary = summary.slice(0, 197) + "...";
  }

  return summary || "Kungörelse noterad.";
}

// Format org number
function formatOrgNumber(org: string | undefined): string {
  if (!org) return "";
  const digits = org.replace(/\D/g, "");
  return digits.length >= 6 ? `${digits.slice(0, 6)}-${digits.slice(6, 10)}` : digits;
}

export function EventItem({
  event,
  date,
  isFocused = false,
  showGradientLine = true,
  isUnread = false,
  onMarkAsRead,
}: EventItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [clearbitError, setClearbitError] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  const { time, day } = formatTimeWithDay(date);

  // Get company info
  const companyName = event.type === "protocol"
    ? event.data.companyName || "Okänt bolag"
    : event.type === "protocolSearch"
    ? event.data.companyName || "Okänt bolag"
    : event.data.subject || "Okänt bolag";

  const orgNumber = event.type === "protocol"
    ? event.data.orgNumber
    : event.type === "protocolSearch"
    ? event.data.orgNumber
    : event.data.orgNumber;

  // Detect category
  const categoryText = event.type === "announcement"
    ? `${event.data.type || ""} ${event.data.detailText || ""}`
    : event.type === "protocol" && event.data.eventType
    ? event.data.eventType
    : "";
  const category = detectCategory(categoryText);

  // Generate title and summary
  const title = generateTitle(event);
  const summary = generateSummary(event);

  // Logo URL
  const clearbitUrl = getCompanyLogoUrl(orgNumber, companyName);
  const localLogoUrl = orgNumber ? `/logos/${orgNumber.replace(/\D/g, "")}.png` : null;

  // Click handler
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    setExpanded(!expanded);
    // Mark as read when expanded
    if (!expanded && onMarkAsRead) {
      onMarkAsRead();
    }
  };

  // Get external link
  const externalLink = event.type === "announcement"
    ? `https://poit.bolagsverket.se/poit-app/kungorelse/${event.data.id.replace(/\//g, "-")}`
    : event.type === "protocol"
    ? event.data.pdfUrl
    : null; // protocolSearch has no direct external link

  // Determine visual styling based on event type (#2)
  const isProtocol = event.type === "protocol" || event.type === "protocolSearch";
  const eventStyle = category
    ? { bgColor: category.bgColor, borderColor: category.borderColor, gradient: category.gradient }
    : isProtocol
    ? PROTOCOL_STYLE
    : { bgColor: "", borderColor: "border-l-muted-foreground/30", gradient: "" };

  return (
    <article
      ref={articleRef}
      className={`
        group relative grid gap-3 sm:gap-4 md:gap-5 py-4 sm:py-5 md:py-6 cursor-pointer
        transition-all duration-200 ease-out
        grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] md:grid-cols-[60px_1fr_120px] lg:grid-cols-[60px_1fr_140px]
        ${isFocused ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl" : ""}
        ${expanded ? "bg-secondary/30 -mx-2 sm:-mx-3 md:-mx-4 px-2 sm:px-3 md:px-4 rounded-xl" : ""}
        ${isUnread && !expanded ? `${eventStyle.bgColor || "bg-primary/5"} -mx-2 sm:-mx-3 md:-mx-4 px-2 sm:px-3 md:px-4 rounded-xl border-l-4 ${eventStyle.borderColor}` : ""}
        ${!isUnread && !expanded && category ? `border-l-2 ${eventStyle.borderColor} -ml-0.5` : ""}
        hover:bg-secondary/20 hover:-mx-2 sm:hover:-mx-3 md:hover:-mx-4 hover:px-2 sm:hover:px-3 md:hover:px-4 hover:rounded-xl
      `}
      style={{ minHeight: "auto", alignItems: "start" }}
      onClick={handleCardClick}
    >
      {/* Unread indicator dot */}
      {isUnread && !expanded && (
        <div className="absolute top-4 sm:top-5 md:top-6 left-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      )}
      {/* Gradient line separator */}
      {showGradientLine && !expanded && (
        <div
          className="absolute bottom-0 left-[40px] sm:left-[48px] md:left-[60px] right-0 h-px opacity-50
                     bg-gradient-to-r from-border via-muted-foreground/30 to-transparent
                     group-hover:opacity-0 transition-opacity"
        />
      )}

      {/* Left meta column - time */}
      <div className="flex flex-col items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
        <div className="text-center">
          <div className="font-mono text-[10px] sm:text-[11px] font-medium text-muted-foreground tabular-nums">
            {time}
          </div>
          {day && (
            <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground/70 mt-0.5 tabular-nums">
              {day}
            </div>
          )}
        </div>
        {/* Category icon */}
        {category && (
          <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-md flex items-center justify-center ${category.color} text-white transition-transform group-hover:scale-110`}>
            <span className="w-3.5 h-3.5 [&>svg]:w-3.5 [&>svg]:h-3.5">
              {category.icon}
            </span>
          </div>
        )}
        {!category && (event.type === "protocol" || event.type === "protocolSearch") && (
          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-md flex items-center justify-center bg-indigo-500 text-white transition-transform group-hover:scale-110">
            <FileText className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Content column */}
      <div className="min-w-0 flex flex-col">
        {/* Category badge + Title */}
        <div className="flex items-start gap-2 mb-2 sm:mb-2.5">
          {/* Mobile category indicator */}
          {category && (
            <div className={`md:hidden flex-shrink-0 ${category.color} rounded p-1.5 text-white mt-0.5`}>
              <span className="w-3.5 h-3.5 block [&>svg]:w-3.5 [&>svg]:h-3.5">
                {category.icon}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] sm:text-[16px] md:text-[17px] font-semibold leading-snug transition-colors group-hover:text-foreground text-foreground">
              {title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {/* Clickable company link (#14) */}
              {orgNumber && (
                <Link
                  href={`/bolag/${orgNumber.replace(/\D/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono hover:text-primary hover:underline transition-colors"
                >
                  {formatOrgNumber(orgNumber)}
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}
              {category && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${category.color} text-white`}>
                  {category.label}
                </span>
              )}
              {(event.type === "protocol" || event.type === "protocolSearch") && !category && (
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-500 text-white">
                  Protokoll
                </span>
              )}
              {/* Score badge for protocols with AI analysis */}
              {event.type === "protocol" && event.data.aiDetails?.score !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                  event.data.aiDetails.score >= 7 ? "bg-amber-500 text-white" :
                  event.data.aiDetails.score >= 5 ? "bg-blue-500 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  <Star size={10} />
                  {event.data.aiDetails.score}/10
                </span>
              )}
              {/* "Har artikel" indicator for high-value protocols */}
              {event.type === "protocol" && event.data.aiDetails?.artikel && (
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-500 text-white flex items-center gap-1">
                  <Newspaper size={10} />
                  Artikel
                </span>
              )}
              {/* Quick "Läs protokoll" button for protocols with PDF */}
              {event.type === "protocol" && event.data.pdfUrl && (
                <a
                  href={event.data.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors flex items-center gap-1"
                >
                  <FileText size={10} />
                  Läs protokoll
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className={`text-sm text-muted-foreground flex-1 ${expanded ? "" : "line-clamp-3"}`}>
          {summary}
        </p>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* AI-generated article for high-value protocols */}
            {event.type === "protocol" && event.data.aiDetails?.artikel && (
              <div className="mb-6 p-4 bg-secondary/50 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Newspaper className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold">Nyhetsartikel</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    AI-genererad
                  </span>
                </div>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground/90"
                  dangerouslySetInnerHTML={{
                    __html: event.data.aiDetails.artikel
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n\n/g, '</p><p>')
                      .replace(/^/, '<p>')
                      .replace(/$/, '</p>')
                  }}
                />
              </div>
            )}

            {/* Faktaruta for protocols with financial data */}
            {event.type === "protocol" && event.data.aiDetails?.faktaruta && (
              (() => {
                const fr = event.data.aiDetails.faktaruta;
                const hasData = fr.händelse || fr.belopp || fr.pris_per_aktie || fr.nya_aktier || fr.utspädning || (fr.investerare && fr.investerare.length > 0);
                if (!hasData) return null;

                return (
                  <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border/50">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Faktaruta
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {fr.stämmoTyp && (
                        <div>
                          <div className="text-muted-foreground text-xs">Typ</div>
                          <div className="font-medium">{fr.stämmoTyp}</div>
                        </div>
                      )}
                      {fr.händelse && (
                        <div>
                          <div className="text-muted-foreground text-xs">Händelse</div>
                          <div className="font-medium">{fr.händelse}</div>
                        </div>
                      )}
                      {fr.belopp && (
                        <div>
                          <div className="text-muted-foreground text-xs">Belopp</div>
                          <div className="font-medium">{fr.belopp}</div>
                        </div>
                      )}
                      {fr.pris_per_aktie && (
                        <div>
                          <div className="text-muted-foreground text-xs">Pris/aktie</div>
                          <div className="font-medium">{fr.pris_per_aktie}</div>
                        </div>
                      )}
                      {fr.nya_aktier && (
                        <div>
                          <div className="text-muted-foreground text-xs">Nya aktier</div>
                          <div className="font-medium">{fr.nya_aktier}</div>
                        </div>
                      )}
                      {fr.utspädning && (
                        <div>
                          <div className="text-muted-foreground text-xs">Utspädning</div>
                          <div className="font-medium">{fr.utspädning}</div>
                        </div>
                      )}
                      {fr.investerare && fr.investerare.length > 0 && (
                        <div className="col-span-2 sm:col-span-3">
                          <div className="text-muted-foreground text-xs">Investerare</div>
                          <div className="font-medium">{fr.investerare.join(", ")}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {externalLink && (
                <a
                  href={externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium
                             bg-foreground text-background flex-1 sm:flex-none justify-center
                             hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  {event.type === "protocol" ? "Öppna PDF" : event.type === "announcement" ? "Visa kungörelse" : "Visa i Bolagsverket"}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <Link
                href={`/bolag/${orgNumber?.replace(/\D/g, "")}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium
                           bg-secondary border border-border text-muted-foreground
                           hover:text-foreground hover:border-muted-foreground
                           hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden xs:inline">Visa bolag</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Company logo - hidden on mobile */}
      {!expanded && (
        <div className="hidden md:flex w-full rounded-xl overflow-hidden bg-secondary min-h-[80px] lg:min-h-[100px] relative items-center justify-center transition-all duration-200 group-hover:bg-secondary/80">
          {!logoError && !clearbitError && clearbitUrl ? (
            <img
              src={clearbitUrl}
              alt=""
              className="w-12 h-12 lg:w-14 lg:h-14 object-contain transition-all duration-300 group-hover:scale-110"
              onError={() => setClearbitError(true)}
            />
          ) : !logoError && localLogoUrl ? (
            <img
              src={localLogoUrl}
              alt=""
              className="w-12 h-12 lg:w-14 lg:h-14 object-contain transition-all duration-300 group-hover:scale-110"
              onError={() => setLogoError(true)}
            />
          ) : category ? (
            <div className={`${category.color} rounded-full p-3 text-white shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200`}>
              {category.icon}
            </div>
          ) : (
            <Building2 className="w-8 h-8 lg:w-10 lg:h-10 text-muted-foreground/40 transition-all duration-200 group-hover:text-muted-foreground/60" />
          )}
        </div>
      )}
    </article>
  );
}
