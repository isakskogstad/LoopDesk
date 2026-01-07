"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { LogEntry } from "./types";

interface LogPanelProps {
  entries: LogEntry[];
  maxHeight?: number;
  autoScroll?: boolean;
  className?: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LogPanel({
  entries,
  maxHeight = 200,
  autoScroll = true,
  className,
}: LogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  if (entries.length === 0) {
    return (
      <div
        className={cn("tool-log", className)}
        style={{ maxHeight }}
      >
        <div className="tool-log-entry">
          <span className="tool-log-message text-muted-foreground">
            Ingen aktivitet än...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn("tool-log dark-scrollbar", className)}
      style={{ maxHeight }}
    >
      {entries.map((entry) => (
        <div key={entry.id} className="tool-log-entry" data-type={entry.type}>
          <span className="tool-log-time">{formatTime(entry.timestamp)}</span>
          <span className="tool-log-message">{entry.message}</span>
        </div>
      ))}
    </div>
  );
}

// Helper hook for managing log entries
export function useLogEntries(maxEntries = 100) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const idRef = useRef(0);

  const addEntry = useCallback((
    message: string,
    type: LogEntry["type"] = "info"
  ): LogEntry => {
    const entry: LogEntry = {
      id: `log-${++idRef.current}`,
      timestamp: new Date(),
      message,
      type,
    };

    setEntries(prev => [...prev.slice(-maxEntries + 1), entry]);
    return entry;
  }, [maxEntries]);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    addEntry,
    clearEntries,
    log: useCallback((message: string) => addEntry(message, "info"), [addEntry]),
    success: useCallback((message: string) => addEntry(message, "success"), [addEntry]),
    warning: useCallback((message: string) => addEntry(message, "warning"), [addEntry]),
    error: useCallback((message: string) => addEntry(message, "error"), [addEntry]),
  };
}
