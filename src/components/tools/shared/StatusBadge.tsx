"use client";

import { cn } from "@/lib/utils";
import type { ToolStatus } from "./types";

interface StatusBadgeProps {
  status: ToolStatus;
  className?: string;
}

const STATUS_LABELS: Record<ToolStatus, string> = {
  idle: "Vilande",
  running: "Kör",
  success: "Klar",
  error: "Fel",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <div className={cn("tool-status", className)} data-status={status}>
      <span className="tool-status-dot" />
      <span>{STATUS_LABELS[status]}</span>
    </div>
  );
}
