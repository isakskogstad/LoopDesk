"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AnnualReport } from "@/lib/bolag";

interface RevenueChartProps {
  reports: AnnualReport[];
}

export function RevenueChart({ reports }: RevenueChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Early return if no reports or accounts
  if (!reports || reports.length === 0) {
    return null;
  }

  // Prepare chart data - reverse to show oldest first
  const chartData = [...reports]
    .reverse()
    .map((report) => {
      // Safely access accounts array
      const accounts = report.accounts || [];

      const revenue =
        accounts.find((a) => a.code === "SDI")?.amount ??
        accounts.find((a) => a.code === "NOS")?.amount;
      const profit =
        accounts.find((a) => a.code === "DR")?.amount ??
        accounts.find((a) => a.code === "ROR")?.amount;

      return {
        year: report.year,
        revenue: typeof revenue === "number" ? revenue / 1000 : null, // Convert to MSEK
        profit: typeof profit === "number" ? profit / 1000 : null,
      };
    })
    .filter((d) => d.revenue !== null || d.profit !== null);

  if (chartData.length < 2) {
    return null;
  }

  // Don't render chart until component is mounted to avoid Recharts dimension warnings
  if (!isMounted) {
    return (
      <div className="chart-container w-full h-72 flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-full" />
      </div>
    );
  }

  return (
    <div className="chart-container w-full h-72">
      <ResponsiveContainer width="100%" height={288} debounce={50}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "oklch(0.5 0 0)", fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
            dx={-8}
            width={50}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)} MSEK`]}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.9 0.01 250)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px -4px oklch(0.2 0.02 250 / 0.15)",
              padding: "12px 16px",
            }}
            labelStyle={{
              color: "oklch(0.3 0 0)",
              fontWeight: 600,
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "oklch(0.4 0 0)",
              fontSize: "14px",
            }}
            cursor={{ stroke: "oklch(0.8 0.02 250)", strokeDasharray: "4 4" }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: "12px",
              paddingBottom: "8px",
            }}
            formatter={(value) => (
              <span style={{ color: "oklch(0.4 0 0)", marginLeft: "4px" }}>
                {value}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Omsättning"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#3b82f6",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Resultat"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#profitGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#10b981",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
