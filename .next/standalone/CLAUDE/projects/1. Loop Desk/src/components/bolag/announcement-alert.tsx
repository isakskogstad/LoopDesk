"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Bell } from "lucide-react";

export interface AnnouncementAlertProps {
  title: string;
  description: string;
  announcementUrl?: string;
  onFollowUp?: () => void;
}

export function AnnouncementAlert({
  title,
  description,
  announcementUrl,
  onFollowUp,
}: AnnouncementAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 overflow-hidden transition-all duration-200">
      {/* Collapsed header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {title}
          </span>
        </div>
        <div className="flex-shrink-0 text-amber-600 dark:text-amber-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-amber-200/50 dark:border-amber-900/30">
          <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed mt-3 mb-4">
            {description}
          </p>

          <div className="flex flex-wrap gap-2">
            {announcementUrl && (
              <a
                href={announcementUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Öppna kungörelse
              </a>
            )}
            {onFollowUp && (
              <button
                onClick={onFollowUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Följ upp
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Pre-configured example for the Voi announcement
export function VoiAnnouncementAlert() {
  return (
    <AnnouncementAlert
      title="Möjlig nyemission"
      description='Bolagsverket har registrerat Voi Technology ABs kallelse till extra bolagsstämma. Av dagordningens punkt 8 framgår: "Styrelsen föreslår att bolagsstämman beslutar om en riktad nyemission av högst 1 040 000 preferensaktier av serie C SuperStam, innebärande en ökning av aktiekapitalet med högst 6 459,627332 kronor."'
      announcementUrl="https://poit.bolagsverket.se/poit-app/kungorelse/K7420-26"
      onFollowUp={() => {
        // TODO: Implement follow-up action
        console.log("Följ upp clicked");
      }}
    />
  );
}
