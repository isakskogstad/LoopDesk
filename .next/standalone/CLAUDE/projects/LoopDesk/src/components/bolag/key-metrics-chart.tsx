"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface KeyMetricsChartProps {
  returnOnEquity?: number;
  returnOnAssets?: number;
  profitMargin?: number;
}

const COLORS = ["#E63946", "#16a34a", "#f59e0b"];

export function KeyMetricsChart({
  returnOnEquity = 0,
  returnOnAssets = 0,
  profitMargin = 0,
}: KeyMetricsChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = [
    { name: "ROE", value: Math.max(0, returnOnEquity), label: `${returnOnEquity.toFixed(1)}%` },
    { name: "ROA", value: Math.max(0, returnOnAssets), label: `${returnOnAssets.toFixed(1)}%` },
    { name: "Vinstmarginal", value: Math.max(0, profitMargin), label: `${profitMargin.toFixed(1)}%` },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">Inga nyckeltal tillgängliga</p>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse bg-secondary rounded-full w-48 h-48" />
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.9 0.01 250)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px -4px oklch(0.2 0.02 250 / 0.15)",
              padding: "12px 16px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={10}
            formatter={(value, entry) => (
              <span style={{ color: "oklch(0.4 0 0)", fontSize: "12px", marginLeft: "4px" }}>
                {value}: {(entry.payload as { label?: string })?.label || ""}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
