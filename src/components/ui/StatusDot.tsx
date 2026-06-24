import React from "react";

interface StatusDotProps {
  color?: "green" | "cyan" | "amber" | "red" | "purple";
  pulse?: boolean;
  size?: "sm" | "md";
  label?: string;
}

const COLOR_MAP: Record<string, { bg: string; ping: string }> = {
  green: { bg: "bg-[#10b981]", ping: "bg-[#10b981]/30" },
  cyan: { bg: "bg-[#00f0ff]", ping: "bg-[#00f0ff]/30" },
  amber: { bg: "bg-[#f59e0b]", ping: "bg-[#f59e0b]/30" },
  red: { bg: "bg-[#ef4444]", ping: "bg-[#ef4444]/30" },
  purple: { bg: "bg-[#a855f7]", ping: "bg-[#a855f7]/30" },
};

const SIZE_MAP: Record<string, { dot: string; ping: string }> = {
  sm: { dot: "w-1.5 h-1.5", ping: "w-3 h-3" },
  md: { dot: "w-2 h-2", ping: "w-4 h-4" },
};

/**
 * Animated status indicator dot with optional pulse ring.
 */
export const StatusDot = React.memo(function StatusDot({
  color = "green",
  pulse = false,
  size = "sm",
  label,
}: StatusDotProps) {
  const colors = COLOR_MAP[color];
  const dims = SIZE_MAP[size];

  return (
    <span
      className="relative flex items-center justify-center"
      role="status"
      aria-label={label ?? `Status: ${color}`}
    >
      <span className={`${dims.dot} rounded-full ${colors.bg}`} />
      {pulse && (
        <span className={`absolute ${dims.ping} rounded-full ${colors.ping} animate-ping`} />
      )}
    </span>
  );
});
