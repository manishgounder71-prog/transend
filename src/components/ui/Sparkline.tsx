"use client";

import React from "react";

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
  width?: number;
  fillOpacity?: number;
  strokeWidth?: number;
}

/**
 * Mini sparkline SVG chart — renders a trend line with gradient fill.
 * Used across DashboardModule, ReleasePredictor, and GamificationPanel.
 */
export const Sparkline = React.memo(function Sparkline({
  data,
  color,
  height = 28,
  width = 80,
  fillOpacity = 0.3,
  strokeWidth = 1.5,
}: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const gradientId = `spark-fill-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      className="flex-shrink-0"
      role="img"
      aria-label={`Sparkline chart showing trend from ${data[0]} to ${data[data.length - 1]}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
