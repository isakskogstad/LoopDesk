"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/bolag/breadcrumbs";
import {
  Building2,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Users,
  Calendar,
  MapPin,
  BarChart3,
  Trophy,
  Target,
  Zap,
} from "lucide-react";
import type { CompanyData } from "@/lib/bolag";

// Color palette for companies in charts
const COMPANY_COLORS = [
  { bg: "bg-blue-500", text: "text-blue-600", hex: "#3b82f6", light: "bg-blue-100 dark:bg-blue-900/30" },
  { bg: "bg-emerald-500", text: "text-emerald-600", hex: "#10b981", light: "bg-emerald-100 dark:bg-emerald-900/30" },
  { bg: "bg-purple-500", text: "text-purple-600", hex: "#8b5cf6", light: "bg-purple-100 dark:bg-purple-900/30" },
];

// Radar chart component for visual comparison
function RadarChart({ companies, metrics }: { companies: CompanyData[]; metrics: { label: string; getValue: (d: CompanyData) => number | undefined }[] }) {
  const size = 280;
  const center = size / 2;
  const radius = 100;
  const levels = 5;

  // Normalize values to 0-100 scale
  const normalizedData = useMemo(() => {
    return metrics.map((metric) => {
      const values = companies.map((c) => metric.getValue(c) ?? 0);
      const max = Math.max(...values, 1);
      const min = Math.min(...values.filter((v) => v !== 0), 0);
      return {
        label: metric.label,
        values: values.map((v) => ((v - min) / (max - min || 1)) * 100),
        rawValues: values,
      };
    });
  }, [companies, metrics]);

  const angleStep = (Math.PI * 2) / metrics.length;

  const getPoint = (angle: number, distance: number) => ({
    x: center + Math.cos(angle - Math.PI / 2) * distance,
    y: center + Math.sin(angle - Math.PI / 2) * distance,
  });

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background circles */}
        {Array.from({ length: levels }).map((_, i) => (
          <circle
            key={`level-${i}`}
            cx={center}
            cy={center}
            r={(radius / levels) * (i + 1)}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            className="text-muted-foreground"
          />
        ))}

        {/* Axis lines and labels */}
        {metrics.map((metric, i) => {
          const angle = angleStep * i;
          const labelPoint = getPoint(angle, radius + 40);

          return (
            <g key={`axis-${metric.label}`}>
              <line
                x1={center}
                y1={center}
                x2={getPoint(angle, radius).x}
                y2={getPoint(angle, radius).y}
                stroke="currentColor"
                strokeOpacity={0.2}
                className="text-muted-foreground"
              />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {metric.label}
              </text>
            </g>
          );
        })}

        {/* Company polygons */}
        {companies.map((company, companyIdx) => {
          const points = normalizedData.map((data, metricIdx) => {
            const angle = angleStep * metricIdx;
            const value = (data.values[companyIdx] / 100) * radius;
            return getPoint(angle, value);
          });

          const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

          return (
            <g key={company.basic.orgNr}>
              <path
                d={pathD}
                fill={COMPANY_COLORS[companyIdx].hex}
                fillOpacity={0.15}
                stroke={COMPANY_COLORS[companyIdx].hex}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {points.map((p, i) => (
                <circle
                  key={`point-${company.basic.orgNr}-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill={COMPANY_COLORS[companyIdx].hex}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Bar comparison chart
function BarComparisonChart({ companies, label, values }: { companies: CompanyData[]; label: string; values: number[] }) {
  const max = Math.max(...values.filter((v) => !isNaN(v)), 1);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1.5">
        {companies.map((company, i) => {
          const value = values[i];
          const width = isNaN(value) ? 0 : (Math.abs(value) / max) * 100;
          const isNegative = value < 0;

          return (
            <div key={company.basic.orgNr} className="flex items-center gap-2">
              <div className="w-16 text-xs text-muted-foreground truncate">
                {company.basic.name.slice(0, 8)}...
              </div>
              <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden relative">
                <div
                  className={`absolute h-full rounded-full transition-all duration-500 ${
                    isNegative ? "bg-red-500" : COMPANY_COLORS[i].bg
                  }`}
                  style={{ width: `${width}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className={`text-xs font-medium ${width > 50 ? "text-white" : "text-foreground"}`}>
                    {isNaN(value) ? "-" : value.toLocaleString("sv-SE")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper functions outside component to avoid hook dependency issues
const formatAmount = (value: string | number | undefined): string => {
  if (!value) return "-";
  let num: number;
  if (typeof value === "number") {
    num = value;
  } else {
    num = parseInt(value.replace(/\D/g, ""), 10);
  }
  if (isNaN(num)) return String(value);
  if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(0)} MSEK`;
  return `${num} TSEK`;
};

const formatOrgNr = (orgNr: string) => {
  const clean = orgNr.replace(/\D/g, "");
  if (clean.length === 10) return `${clean.slice(0, 6)}-${clean.slice(6)}`;
  return orgNr;
};

const getKeyFigure = (data: CompanyData, key: string): number | undefined => {
  const kf = data.financials?.keyFigures;
  if (!kf) return undefined;
  return kf[key as keyof typeof kf] as number | undefined;
};

const getNumericValue = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const num = parseFloat(value.replace(/[^\d.-]/g, ""));
  return isNaN(num) ? 0 : num;
};

const getEmployeesNumeric = (d: CompanyData): number => {
  const emp = d.financials?.employees;
  if (typeof emp === 'number') return emp;
  if (typeof emp === 'string') {
    const num = parseInt(emp, 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const findBest = (values: (number | undefined)[]): number => {
  const valid = values.filter((v): v is number => v !== undefined);
  if (valid.length === 0) return -1;
  return values.indexOf(Math.max(...valid));
};

function CompareContent() {
  const searchParams = useSearchParams();
  const companiesParam = searchParams.get("companies");
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "visual">("visual");

  // Define metrics array with useMemo to avoid recreation every render
  const metrics = useMemo(() => [
    { label: "Omsättning", key: "revenue", getValue: (d: CompanyData) => formatAmount(d.financials?.revenue), getNumeric: (d: CompanyData) => getNumericValue(d.financials?.revenue), unit: "TSEK" },
    { label: "Resultat", key: "profit", getValue: (d: CompanyData) => formatAmount(d.financials?.profit), getNumeric: (d: CompanyData) => getNumericValue(d.financials?.profit), unit: "TSEK" },
    { label: "Anställda", key: "employees", getValue: (d: CompanyData) => d.financials?.employees?.toString() || "-", getNumeric: (d: CompanyData) => getEmployeesNumeric(d), unit: "st" },
    { label: "EBITDA", key: "ebitda", getValue: (d: CompanyData) => { const v = getKeyFigure(d, "ebitda"); return v ? `${(v / 1000).toFixed(0)} MSEK` : "-"; }, getNumeric: (d: CompanyData) => getKeyFigure(d, "ebitda") ?? 0, unit: "TSEK" },
    { label: "Avkastning EK", key: "returnOnEquity", getValue: (d: CompanyData) => { const v = getKeyFigure(d, "returnOnEquity"); return v ? `${v.toFixed(1)}%` : "-"; }, getNumeric: (d: CompanyData) => getKeyFigure(d, "returnOnEquity") ?? 0, unit: "%" },
    { label: "Tillväxt", key: "growthRate", getValue: (d: CompanyData) => { const v = getKeyFigure(d, "growthRate"); return v ? `${v >= 0 ? "+" : ""}${v.toFixed(1)}%` : "-"; }, getNumeric: (d: CompanyData) => getKeyFigure(d, "growthRate") ?? 0, unit: "%" },
    { label: "Soliditet", key: "solidityRatio", getValue: (d: CompanyData) => { const v = getKeyFigure(d, "solidityRatio"); return v ? `${v.toFixed(1)}%` : "-"; }, getNumeric: (d: CompanyData) => getKeyFigure(d, "solidityRatio") ?? 0, unit: "%" },
  ], []);

  const radarMetrics: { label: string; getValue: (d: CompanyData) => number | undefined }[] = useMemo(() => [
    { label: "Omsättning", getValue: (d: CompanyData) => getNumericValue(d.financials?.revenue) },
    { label: "Resultat", getValue: (d: CompanyData) => getNumericValue(d.financials?.profit) },
    { label: "Anställda", getValue: (d: CompanyData) => getEmployeesNumeric(d) },
    { label: "Avkastning", getValue: (d: CompanyData) => getKeyFigure(d, "returnOnEquity") ?? 0 },
    { label: "Tillväxt", getValue: (d: CompanyData) => getKeyFigure(d, "growthRate") ?? 0 },
  ], []);

  // Calculate winners for each metric
  const winners = useMemo(() => {
    if (companies.length === 0) return {};
    const result: { [key: string]: number } = {};
    metrics.forEach((metric) => {
      const values: (number | undefined)[] = companies.map((c) => metric.getNumeric(c));
      const maxIdx = findBest(values);
      if (maxIdx >= 0) {
        result[metric.key] = maxIdx;
      }
    });
    return result;
  }, [companies, metrics]);

  // Count wins per company
  const winsPerCompany = useMemo(() => {
    if (companies.length === 0) return [];
    const counts: number[] = companies.map(() => 0);
    Object.values(winners).forEach((idx) => {
      if (idx >= 0 && idx < counts.length) {
        counts[idx]++;
      }
    });
    return counts;
  }, [winners, companies]);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!companiesParam) return;

      const orgNrs = companiesParam.split(",").slice(0, 3);
      setLoading(true);

      const results = await Promise.all(
        orgNrs.map(async (orgNr) => {
          try {
            const res = await fetch(`/api/bolag/company/${orgNr}`);
            if (res.ok) return res.json();
            return null;
          } catch {
            return null;
          }
        })
      );

      setCompanies(results.filter(Boolean));
      setLoading(false);
    };

    fetchCompanies();
  }, [companiesParam]);

  const infoFields = [
    { label: "Grundat", icon: Calendar, getValue: (d: CompanyData) => d.basic.foundationYear || "-" },
    { label: "Bransch", icon: Building2, getValue: (d: CompanyData) => d.industries?.[0]?.name || "-" },
    { label: "Ort", icon: MapPin, getValue: (d: CompanyData) => d.location?.municipality || d.domicile?.municipality || "-" },
    { label: "VD", icon: Users, getValue: (d: CompanyData) => d.people?.ceo?.name || "-" },
  ];

  const getTrendIcon = (current: number | undefined, isProfit: boolean = false) => {
    if (current === undefined) return <Minus className="w-3 h-3 text-muted-foreground" />;
    if (isProfit && current < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <TrendingUp className="w-3 h-3 text-emerald-500" />;
  };

  if (!companiesParam) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
            <Scale className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Inga företag valda</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Välj upp till 3 företag att jämföra genom att klicka på jämförelseknappen på bolagssidan.
          </p>
          <Link href="/bolag">
            <Button className="gap-2">
              <Building2 className="w-4 h-4" />
              Sök företag
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={`compare-skeleton-${n}`}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "visual" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("visual")}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Visuell
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="gap-2"
          >
            <Scale className="w-4 h-4" />
            Tabell
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {companies.map((company, i) => (
            <div key={company.basic.orgNr} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${COMPANY_COLORS[i].bg}`} />
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {company.basic.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Company Headers with Win Counts */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company, i) => (
          <Card
            key={company.basic.orgNr}
            className={`group transition-all ${COMPANY_COLORS[i].light} border-2 ${
              winsPerCompany[i] === Math.max(...winsPerCompany)
                ? "border-amber-400 dark:border-amber-500"
                : "border-transparent"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${COMPANY_COLORS[i].bg}`} />
                    <Link href={`/bolag/${company.basic.orgNr}`} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <CardTitle className="text-lg truncate">{company.basic.name}</CardTitle>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{formatOrgNr(company.basic.orgNr)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={company.basic.status.active ? "default" : "secondary"}
                    className={company.basic.status.active ? "bg-emerald-500/90 hover:bg-emerald-500 shrink-0" : "shrink-0"}
                  >
                    {company.basic.status.active ? "Aktiv" : company.basic.status.status}
                  </Badge>
                  {winsPerCompany[i] > 0 && (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{winsPerCompany[i]} vinster</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick info */}
              <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
                {infoFields.slice(0, 3).map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.label} className="flex items-center gap-2 text-sm">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{field.label}:</span>
                      <span className="font-medium text-foreground truncate">{field.getValue(company)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Link to full profile */}
              <Link
                href={`/bolag/${company.basic.orgNr}`}
                className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Visa fullständig profil
                <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
          </Card>
        ))}
      </div>

      {viewMode === "visual" ? (
        <>
          {/* Radar Chart */}
          <Card>
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <CardTitle>Övergripande jämförelse</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Visualisering av relativa styrkor inom olika områden
              </p>
            </CardHeader>
            <CardContent className="py-6">
              <RadarChart companies={companies} metrics={radarMetrics} />
            </CardContent>
          </Card>

          {/* Bar Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {metrics.slice(0, 6).map((metric) => (
              <Card key={metric.key}>
                <CardContent className="p-4">
                  <BarComparisonChart
                    companies={companies}
                    label={metric.label}
                    values={companies.map((c) => metric.getNumeric(c) ?? 0)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        /* Table View */
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Nyckeltalsjämförelse</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="financial-table w-full">
                <thead>
                  <tr>
                    <th className="w-40">Nyckeltal</th>
                    {companies.map((c, i) => (
                      <th key={c.basic.orgNr}>
                        <div className="flex items-center justify-end gap-2">
                          <div className={`w-2 h-2 rounded-full ${COMPANY_COLORS[i].bg}`} />
                          <span className="hidden sm:inline">{c.basic.name.length > 20 ? `${c.basic.name.slice(0, 20)}...` : c.basic.name}</span>
                          <span className="sm:hidden">{c.basic.name.length > 10 ? `${c.basic.name.slice(0, 10)}...` : c.basic.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => {
                    const values: (number | undefined)[] = companies.map((c) => metric.getNumeric(c));
                    const bestIdx = findBest(values);

                    return (
                      <tr key={metric.label}>
                        <td className="font-medium">{metric.label}</td>
                        {companies.map((c, i) => {
                          const value = metric.getValue(c);
                          const numericValue = values[i] ?? 0;
                          const isBest = bestIdx === i && numericValue !== 0;
                          const isNegative = value.startsWith("-") || value.startsWith("−");

                          return (
                            <td
                              key={c.basic.orgNr}
                              className={`${
                                isBest ? "text-emerald-600 dark:text-emerald-400 font-semibold" :
                                isNegative ? "text-red-600 dark:text-red-400" : ""
                              }`}
                            >
                              <div className="flex items-center justify-end gap-1.5">
                                {metric.key === "profit" && numericValue !== 0 && getTrendIcon(numericValue, true)}
                                {metric.key === "growthRate" && numericValue !== 0 && getTrendIcon(numericValue)}
                                {value}
                                {isBest && <span className="text-xs ml-1">🏆</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-foreground">Sammanfattning</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {companies.map((company, i) => {
              const winningMetrics = Object.entries(winners)
                .filter(([_, idx]) => idx === i)
                .map(([key]) => metrics.find((m) => m.key === key)?.label || key);

              return (
                <div key={company.basic.orgNr} className="p-4 rounded-lg bg-white/60 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${COMPANY_COLORS[i].bg}`} />
                    <span className="font-medium text-sm truncate">{company.basic.name}</span>
                  </div>
                  {winningMetrics.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {winningMetrics.map((metric) => (
                        <Badge key={metric} variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                          🏆 {metric}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Inga toppnoteringar</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Comparison */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg">Status & Flaggor</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${companies.length}, 1fr)` }}>
            {companies.map((company, i) => (
              <div key={company.basic.orgNr} className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${COMPANY_COLORS[i].bg}`} />
                  <p className="text-sm font-medium text-muted-foreground truncate">{company.basic.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.flags?.paymentRemarks && (
                    <Badge variant="destructive" className="gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      Betalningsanmärkningar
                    </Badge>
                  )}
                  {company.flags?.gaselle && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
                      ⭐ Gasellföretag
                    </Badge>
                  )}
                  {company.flags?.vatRegistered && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700">
                      Momsregistrerad
                    </Badge>
                  )}
                  {company.flags?.registeredForPayrollTax && (
                    <Badge variant="outline">Arbetsgivaravgift</Badge>
                  )}
                  {company.flags?.mortgages && (
                    <Badge variant="secondary" className="text-amber-700 dark:text-amber-400">
                      Företagsinteckningar
                    </Badge>
                  )}
                  {!company.flags?.paymentRemarks && !company.flags?.gaselle && !company.flags?.vatRegistered && !company.flags?.registeredForPayrollTax && !company.flags?.mortgages && (
                    <span className="text-sm text-muted-foreground/70 italic">Inga särskilda flaggor</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Back link */}
      <div className="flex justify-center pt-4">
        <Link href="/bolag">
          <Button variant="outline" className="gap-2">
            <Building2 className="w-4 h-4" />
            Sök fler företag
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="page-wrapper page-content max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Hem", href: "/" },
            { label: "Bolag", href: "/bolag" },
            { label: "Jämför" },
          ]}
        />

        <header className="page-header">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-display">Jämför företag</h1>
          </div>
          <p className="text-muted-foreground">
            Jämför nyckeltal och information sida vid sida med interaktiva visualiseringar
          </p>
        </header>

        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <CompareContent />
        </Suspense>
      </div>
    </main>
  );
}
