"use client";

import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  showTrend?: boolean;
  className?: string;
}

/**
 * Sparkline component for compact data visualization
 * Issue #17 - Add sparklines for data in list views
 */
export function Sparkline({
  data,
  width = 60,
  height = 24,
  showTrend = true,
  className = "",
}: SparklineProps) {
  const { normalizedData, trend, trendColor } = useMemo(() => {
    if (!data.length) return { normalizedData: [], trend: 0, trendColor: "neutral" };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const normalized = data.map((value) => ((value - min) / range) * 100);

    // Calculate trend (compare first half average to second half average)
    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid);
    const secondHalf = data.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trendValue = secondAvg - firstAvg;

    return {
      normalizedData: normalized,
      trend: trendValue,
      trendColor: trendValue > 0 ? "positive" : trendValue < 0 ? "negative" : "neutral",
    };
  }, [data]);

  if (!data.length) {
    return (
      <div
        className={`sparkline ${className}`}
        style={{ width, height }}
        aria-label="Ingen data"
      >
        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">
          —
        </div>
      </div>
    );
  }

  const barWidth = Math.max(2, (width - (data.length - 1)) / data.length);
  const gap = 1;

  return (
    <div
      className={`sparkline ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={`Sparkline visar ${data.length} datapunkter, trend: ${trend > 0 ? "uppåt" : trend < 0 ? "nedåt" : "stabil"}`}
    >
      {normalizedData.map((value, index) => {
        const isLast = index === normalizedData.length - 1;
        const barHeight = Math.max(2, (value / 100) * height);

        return (
          <div
            key={index}
            className={`sparkline-bar ${showTrend && isLast ? trendColor : ""}`}
            style={{
              width: barWidth,
              height: barHeight,
              marginLeft: index > 0 ? gap : 0,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Mini sparkline for inline use
 */
export function SparklineInline({
  value,
  previousValue,
  className = "",
}: {
  value: number;
  previousValue: number;
  className?: string;
}) {
  const change = value - previousValue;
  const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm ${className}`}
      title={`Förändring: ${isPositive ? "+" : ""}${percentChange.toFixed(1)}%`}
    >
      <span className={isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
        {isPositive ? "↑" : "↓"}
      </span>
      <span className="text-muted-foreground">
        {Math.abs(percentChange).toFixed(0)}%
      </span>
    </span>
  );
}
