"use client";

import React, { useState } from "react";
import { Sun, Moon, Contrast } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme";

const THEME_ORDER: ThemeMode[] = ["dark", "light", "high-contrast"];

const THEME_CONFIG: Record<ThemeMode, { icon: React.ElementType; label: string; nextLabel: string }> = {
  dark: { icon: Moon, label: "Dark Mode", nextLabel: "Switch to Light" },
  light: { icon: Sun, label: "Light Mode", nextLabel: "Switch to High Contrast" },
  "high-contrast": { icon: Contrast, label: "High Contrast", nextLabel: "Switch to Dark" },
};

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const [tooltip, setTooltip] = useState(false);

  const config = THEME_CONFIG[theme];
  const Icon = config.icon;

  return (
    <div className="relative flex items-center">
      <button
        onClick={cycleTheme}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        onFocus={() => setTooltip(true)}
        onBlur={() => setTooltip(false)}
        className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10"
        aria-label={`Current: ${config.label}. ${config.nextLabel}`}
        title={`${config.label} — click to ${config.nextLabel.toLowerCase()}`}
      >
        <Icon size={15} />
      </button>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none">
          <p className="text-[10px] font-bold text-[var(--text-primary)]">{config.label}</p>
          <p className="text-[8px] font-mono text-[var(--text-tertiary)]">Click to switch theme</p>
          <div className="flex gap-1 mt-1.5">
            {THEME_ORDER.map((t) => {
              const TIcon = THEME_CONFIG[t].icon;
              return (
                <span
                  key={t}
                  className={`p-1 rounded ${
                    t === theme
                      ? "bg-[var(--active-bg)] text-[var(--color-cyan)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  <TIcon size={10} />
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
