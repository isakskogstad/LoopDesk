"use client";

import { useMemo } from "react";
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ShareholderData {
  name: string;
  orgNumber?: string;
  shares: number;
  votes?: number;
  sharePercentage?: number;
  presentAtMeeting?: boolean;
}

interface ShareholderChartProps {
  shareholders: ShareholderData[];
  previousShareholders?: ShareholderData[];
  maxDisplay?: number;
}

// Colors for pie chart segments
const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-orange-500",
];

const COLORS_HEX = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#a855f7",
  "#f43f5e",
  "#06b6d4",
  "#6366f1",
  "#f97316",
];

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}k`;
  }
  return num.toLocaleString("sv-SE");
}

function formatPercentage(pct: number | undefined): string {
  if (pct === undefined) return "–";
  return `${pct.toFixed(1)}%`;
}

// SVG arc path generator - defined outside component
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
    "Z",
  ].join(" ");
}

export function ShareholderChart({
  shareholders,
  previousShareholders,
  maxDisplay = 6,
}: ShareholderChartProps) {
  // Calculate percentages if not provided
  const shareholdersWithPct = useMemo(() => {
    if (!shareholders?.length) return [];
    const totalShares = shareholders.reduce((sum, s) => sum + s.shares, 0);
    return shareholders.map((s) => ({
      ...s,
      sharePercentage: s.sharePercentage ?? (totalShares > 0 ? (s.shares / totalShares) * 100 : 0),
    }));
  }, [shareholders]);

  // Sort by shares descending
  const sortedShareholders = useMemo(
    () => [...shareholdersWithPct].sort((a, b) => b.shares - a.shares),
    [shareholdersWithPct]
  );

  // Take top N and group rest as "Others"
  const displayData = useMemo(() => {
    if (sortedShareholders.length <= maxDisplay) {
      return sortedShareholders;
    }

    const top = sortedShareholders.slice(0, maxDisplay - 1);
    const rest = sortedShareholders.slice(maxDisplay - 1);
    const othersShares = rest.reduce((sum, s) => sum + s.shares, 0);
    const othersPct = rest.reduce((sum, s) => sum + (s.sharePercentage || 0), 0);

    return [
      ...top,
      {
        name: `${rest.length} övriga`,
        shares: othersShares,
        sharePercentage: othersPct,
      },
    ];
  }, [sortedShareholders, maxDisplay]);

  // Find changes compared to previous shareholders
  const changes = useMemo(() => {
    if (!previousShareholders?.length) return null;

    const prevMap = new Map(previousShareholders.map((s) => [s.name, s.shares]));
    const currentMap = new Map(shareholdersWithPct.map((s) => [s.name, s.shares]));

    const newOwners = shareholdersWithPct.filter((s) => !prevMap.has(s.name));
    const exitedOwners = previousShareholders.filter((s) => !currentMap.has(s.name));
    const changedOwners = shareholdersWithPct.filter((s) => {
      const prev = prevMap.get(s.name);
      return prev !== undefined && prev !== s.shares;
    });

    return { newOwners, exitedOwners, changedOwners };
  }, [shareholdersWithPct, previousShareholders]);

  // Calculate pie chart segments using reduce to avoid mutation
  const pieSegments = useMemo(() => {
    const result: Array<{
      name: string;
      shares: number;
      sharePercentage?: number;
      startAngle: number;
      endAngle: number;
      color: string;
    }> = [];

    displayData.reduce((currentAngle, s, i) => {
      const pct = s.sharePercentage || 0;
      const endAngle = currentAngle + (pct / 100) * 360;
      result.push({
        ...s,
        startAngle: currentAngle,
        endAngle,
        color: COLORS_HEX[i % COLORS_HEX.length],
      });
      return endAngle;
    }, 0);

    return result;
  }, [displayData]);

  // Early return AFTER all hooks
  if (!shareholders?.length) {
    return null;
  }

  return (
    <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Ägarstruktur</span>
        <span className="text-xs text-muted-foreground">
          ({shareholders.length} ägare)
        </span>
      </div>

      <div className="flex gap-6">
        {/* Pie chart */}
        <div className="flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {pieSegments.map((segment, i) => (
              <path
                key={i}
                d={describeArc(60, 60, 55, segment.startAngle, segment.endAngle)}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
            {/* Center hole for donut chart effect */}
            <circle cx="60" cy="60" r="30" fill="var(--background)" />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {displayData.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div
                className={`w-3 h-3 rounded-sm flex-shrink-0 ${COLORS[i % COLORS.length]}`}
              />
              <span className="truncate flex-1" title={s.name}>
                {s.name}
              </span>
              <span className="text-muted-foreground font-mono text-xs flex-shrink-0">
                {formatPercentage(s.sharePercentage)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Changes indicator */}
      {changes && (changes.newOwners.length > 0 || changes.exitedOwners.length > 0) && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Ägarförändringar
          </div>
          <div className="space-y-1">
            {changes.newOwners.slice(0, 3).map((owner, i) => (
              <div key={`new-${i}`} className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  {owner.name}
                </span>
                <span className="text-muted-foreground">
                  +{formatNumber(owner.shares)} aktier
                </span>
              </div>
            ))}
            {changes.exitedOwners.slice(0, 3).map((owner, i) => (
              <div key={`exit-${i}`} className="flex items-center gap-2 text-xs">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-red-600 dark:text-red-400">
                  {owner.name}
                </span>
                <span className="text-muted-foreground">lämnade</span>
              </div>
            ))}
            {changes.changedOwners.slice(0, 2).map((owner, i) => (
              <div key={`change-${i}`} className="flex items-center gap-2 text-xs">
                <Minus className="w-3 h-3 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">
                  {owner.name}
                </span>
                <span className="text-muted-foreground">ändrade innehav</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
