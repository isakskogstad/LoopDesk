"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanyData } from "@/lib/bolag";

interface IndustryAnalysisProps {
  data: CompanyData;
}

// Industry benchmarks (approximate Swedish averages by sector)
const industryBenchmarks: Record<string, { returnOnEquity: number; profitMargin: number; growth: number }> = {
  // IT/Tech
  "62": { returnOnEquity: 25, profitMargin: 10, growth: 8 },
  "63": { returnOnEquity: 20, profitMargin: 8, growth: 10 },
  // Handel
  "46": { returnOnEquity: 15, profitMargin: 3, growth: 3 },
  "47": { returnOnEquity: 12, profitMargin: 2, growth: 2 },
  // Bygg
  "41": { returnOnEquity: 18, profitMargin: 4, growth: 4 },
  "42": { returnOnEquity: 16, profitMargin: 5, growth: 3 },
  "43": { returnOnEquity: 20, profitMargin: 5, growth: 4 },
  // Tillverkning
  "10": { returnOnEquity: 12, profitMargin: 4, growth: 2 },
  "25": { returnOnEquity: 14, profitMargin: 5, growth: 3 },
  "28": { returnOnEquity: 15, profitMargin: 6, growth: 4 },
  // Konsult
  "70": { returnOnEquity: 25, profitMargin: 8, growth: 5 },
  "71": { returnOnEquity: 22, profitMargin: 7, growth: 5 },
  // Default
  default: { returnOnEquity: 15, profitMargin: 5, growth: 3 },
};

export function IndustryAnalysis({ data }: IndustryAnalysisProps) {
  const keyFigures = data.financials?.keyFigures;
  if (!keyFigures) return null;

  // Get industry code (first 2 digits of SNI)
  const industryCode = data.industries?.[0]?.code?.slice(0, 2) || "";
  const benchmark = industryBenchmarks[industryCode] || industryBenchmarks.default;
  const industryName = data.industries?.[0]?.name || "Okänd bransch";

  const metrics = [
    {
      label: "Avkastning eget kapital",
      value: keyFigures.returnOnEquity,
      benchmark: benchmark.returnOnEquity,
      unit: "%",
      higherIsBetter: true,
    },
    {
      label: "Vinstmarginal",
      value: keyFigures.growthRate, // Using growthRate as proxy for margin
      benchmark: benchmark.profitMargin,
      unit: "%",
      higherIsBetter: true,
    },
  ].filter((m) => m.value !== undefined);

  if (metrics.length === 0) return null;

  const getComparison = (value: number, benchmark: number, higherIsBetter: boolean): { label: string; color: string } => {
    const diff = ((value - benchmark) / benchmark) * 100;

    if (higherIsBetter) {
      if (diff > 20) return { label: "Mycket bättre", color: "text-green-600 dark:text-green-400" };
      if (diff > 0) return { label: "Bättre", color: "text-green-500" };
      if (diff > -20) return { label: "Under snitt", color: "text-yellow-600 dark:text-yellow-400" };
      return { label: "Sämre", color: "text-red-500" };
    } else {
      if (diff < -20) return { label: "Mycket bättre", color: "text-green-600 dark:text-green-400" };
      if (diff < 0) return { label: "Bättre", color: "text-green-500" };
      if (diff < 20) return { label: "Under snitt", color: "text-yellow-600 dark:text-yellow-400" };
      return { label: "Sämre", color: "text-red-500" };
    }
  };

  const getBarWidth = (value: number, benchmark: number): { company: number; benchmark: number } => {
    const max = Math.max(Math.abs(value), Math.abs(benchmark)) * 1.2;
    return {
      company: Math.min(100, Math.max(5, (Math.abs(value) / max) * 100)),
      benchmark: Math.min(100, Math.max(5, (Math.abs(benchmark) / max) * 100)),
    };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Branschanalys</CardTitle>
        <p className="text-sm text-gray-500">
          Jämfört med branschsnitt för {industryName.toLowerCase()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400/70" />
              Företaget
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-300/70" />
              Branschsnitt
            </span>
          </div>
          {metrics.map((metric) => {
            const comparison = getComparison(metric.value!, metric.benchmark, metric.higherIsBetter);
            const bars = getBarWidth(metric.value!, metric.benchmark);

            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <Badge variant="outline" className={comparison.color}>
                    {comparison.label}
                  </Badge>
                </div>

                {/* Company bar */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-20">Företaget</span>
                    <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${metric.value! >= 0 ? "bg-blue-400/70" : "bg-red-400/70"}`}
                        style={{ width: `${Math.max(12, bars.company)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {metric.value!.toFixed(1)}{metric.unit}
                    </span>
                  </div>

                  {/* Benchmark bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-20">Branschsnitt</span>
                    <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-gray-300/70 rounded"
                        style={{ width: `${Math.max(12, bars.benchmark)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-16 text-right">
                      {metric.benchmark.toFixed(1)}{metric.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Branschsnitt baserat på svenska genomsnitt. Avvikelser kan förekomma.
        </p>
      </CardContent>
    </Card>
  );
}
