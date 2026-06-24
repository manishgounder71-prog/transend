import React from "react";

type BadgeVariant =
  | "info"
  | "success"
  | "warn"
  | "error"
  | "purple"
  | "cyan"
  | "emerald"
  | "amber"
  | "red";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "xs" | "sm";
  className?: string;
  pulse?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  info: "bg-cyan-500/15 text-[#00f0ff] border-cyan-500/20",
  success: "bg-emerald-500/15 text-[#10b981] border-emerald-500/20",
  warn: "bg-amber-500/15 text-[#f59e0b] border-amber-500/20",
  error: "bg-red-500/15 text-[#ef4444] border-red-500/20",
  purple: "bg-purple-500/15 text-[#a855f7] border-purple-500/20",
  cyan: "bg-cyan-500/10 text-[#00f0ff] border-cyan-500/25",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/25",
};

const SIZE_CLASSES: Record<string, string> = {
  xs: "text-[7px] px-1 py-px",
  sm: "text-[9px] px-1.5 py-0.5",
};

/**
 * Consistent status/severity badge used across all modules.
 */
export const Badge = React.memo(function Badge({
  children,
  variant = "info",
  size = "sm",
  className = "",
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={`
        font-mono font-bold rounded border tracking-wider uppercase select-none
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${pulse ? "animate-pulse" : ""}
        ${className}
      `}
    >
      {children}
    </span>
  );
});
