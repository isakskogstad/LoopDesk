"use client";

import { useEffect, useRef } from "react";
import { Pause, Play, Trash2 } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error" | "captcha" | "detail" | "rate-limit";
  message: string;
}

interface TerminalProps {
  logs: LogEntry[];
  isActive: boolean;
  isPaused: boolean;
  progress: number;
  onPause: () => void;
  onClear: () => void;
}

const typeColors: Record<LogEntry["type"], string> = {
  info: "text-blue-400",
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
  captcha: "text-purple-400",
  detail: "text-cyan-400",
  "rate-limit": "text-orange-400",
};

const typeBadges: Record<LogEntry["type"], string> = {
  info: "bg-blue-500/20 text-blue-400",
  success: "bg-green-500/20 text-green-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  error: "bg-red-500/20 text-red-400",
  captcha: "bg-purple-500/20 text-purple-400",
  detail: "bg-cyan-500/20 text-cyan-400",
  "rate-limit": "bg-orange-500/20 text-orange-400",
};

export function Terminal({ logs, isActive, isPaused, progress, onPause, onClear }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-[#3a3a3a]"}`} />
          <span className="text-sm font-medium text-[#888]">Logg</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-2 py-1 text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded transition-colors"
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
            {isPaused ? "Fortsätt" : "Pausa"}
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2 py-1 text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded transition-colors"
          >
            <Trash2 size={12} />
            Rensa
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={scrollRef}
        className="h-[120px] overflow-y-auto font-mono text-xs leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#444]">
            Inga loggmeddelanden ännu...
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 py-0.5 animate-fadeIn"
              >
                <span className="text-[#444] shrink-0">{formatTime(log.timestamp)}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-medium shrink-0 ${typeBadges[log.type]}`}>
                  {log.type}
                </span>
                <span className={typeColors[log.type]}>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#151515] border-t border-[#2a2a2a]">
        <span className="text-xs text-[#666]">
          {isActive ? (isPaused ? "Pausad" : "Kör") : "Redo"}
        </span>
        {isActive && (
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6366f1] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-[#666]">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
