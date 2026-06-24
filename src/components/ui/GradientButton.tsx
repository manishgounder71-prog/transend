"use client";

import React, { type ReactNode } from "react";

type GradientVariant = "cyan" | "purple" | "red" | "ghost";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: GradientVariant;
  size?: "sm" | "md";
  glow?: boolean;
  icon?: ReactNode;
}

const VARIANT_STYLES: Record<GradientVariant, string> = {
  cyan: "bg-gradient-to-r from-[#00f0ff] to-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]",
  purple: "bg-gradient-to-r from-[#a855f7] to-[#0072ff] text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.3)] hover:shadow-[0_0_16px_rgba(168,85,247,0.4)]",
  red: "bg-[#ef4444] text-slate-950 shadow-[0_0_12px_rgba(239,68,68,0.3)] hover:bg-[#ef4444]/90",
  ghost: "bg-white/5 text-white border border-white/10 hover:bg-white/10 shadow-none",
};

const SIZE_STYLES: Record<string, string> = {
  sm: "text-[10px] font-bold px-3 py-1.5",
  md: "text-xs font-bold px-4 py-2",
};

/**
 * Reusable gradient/ghost button with consistent styling.
 * Used across all modules for actions like "Evaluate Risk", "Convene", etc.
 */
export const GradientButton = React.memo(function GradientButton({
  children,
  variant = "cyan",
  size = "sm",
  icon,
  className = "",
  disabled,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={`
        font-sans rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5
        active:scale-[0.98] disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed disabled:shadow-none
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
});
