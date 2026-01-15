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
  Newspaper,
  Star,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { ShareholderChart } from "./shareholder-chart";
import { PdfViewerModal } from "./pdf-viewer-modal";
import { RelatedEvents } from "./related-events";

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

// Shareholder data from AI analysis
interface ShareholderData {
  name: string;
  orgNumber?: string;
  shares: number;
  votes?: number;
  sharePercentage?: number;
  presentAtMeeting?: boolean;
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
    shareholders?: ShareholderData[];
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

// Related event for the RelatedEvents component
interface RelatedEventData {
  id: string | number;
  type: "announcement" | "protocol" | "protocolSearch";
  title: string;
  date: Date;
  eventType?: string | null;
}

interface EventItemProps {
  event: EventData;
  date: Date;
  isFocused?: boolean;
  showGradientLine?: boolean;
  isUnread?: boolean;
  onMarkAsRead?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  searchQuery?: string; // For highlighting search matches (#6)
  relatedEvents?: RelatedEventData[]; // Other events from same company (#14)
  layout?: "compact" | "standard" | "media"; // Layout mode (#3)
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

// Helper function to highlight search terms in text (#6)
function highlightSearchTerms(text: string, query: string | undefined): string {
  if (!query || query.trim().length < 2) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  return text.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-500/30 text-inherit px-0.5 rounded">$1</mark>'
  );
}

export function EventItem({
  event,
  date,
  isFocused = false,
  showGradientLine = true,
  isUnread = false,
  onMarkAsRead,
  onBookmark,
  isBookmarked = false,
  searchQuery,
  relatedEvents,
  layout = "standard",
}: EventItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [clearbitError, setClearbitError] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
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

  // Determine if item is read (not unread) - for opacity styling (#2)
  const isRead = !isUnread;

  // Handle share action (#5)
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: title,
      text: summary.slice(0, 100),
      url: externalLink || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(externalLink || window.location.href);
    }
  };

  // Handle bookmark (#5)
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.();
  };

  // Handle mark as read (#5)
  const handleMarkReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.();
  };

  // Layout-specific settings (#3) – NY STIL
  const showDescription = layout !== "compact";
  const padding = layout === "compact"
    ? "py-4"
    : "py-6 sm:py-8";

  return (
    <>
    <article
      ref={articleRef}
      className={`
        group relative ${padding} cursor-pointer
        transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isFocused ? "ring-2 ring-rose-500 ring-offset-4 ring-offset-background rounded-2xl" : ""}
        ${expanded ? "bg-secondary/20 -mx-4 px-4 rounded-2xl" : ""}
        ${isRead && !expanded ? "opacity-50" : ""}
        hover:opacity-100 hover:-translate-y-0.5
      `}
      style={{ minHeight: "auto" }}
      onClick={handleCardClick}
    >
      {/* Hover actions panel – mjukare styling */}
      <div className="absolute right-0 top-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
        <button
          onClick={handleBookmark}
          className="h-9 w-9 rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm text-muted-foreground
                     hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-200 flex items-center justify-center
                     shadow-sm hover:shadow-md"
          title={isBookmarked ? "Ta bort bokmärke" : "Bokmärk"}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
        {isUnread && (
          <button
            onClick={handleMarkReadClick}
            className="h-9 w-9 rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm text-muted-foreground
                       hover:text-emerald-500 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 flex items-center justify-center
                       shadow-sm hover:shadow-md"
            title="Markera som läst"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleShare}
          className="h-9 w-9 rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm text-muted-foreground
                     hover:text-foreground hover:border-border transition-all duration-200 flex items-center justify-center
                     shadow-sm hover:shadow-md"
          title="Dela"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Editorial article layout – NY STIL (#4) */}
      <div className="min-w-0 flex flex-col">
        {/* Kategori-etikett – röd accent (#8) */}
        {category && (
          <span className="inline-block mb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-rose-500">
            {category.label}
          </span>
        )}
        {(event.type === "protocol" || event.type === "protocolSearch") && !category && (
          <span className="inline-block mb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-rose-500">
            Protokoll
          </span>
        )}

        {/* Titel – serif typografi för editorial känsla */}
        <h2
          className="font-serif text-lg sm:text-xl md:text-[22px] font-normal leading-snug text-foreground
                     group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-200"
          dangerouslySetInnerHTML={{ __html: highlightSearchTerms(title, searchQuery) }}
        />

        {/* Meta-rad med logotyp (#5) */}
        <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
          {/* Bolagslogotyp + namn */}
          {orgNumber && (
            <Link
              href={`/bolag/${orgNumber.replace(/\D/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 font-medium text-foreground hover:text-rose-500 transition-colors duration-200"
            >
              {/* Logotyp med mjuk skugga */}
              {!logoError && (clearbitUrl || localLogoUrl) && (
                <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0 shadow-sm ring-1 ring-border/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={clearbitError ? (localLogoUrl || "") : (clearbitUrl || "")}
                    alt=""
                    className="w-full h-full object-contain p-0.5"
                    onError={() => {
                      if (!clearbitError && clearbitUrl) {
                        setClearbitError(true);
                      } else {
                        setLogoError(true);
                      }
                    }}
                  />
                </div>
              )}
              {/* Fallback-ikon om ingen logotyp */}
              {(logoError || (!clearbitUrl && !localLogoUrl)) && (
                <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-border/30">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground/60" />
                </div>
              )}
              <span>{companyName}</span>
            </Link>
          )}
          <span className="text-muted-foreground/40">·</span>
          <time className="tabular-nums">{time}</time>
          {day && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground/60">{day}</span>
            </>
          )}
          {/* Score badge for protocols with AI analysis */}
          {event.type === "protocol" && event.data.aiDetails?.score !== undefined && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Star size={12} />
                {event.data.aiDetails.score}/10
              </span>
            </>
          )}
          {/* "Har artikel" indicator */}
          {event.type === "protocol" && event.data.aiDetails?.artikel && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Newspaper size={12} />
                Artikel
              </span>
            </>
          )}
        </div>

        {/* Summary – kursiv serif för editorial känsla */}
        {showDescription && (
          <p
            className={`mt-4 font-serif text-base sm:text-[17px] italic text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
            dangerouslySetInnerHTML={{ __html: highlightSearchTerms(summary, searchQuery) }}
          />
        )}

        {/* Quick actions */}
        {event.type === "protocol" && event.data.pdfUrl && !expanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPdfModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors duration-200"
          >
            <FileText size={14} />
            Läs protokoll
          </button>
        )}

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

            {/* Shareholder visualization */}
            {event.type === "protocol" && event.data.aiDetails?.shareholders && event.data.aiDetails.shareholders.length > 0 && (
              <div className="mb-6">
                <ShareholderChart shareholders={event.data.aiDetails.shareholders} />
              </div>
            )}

            {/* Related events from same company */}
            {relatedEvents && relatedEvents.length > 0 && orgNumber && (
              <div className="mb-6">
                <RelatedEvents
                  events={relatedEvents}
                  currentEventId={event.data.id}
                  orgNumber={orgNumber}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {event.type === "protocol" && event.data.pdfUrl ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPdfModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium
                             bg-foreground text-background flex-1 sm:flex-none justify-center
                             hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  Visa protokoll
                  <FileText className="w-4 h-4" />
                </button>
              ) : externalLink && (
                <a
                  href={externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium
                             bg-foreground text-background flex-1 sm:flex-none justify-center
                             hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  {event.type === "announcement" ? "Visa kungörelse" : "Visa i Bolagsverket"}
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
    </article>

    {/* PDF Viewer Modal - rendered outside article to avoid z-index issues */}
    {event.type === "protocol" && event.data.pdfUrl && (
      <PdfViewerModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        pdfUrl={event.data.pdfUrl}
        title={`${event.data.companyName || "Protokoll"} - ${event.data.protocolDate}`}
      />
    )}
    </>
  );
}
