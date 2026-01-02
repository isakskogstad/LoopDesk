"use client";

import { useState } from "react";
import { ExternalLink, Clock, Building2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Announcement } from "@/lib/kungorelser/types";

interface AnnouncementItemProps {
  announcement: Announcement;
  onViewCompany?: (orgNumber: string) => void;
}

// Map announcement types to Swedish labels and colors
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "Likvidation": { label: "Likvidation", color: "#ef4444", bg: "#fef2f2" },
  "Konkurs": { label: "Konkurs", color: "#dc2626", bg: "#fee2e2" },
  "Fusion": { label: "Fusion", color: "#8b5cf6", bg: "#f5f3ff" },
  "Delning": { label: "Delning", color: "#6366f1", bg: "#eef2ff" },
  "Kallelse": { label: "Kallelse", color: "#f59e0b", bg: "#fffbeb" },
  "Ändring": { label: "Ändring", color: "#3b82f6", bg: "#eff6ff" },
  "Nyregistrering": { label: "Nyregistrering", color: "#10b981", bg: "#ecfdf5" },
  "Avregistrering": { label: "Avregistrering", color: "#64748b", bg: "#f1f5f9" },
};

function getTypeConfig(type: string | undefined) {
  if (!type) return { label: "Kungörelse", color: "#6b7280", bg: "#f9fafb" };

  // Find matching type
  for (const [key, config] of Object.entries(TYPE_CONFIG)) {
    if (type.toLowerCase().includes(key.toLowerCase())) {
      return config;
    }
  }

  return { label: type, color: "#6b7280", bg: "#f9fafb" };
}

export function AnnouncementItem({ announcement, onViewCompany }: AnnouncementItemProps) {
  const [expanded, setExpanded] = useState(false);

  const typeConfig = getTypeConfig(announcement.type);
  const hasFullText = announcement.fullText && announcement.fullText !== announcement.detailText;
  const displayText = expanded && announcement.fullText
    ? announcement.fullText
    : announcement.detailText;

  return (
    <article className="bg-card rounded-xl border border-border dark:border-gray-800 overflow-hidden hover:border-border dark:hover:border-gray-700 hover:shadow-lg transition-all duration-200">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: typeConfig.bg }}
          >
            <FileText className="w-6 h-6" style={{ color: typeConfig.color }} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Type badge and date */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: typeConfig.bg,
                  color: typeConfig.color
                }}
              >
                {typeConfig.label}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <Clock className="w-3 h-3" />
                <span>
                  {announcement.publishedAt
                    ? formatRelativeTime(announcement.publishedAt)
                    : announcement.pubDate || "Okänt datum"}
                </span>
              </div>
            </div>

            {/* Subject (company name) */}
            <h3 className="font-semibold text-foreground text-lg leading-snug line-clamp-2">
              {announcement.subject}
            </h3>

            {/* Reporter */}
            {announcement.reporter && (
              <p className="text-sm text-muted-foreground mt-1">
                {announcement.reporter}
              </p>
            )}
          </div>

          {/* External link */}
          {announcement.url && (
            <a
              href={announcement.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary dark:hover:bg-gray-800 transition-colors"
              title="Öppna på Bolagsverket"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Content */}
        {displayText && (
          <div className="mb-4">
            <p className={`text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap ${!expanded && hasFullText ? "line-clamp-4" : ""}`}>
              {displayText}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* View company button */}
            {announcement.orgNumber && onViewCompany && (
              <button
                onClick={() => onViewCompany(announcement.orgNumber!)}
                className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Visa bolag</span>
              </button>
            )}

            {/* Announcement ID */}
            <span className="text-xs text-muted-foreground/70 font-mono">
              {announcement.id}
            </span>
          </div>

          {/* Expand/collapse button */}
          {hasFullText && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground/50 transition-colors"
            >
              <span>{expanded ? "Visa mindre" : "Visa mer"}</span>
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
