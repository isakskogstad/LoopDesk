"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FileText, ChevronRight, Calendar } from "lucide-react";

interface RelatedEvent {
  id: string | number;
  type: "announcement" | "protocol" | "protocolSearch";
  title: string;
  date: Date;
  eventType?: string | null;
}

interface RelatedEventsProps {
  events: RelatedEvent[];
  currentEventId: string | number;
  orgNumber: string;
  maxDisplay?: number;
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Idag";
  } else if (diffDays === 1) {
    return "Igår";
  } else if (diffDays < 7) {
    return `${diffDays} dagar sedan`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "vecka" : "veckor"} sedan`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "månad" : "månader"} sedan`;
  } else {
    return date.toLocaleDateString("sv-SE", { year: "numeric", month: "short" });
  }
}

export function RelatedEvents({
  events,
  currentEventId,
  orgNumber,
  maxDisplay = 3,
}: RelatedEventsProps) {
  // Filter out current event and sort by date
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => e.id !== currentEventId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, maxDisplay);
  }, [events, currentEventId, maxDisplay]);

  if (filteredEvents.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Fler händelser från bolaget</span>
        </div>
        <Link
          href={`/bolag/${orgNumber.replace(/\D/g, "")}`}
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          Visa alla
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="space-y-2">
        {filteredEvents.map((event) => (
          <div
            key={`${event.type}-${event.id}`}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className={`mt-0.5 p-1.5 rounded-md ${
              event.type === "protocol" || event.type === "protocolSearch"
                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                : "bg-secondary text-muted-foreground"
            }`}>
              <FileText size={12} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{event.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {formatRelativeDate(event.date)}
                </span>
                {event.eventType && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                    {event.eventType}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
