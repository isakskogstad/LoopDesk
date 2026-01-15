"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3, Table2 } from "lucide-react";
import type { AnnualReport } from "@/lib/bolag";

interface FinancialChartCardProps {
  reports: AnnualReport[];
  title?: string;
}

export function FinancialChartCard({ reports, title = "Omsättning & Resultat" }: FinancialChartCardProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!reports || reports.length === 0) {
    return null;
  }

  // Prepare chart data - reverse to show oldest first
  const chartData = [...reports]
    .reverse()
    .map((report) => {
      const accounts = report.accounts || [];
      const revenue =
        accounts.find((a) => a.code === "SDI")?.amount ??
        accounts.find((a) => a.code === "NOS")?.amount;
      const profit =
        accounts.find((a) => a.code === "DR")?.amount ??
        accounts.find((a) => a.code === "ROR")?.amount;

      return {
        year: report.year.toString(),
        revenue: typeof revenue === "number" ? Math.round(revenue / 1000) : null,
        profit: typeof profit === "number" ? Math.round(profit / 1000) : null,
      };
    })
    .filter((d) => d.revenue !== null || d.profit !== null);

  if (chartData.length < 2) {
    return null;
  }

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)} Md`;
    }
    return `${value} MSEK`;
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">{title}</h3>
        <div className="chart-toggle-group">
          <button
            type="button"
            className={`chart-toggle-btn ${view === "chart" ? "active" : ""}`}
            onClick={() => setView("chart")}
            aria-label="Visa graf"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`chart-toggle-btn ${view === "table" ? "active" : ""}`}
            onClick={() => setView("table")}
            aria-label="Visa tabell"
          >
            <Table2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="chart-card-body">
        {view === "chart" ? (
          isMounted ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.9 0 0)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.5 0 0)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.5 0 0)", fontSize: 12 }}
                    tickFormatter={(value) => `${value}`}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${Number(value).toLocaleString("sv-SE")} MSEK`,
                      name === "revenue" ? "Omsättning" : "Resultat"
                    ]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e5e5",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      padding: "12px 16px",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="rect"
                    iconSize={12}
                    formatter={(value) => (
                      <span style={{ color: "#666", fontSize: "12px", marginLeft: "4px" }}>
                        {value === "revenue" ? "Omsättning" : "Resultat"}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="revenue"
                    name="revenue"
                    fill="#E63946"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                  <Bar
                    dataKey="profit"
                    name="profit"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationBegin={200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-pulse bg-secondary rounded-lg w-full h-full" />
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="financial-table w-full">
              <thead>
                <tr>
                  <th>År</th>
                  <th>Omsättning</th>
                  <th>Resultat</th>
                  <th>Marginal</th>
                </tr>
              </thead>
              <tbody>
                {[...chartData].reverse().map((row) => {
                  const margin = row.revenue && row.profit
                    ? ((row.profit / row.revenue) * 100).toFixed(1)
                    : "-";
                  return (
                    <tr key={row.year}>
                      <td className="font-medium">{row.year}</td>
                      <td className={row.revenue && row.revenue < 0 ? "text-red-600" : ""}>
                        {row.revenue !== null ? formatValue(row.revenue) : "-"}
                      </td>
                      <td className={row.profit && row.profit < 0 ? "text-red-600" : "text-emerald-600"}>
                        {row.profit !== null ? formatValue(row.profit) : "-"}
                      </td>
                      <td className={Number(margin) < 0 ? "text-red-600" : ""}>
                        {margin !== "-" ? `${margin}%` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
