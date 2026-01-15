"use client";

import { Play, X, Layers } from "lucide-react";

interface QueueStatusProps {
  count: number;
  parallelCount: number;
  onParallelChange: (count: number) => void;
  onStart: () => void;
  onClear: () => void;
}

export function QueueStatus({
  count,
  parallelCount,
  onParallelChange,
  onStart,
  onClear,
}: QueueStatusProps) {
  return (
    <div className="fixed bottom-4 right-4 w-64 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-2xl overflow-hidden z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#151515] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[#888]" />
          <span className="text-sm font-medium">Kö</span>
        </div>
        <span className="px-2 py-0.5 bg-[#6366f1]/20 text-[#6366f1] rounded text-xs font-medium">
          {count} i kö
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Parallel count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#888]">Parallella sökningar</span>
          <input
            type="number"
            min={1}
            max={30}
            value={parallelCount}
            onChange={(e) => onParallelChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
            className="w-14 px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-center focus:outline-none focus:border-[#6366f1]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg text-sm font-medium transition-colors"
          >
            <Play size={14} />
            Starta
          </button>
          <button
            onClick={onClear}
            className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-sm transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
