"use client";

import React from "react";

interface GlowGaugeProps {
  value: number;
  label: string;
  sublabel: string;
  color: string;
  icon: React.ElementType;
  size?: number;
}

/**
 * Circular gauge with an SVG ring and glow effect.
 * Displays a percentage value with label and sublabel beneath.
 */
export const GlowGauge = React.memo(function GlowGauge({
  value,
  label,
  sublabel,
  color,
  icon: Icon,
  size = 70,
}: GlowGaugeProps) {
  const radius = Math.max(20, size * 0.4);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className="flex flex-col items-center gap-1.5 p-2.5 bg-black/20 border border-white/5 rounded-lg hover:border-white/10 transition-colors group"
      role="figure"
      aria-label={`${label}: ${value}% — ${sublabel}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="-rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={Math.max(3, size * 0.057)}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={Math.max(3, size * 0.057)}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={Math.max(12, size * 0.23)} className="text-white/40 group-hover:text-white/70 transition-colors" />
        </div>
      </div>
      <span className="text-[15px] font-extrabold tracking-tighter" style={{ color }}>
        {Math.round(value)}%
      </span>
      <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[7px] text-white/20 font-mono">{sublabel}</span>
    </div>
  );
});
