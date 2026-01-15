"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface SparklineChartProps {
  data: number[];
  color?: "primary" | "success" | "warning";
  height?: number;
}

const colorMap = {
  primary: "#E63946",
  success: "#16a34a",
  warning: "#f59e0b",
};

export function SparklineChart({
  data,
  color = "primary",
  height = 40
}: SparklineChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!data || data.length < 2) {
    return null;
  }

  const chartData = data.map((value, index) => ({ value, index }));
  const strokeColor = colorMap[color];

  if (!isMounted) {
    return <div className="w-full" style={{ height }} />;
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`sparkline-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#sparkline-${color})`}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
