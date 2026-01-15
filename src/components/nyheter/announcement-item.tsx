"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Bell, Building2 } from "lucide-react";

// Announcement type that can be mixed with articles in the feed
export interface Announcement {
  id: string;
  type: "announcement"; // Discriminator to distinguish from Article
  title: string;
  interpretation: string; // Markdown-formatted detailed interpretation
  companyName: string;
  orgNumber: string;
  announcementUrl: string;
  announcementId: string; // e.g. "K7420-26"
  announcementType: "nyemission" | "likvidation" | "fusion" | "kallelse" | "other";
  publishedAt: Date | string;
  isRead?: boolean;
}

interface AnnouncementItemProps {
  announcement: Announcement;
  onRead?: (id: string) => void;
  onFollowUp?: (announcement: Announcement) => void;
  onViewCompany?: (orgNumber: string) => void;
  showGradientLine?: boolean;
}

// Format time with optional day indicator (same as news-item)
function formatTimeWithDay(date: Date | string): { time: string; day?: string } {
  const d = new Date(date);
  const now = new Date();
  const time = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });

  if (d.toDateString() === now.toDateString()) {
    return { time };
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return { time, day: "Igår" };
  }

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (d > weekAgo) {
    const dayName = d.toLocaleDateString("sv-SE", { weekday: "short" });
    return { time, day: dayName.charAt(0).toUpperCase() + dayName.slice(1) };
  }

  return { time, day: d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) };
}

// Get announcement type label
function getAnnouncementTypeLabel(type: Announcement["announcementType"]): string {
  switch (type) {
    case "nyemission": return "Möjlig nyemission";
    case "likvidation": return "Likvidation";
    case "fusion": return "Fusion";
    case "kallelse": return "Kallelse till stämma";
    default: return "Kungörelse";
  }
}

// Simple markdown parser for the interpretation content
function renderMarkdown(markdown: string): React.ReactNode {
  const lines = markdown.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `md-${keyCounter++}`;

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // H2 heading
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={key} className="text-base font-semibold text-foreground mt-4 mb-2 first:mt-0">
          {renderInlineMarkdown(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    // H3 heading
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={key} className="text-sm font-semibold text-foreground mt-3 mb-1.5">
          {renderInlineMarkdown(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }

    // Table detection
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1].includes("|") && lines[i + 1].includes("-")) {
      const tableLines: string[] = [line];
      let j = i + 1;
      while (j < lines.length && lines[j].includes("|")) {
        tableLines.push(lines[j]);
        j++;
      }

      const headerCells = tableLines[0].split("|").map(c => c.trim()).filter(c => c);
      const dataRows = tableLines.slice(2).map(row =>
        row.split("|").map(c => c.trim()).filter(c => c)
      );

      elements.push(
        <div key={key} className="my-3 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {headerCells.map((cell, idx) => (
                  <th key={idx} className="text-left py-1.5 px-2 font-medium text-muted-foreground">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-border/50">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="py-1.5 px-2 text-foreground/80">
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      i = j;
      continue;
    }

    // Bullet list
    if (line.startsWith("- ")) {
      const listItems: string[] = [line.slice(2)];
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith("- ")) {
        listItems.push(lines[j].slice(2));
        j++;
      }

      elements.push(
        <ul key={key} className="my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
              <span className="text-amber-500 mt-1.5">•</span>
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );

      i = j;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key} className="text-sm text-foreground/80 leading-relaxed my-2">
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return elements;
}

// Render inline markdown (bold, etc.)
function renderInlineMarkdown(text: string): React.ReactNode {
  // Handle **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function AnnouncementItem({
  announcement,
  onRead,
  onFollowUp,
  onViewCompany,
  showGradientLine = true,
}: AnnouncementItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { time, day } = formatTimeWithDay(announcement.publishedAt);
  const typeLabel = getAnnouncementTypeLabel(announcement.announcementType);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && !announcement.isRead) {
      onRead?.(announcement.id);
    }
  };

  return (
    <article
      className={`
        group relative py-3 sm:py-4 md:py-5
        transition-all duration-200 ease-out
        ${announcement.isRead ? "opacity-60" : ""}
      `}
    >
      {/* Gradient line separator */}
      {showGradientLine && !isExpanded && (
        <div
          className="absolute bottom-0 left-[40px] sm:left-[48px] md:left-[60px] right-0 h-px opacity-50
                     bg-gradient-to-r from-border via-muted-foreground/30 to-transparent
                     group-hover:opacity-0 transition-opacity"
        />
      )}

      {/* Main content - clickable header */}
      <button
        onClick={handleExpand}
        className="w-full text-left grid gap-3 sm:gap-4 md:gap-5
                   grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] md:grid-cols-[60px_1fr]
                   hover:bg-amber-50/50 dark:hover:bg-amber-950/20
                   hover:-mx-2 sm:hover:-mx-3 md:hover:-mx-4
                   hover:px-2 sm:hover:px-3 md:hover:px-4
                   hover:rounded-xl transition-all"
      >
        {/* Left meta column - time & icon */}
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
          {/* Bolagsverket icon */}
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md overflow-hidden bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center transition-transform group-hover:scale-110">
            <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Content column */}
        <div className="min-w-0 flex flex-col">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              {/* Type badge */}
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md
                             bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                {typeLabel}
              </span>
            </div>
            {/* Expand indicator */}
            <div className="flex-shrink-0 text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Company name as title */}
          <h2 className="text-[15px] sm:text-[16px] md:text-[17px] font-semibold leading-snug text-foreground">
            {announcement.companyName}
          </h2>

          {/* Short preview when collapsed */}
          {!isExpanded && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {announcement.title}
            </p>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3 ml-[40px] sm:ml-[48px] md:ml-[60px] pl-3 sm:pl-4 md:pl-5
                       border-l-2 border-amber-200 dark:border-amber-800
                       bg-amber-50/30 dark:bg-amber-950/10 rounded-r-xl py-4 pr-4">
          {/* Rendered markdown interpretation */}
          <div className="prose-sm">
            {renderMarkdown(announcement.interpretation)}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-800/50">
            <a
              href={announcement.announcementUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg
                        bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300
                        hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Öppna kungörelse
            </a>

            {onFollowUp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFollowUp(announcement);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg
                          bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Följ upp
              </button>
            )}

            {onViewCompany && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCompany(announcement.orgNumber);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg
                          bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                Visa bolag
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Kungörelse-ID: {announcement.announcementId}</span>
            <span>Org.nr: {announcement.orgNumber}</span>
          </div>
        </div>
      )}
    </article>
  );
}

// Example: Voi Technology announcement with full interpretation
export const voiAnnouncement: Announcement = {
  id: "announcement-voi-k7420-26",
  type: "announcement",
  title: "Kallelse till extra bolagsstämma med förslag om nyemission",
  interpretation: `## Tolkning av kungörelsen

**Voi Technology AB** kallar till **extra bolagsstämma** den 27 januari 2026 kl. 11.00 på huvudkontoret i Stockholm.

### Huvudärende: Riktad nyemission

Styrelsen föreslår en riktad emission av **1 040 000 preferensaktier** (serie C SuperStam) till ledande befattningshavare:

| Mottagare | Antal aktier |
|-----------|--------------|
| CPO | 400 000 |
| CBO | 300 000 |
| Regionchef 1 | 150 000 |
| Regionchef 2 | 100 000 |
| Före detta marknadsanställd | 50 000 |
| CTO | 40 000 |

**Teckningskurs:** 0,10 USD per aktie (totalt ~104 000 USD för hela emissionen)

### Väsentliga villkor

- Kräver 90% majoritet (röster och aktier) för godkännande
- Aktierna har hembudsförbehåll och omvandlingsförbehåll
- Teckning inom 15 arbetsdagar, betalning inom 4 veckor
- Aktiekapitalökning: max 6 459,63 kr

### Noterbart

Detta är en incitamentsemission till ledningsgruppen. Den låga teckningskursen (0,10 USD) kombinerat med preferensaktier av serie C SuperStam tyder på ett optionslikt upplägg där värdet realiseras vid framtida likviditetsevent (exit/börsnotering). Att en före detta anställd inkluderas kan indikera en uppgörelse eller tidigare utfästelse.`,
  companyName: "Voi Technology AB",
  orgNumber: "559160-8031",
  announcementUrl: "https://poit.bolagsverket.se/poit-app/kungorelse/K7420-26",
  announcementId: "K7420-26",
  announcementType: "nyemission",
  publishedAt: new Date(),
  isRead: false,
};
