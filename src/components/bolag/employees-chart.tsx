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
} from "recharts";
import type { AnnualReport } from "@/lib/bolag";

interface EmployeesChartProps {
  reports: AnnualReport[];
}

export function EmployeesChart({ reports }: EmployeesChartProps) {
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
      const employees = accounts.find((a) => a.code === "MOA")?.amount;

      return {
        year: report.year,
        employees: typeof employees === "number" ? employees : null,
      };
    })
    .filter((d) => d.employees !== null);

  if (chartData.length < 2) {
    return null;
  }

  if (!isMounted) {
    return (
      <div className="chart-container w-full h-72 flex items-center justify-center">
        <div className="animate-pulse bg-secondary dark:bg-gray-700 rounded-lg w-full h-full" />
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
            <linearGradient id="employeesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
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
            tickFormatter={(value) => value.toLocaleString("sv-SE")}
            dx={-8}
            width={50}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString("sv-SE")} anställda`]}
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
          <Area
            type="monotone"
            dataKey="employees"
            name="Anställda"
            stroke="#16a34a"
            strokeWidth={2.5}
            fill="url(#employeesGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#16a34a",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
