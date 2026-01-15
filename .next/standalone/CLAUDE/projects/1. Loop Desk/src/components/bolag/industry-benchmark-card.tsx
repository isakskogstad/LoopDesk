"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, BarChart3, Award } from "lucide-react";
import { FinancialTerm } from "@/components/ui/tooltip";

// Extended industry benchmarks with more metrics and industry names
export const industryBenchmarks: Record<string, {
  name: string;
  returnOnEquity: number;
  profitMargin: number;
  solidityRatio: number;
  currentRatio: number;
  employeeGrowth: number;
}> = {
  "62": { name: "IT & Programmering", returnOnEquity: 25, profitMargin: 10, solidityRatio: 40, currentRatio: 1.8, employeeGrowth: 8 },
  "63": { name: "Data & IT-tjänster", returnOnEquity: 20, profitMargin: 8, solidityRatio: 35, currentRatio: 1.6, employeeGrowth: 6 },
  "46": { name: "Partihandel", returnOnEquity: 15, profitMargin: 3, solidityRatio: 30, currentRatio: 1.4, employeeGrowth: 2 },
  "47": { name: "Detaljhandel", returnOnEquity: 12, profitMargin: 2, solidityRatio: 25, currentRatio: 1.2, employeeGrowth: 1 },
  "41": { name: "Byggverksamhet", returnOnEquity: 18, profitMargin: 4, solidityRatio: 28, currentRatio: 1.3, employeeGrowth: 3 },
  "43": { name: "Specialiserad bygg", returnOnEquity: 20, profitMargin: 5, solidityRatio: 32, currentRatio: 1.5, employeeGrowth: 4 },
  "70": { name: "Konsulttjänster", returnOnEquity: 25, profitMargin: 8, solidityRatio: 38, currentRatio: 1.7, employeeGrowth: 5 },
  "64": { name: "Finansiella tjänster", returnOnEquity: 15, profitMargin: 20, solidityRatio: 45, currentRatio: 2.0, employeeGrowth: 3 },
  "68": { name: "Fastighetsverksamhet", returnOnEquity: 10, profitMargin: 25, solidityRatio: 35, currentRatio: 1.5, employeeGrowth: 2 },
  "25": { name: "Tillverkning av metallvaror", returnOnEquity: 14, profitMargin: 5, solidityRatio: 35, currentRatio: 1.6, employeeGrowth: 2 },
  "10": { name: "Livsmedelsproduktion", returnOnEquity: 12, profitMargin: 4, solidityRatio: 30, currentRatio: 1.4, employeeGrowth: 1 },
  "default": { name: "Övriga branscher", returnOnEquity: 15, profitMargin: 5, solidityRatio: 30, currentRatio: 1.5, employeeGrowth: 3 },
};

interface KeyFigures {
  returnOnEquity?: number;
  returnOnAssets?: number;
  profitMargin?: number;
  growthRate?: number;
  solidityRatio?: number;
  currentRatio?: number;
  ebitda?: number;
}

interface IndustryBenchmarkCardProps {
  keyFigures: KeyFigures;
  industryCode?: string;
  industryName?: string;
  employees?: number;
  previousEmployees?: number;
}

function getPerformanceLevel(value: number | undefined, benchmark: number): {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof TrendingUp;
  percentile: string;
} {
  if (value === undefined) {
    return { label: "Data saknas", color: "text-muted-foreground", bgColor: "bg-secondary", icon: Minus, percentile: "-" };
  }

  const diff = ((value - benchmark) / benchmark) * 100;

  if (diff > 50) return { label: "Utmärkt", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", icon: Award, percentile: "Topp 10%" };
  if (diff > 20) return { label: "Mycket bra", color: "text-emerald-500 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", icon: TrendingUp, percentile: "Topp 25%" };
  if (diff > 0) return { label: "Över snitt", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/20", icon: TrendingUp, percentile: "Över medel" };
  if (diff > -20) return { label: "Genomsnitt", color: "text-muted-foreground", bgColor: "bg-secondary", icon: Minus, percentile: "Genomsnitt" };
  return { label: "Under snitt", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-900/20", icon: TrendingDown, percentile: "Under medel" };
}

export function IndustryBenchmarkCard({
  keyFigures,
  industryCode,
  industryName,
  employees,
  previousEmployees,
}: IndustryBenchmarkCardProps) {
  const code = industryCode?.slice(0, 2) || "";
  const benchmark = industryBenchmarks[code] || industryBenchmarks.default;

  const employeeGrowth = employees && previousEmployees && previousEmployees > 0
    ? ((employees - previousEmployees) / previousEmployees) * 100
    : undefined;

  const metrics = [
    {
      label: "Avkastning EK",
      term: "Avkastning EK",
      value: keyFigures.returnOnEquity,
      benchmark: benchmark.returnOnEquity,
      format: (v: number) => `${v.toFixed(1)}%`,
      benchmarkFormat: (v: number) => `${v}%`,
    },
    {
      label: "Vinstmarginal",
      term: "Vinstmarginal",
      value: keyFigures.profitMargin,
      benchmark: benchmark.profitMargin,
      format: (v: number) => `${v.toFixed(1)}%`,
      benchmarkFormat: (v: number) => `${v}%`,
    },
    {
      label: "Soliditet",
      term: "Soliditet",
      value: keyFigures.solidityRatio,
      benchmark: benchmark.solidityRatio,
      format: (v: number) => `${v.toFixed(1)}%`,
      benchmarkFormat: (v: number) => `${v}%`,
    },
    {
      label: "Likviditet",
      term: "Likviditet",
      value: keyFigures.currentRatio,
      benchmark: benchmark.currentRatio,
      format: (v: number) => v.toFixed(2),
      benchmarkFormat: (v: number) => v.toFixed(1),
    },
  ].filter(m => m.value !== undefined);

  if (metrics.length === 0) return null;

  // Calculate overall score
  const scores = metrics.map(m => {
    if (m.value === undefined) return 50;
    const diff = ((m.value - m.benchmark) / m.benchmark) * 100;
    return Math.min(100, Math.max(0, 50 + diff));
  });
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const getOverallGrade = (score: number): { grade: string; color: string; label: string } => {
    if (score >= 80) return { grade: "A", color: "text-emerald-500", label: "Utmärkt finansiell hälsa" };
    if (score >= 65) return { grade: "B", color: "text-blue-500", label: "God finansiell hälsa" };
    if (score >= 50) return { grade: "C", color: "text-muted-foreground", label: "Genomsnittlig hälsa" };
    if (score >= 35) return { grade: "D", color: "text-amber-500", label: "Behöver förbättring" };
    return { grade: "F", color: "text-red-500", label: "Svag finansiell hälsa" };
  };

  const overallGrade = getOverallGrade(overallScore);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-title flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Branschjämförelse
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            SNI {code || "N/A"}
          </Badge>
        </div>
        {(industryName || benchmark.name) && (
          <p className="text-sm text-muted-foreground mt-1">
            Jämförelse med {industryName || benchmark.name}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 dark:from-gray-800/80 dark:to-gray-800/40 border border-border dark:border-gray-700">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Totalbetyg</p>
            <p className={`text-sm font-medium ${overallGrade.color}`}>{overallGrade.label}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-4xl font-bold ${overallGrade.color}`}>
              {overallGrade.grade}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{overallScore}</div>
              <div className="text-xs text-muted-foreground">av 100</div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => {
            const perf = getPerformanceLevel(metric.value, metric.benchmark);
            const Icon = perf.icon;
            const percent = metric.value !== undefined
              ? Math.min(100, Math.max(5, (metric.value / (metric.benchmark * 2)) * 100))
              : 0;

            return (
              <div
                key={metric.label}
                className={`p-4 rounded-xl border border-border dark:border-gray-700 transition-all hover:shadow-md ${perf.bgColor}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <FinancialTerm term={metric.term} className="text-xs text-muted-foreground">
                      {metric.label}
                    </FinancialTerm>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {metric.value !== undefined ? metric.format(metric.value) : "-"}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${perf.bgColor}`}>
                    <Icon className={`h-4 w-4 ${perf.color}`} />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 bg-secondary dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`absolute h-full rounded-full transition-all duration-500 ${
                      percent > 50 ? "bg-emerald-500" : percent > 30 ? "bg-blue-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                  {/* Benchmark marker */}
                  <div
                    className="absolute h-full w-0.5 bg-foreground/30"
                    style={{ left: "50%" }}
                    title={`Branschsnitt: ${metric.benchmarkFormat(metric.benchmark)}`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${perf.color}`}>{perf.percentile}</span>
                  <span className="text-muted-foreground">
                    Snitt: {metric.benchmarkFormat(metric.benchmark)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Employee growth comparison */}
        {employeeGrowth !== undefined && (
          <div className="pt-4 border-t border-border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Personaltillväxt</p>
                <p className={`text-lg font-bold ${
                  employeeGrowth > 0 ? "text-emerald-600 dark:text-emerald-400" :
                  employeeGrowth < 0 ? "text-red-500" : "text-foreground"
                }`}>
                  {employeeGrowth > 0 ? "+" : ""}{employeeGrowth.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Branschsnitt</p>
                <p className="text-sm text-muted-foreground">{benchmark.employeeGrowth}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
