"use client";

import { cn } from "@/lib/utils";
import type { ToolType } from "./types";

interface ProgressBarProps {
  tool: ToolType;
  progress: number; // 0-100
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  tool,
  progress,
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Framsteg</span>
          <span className="font-mono">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="tool-progress">
        <div
          className="tool-progress-bar"
          data-tool={tool}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
