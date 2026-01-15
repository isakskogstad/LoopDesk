"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SparklineChart } from "./sparkline-chart";
import { cn } from "@/lib/utils";

interface FinancialMetric {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  sparklineData?: number[];
  sparklineColor?: "primary" | "success" | "warning";
}

interface FinancialSummaryCardProps {
  title: string;
  subtitle?: string;
  metrics: FinancialMetric[];
  className?: string;
}

export function FinancialSummaryCard({
  title,
  subtitle,
  metrics,
  className,
}: FinancialSummaryCardProps) {
  return (
    <div className={cn("summary-card", className)}>
      <div className="mb-4">
        <h3 className="text-title text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="summary-item !border-b-0 !py-3 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-label mb-1">{metric.label}</div>
                <div className={cn(
                  "text-value-lg",
                  metric.trend === "up" && "text-emerald-600 dark:text-emerald-400",
                  metric.trend === "down" && "text-red-600 dark:text-red-400"
                )}>
                  {metric.value}
                </div>
              </div>
              {metric.trend && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  metric.trend === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  metric.trend === "down" && "bg-red-500/10 text-red-600 dark:text-red-400",
                  metric.trend === "neutral" && "bg-muted text-muted-foreground"
                )}>
                  {metric.trend === "up" && <TrendingUp className="w-3 h-3" />}
                  {metric.trend === "down" && <TrendingDown className="w-3 h-3" />}
                  {metric.trend === "neutral" && <Minus className="w-3 h-3" />}
                  {metric.trendLabel && <span>{metric.trendLabel}</span>}
                </div>
              )}
            </div>

            {metric.sparklineData && metric.sparklineData.length >= 2 && (
              <SparklineChart
                data={metric.sparklineData}
                color={metric.sparklineColor || "primary"}
                height={36}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
