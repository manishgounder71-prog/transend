"use client";

import React, { useEffect, useState } from "react";
import { Cpu, Database, RefreshCw, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { OrbitStatus } from "@/lib/orbit";

type BadgeState =
  | { type: "loading" }
  | { type: "simulated"; status: OrbitStatus & { simulated: true } }
  | { type: "real"; status: OrbitStatus }
  | { type: "unavailable"; error: string }
  | { type: "error"; message: string };

export default function OrbitStatusBadge() {
  const [state, setState] = useState<BadgeState>({ type: "loading" });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/orbit/status");
        const data = await res.json();

        if (cancelled) return;

        if (data.source === "simulated" && data.simulated) {
          setState({ type: "simulated", status: data });
        } else if (data.available) {
          setState({ type: "real", status: data });
        } else {
          setState({ type: "unavailable", error: data.error || "Orbit not available" });
        }
      } catch {
        if (!cancelled) {
          setState({ type: "error", message: "Failed to check Orbit status" });
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000); // Re-check every 30s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (state.type === "loading") {
    return (
      <div className="mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-[9px] text-white/30 font-mono">
          <Loader2 size={10} className="animate-spin" />
          <span>Connecting to Orbit...</span>
        </div>
      </div>
    );
  }

  const isActive = state.type === "real" || state.type === "simulated";

  return (
    <div className="mt-auto pt-3 border-t border-white/5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-2.5 text-left cursor-pointer group"
      >
        <div className="relative mt-0.5 flex-shrink-0">
          <Cpu size={12} className={isActive ? "text-[#a855f7]" : "text-white/20"} />
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-bold text-[#a855f7]/80 font-mono uppercase tracking-wider">
              GitLab Orbit
            </span>
            <span
              className={`text-[7px] font-bold px-1 py-0.5 border rounded font-mono ${
                isActive
                  ? "text-[#a855f7]/60 border-[#a855f7]/20"
                  : "text-white/20 border-white/10"
              }`}
            >
              {state.type === "real" ? "LIVE" : state.type === "simulated" ? "DEMO" : "OFF"}
            </span>
          </div>

          {isActive && state.status.summary && (
            <div className="text-[8px] text-white/25 font-mono leading-relaxed space-y-0.5">
              <span>{state.status.summary.total_files} files indexed</span>
              {state.type === "simulated" && (
                <span className="block text-[#a855f7]/40 italic">Demo mode — install CLI for live data</span>
              )}
            </div>
          )}

          {state.type === "unavailable" && (
            <p className="text-[8px] text-white/20 font-mono leading-relaxed">
              {state.error}
            </p>
          )}

          {state.type === "error" && (
            <p className="text-[8px] text-red-400/60 font-mono leading-relaxed">
              {state.message}
            </p>
          )}

          {/* Expanded details */}
          {expanded && isActive && state.status.summary && (
            <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-[7px] font-mono">
                <Database size={7} className="text-white/20" />
                <span className="text-white/30">
                  {state.status.summary.total_definitions} definitions
                </span>
              </div>
              <div className="flex items-center gap-2 text-[7px] font-mono">
                <RefreshCw size={7} className="text-white/20" />
                <span className="text-white/30">
                  {state.status.summary.total_imports} dependencies mapped
                </span>
              </div>
              {Object.entries(state.status.summary.languages).slice(0, 4).map(([lang, count]) => (
                <div key={lang} className="flex items-center gap-2 text-[7px] font-mono">
                  <CheckCircle size={7} className="text-white/20" />
                  <span className="text-white/30">{count}× {lang}</span>
                </div>
              ))}
            </div>
          )}

          {/* Click hint */}
          {isActive && !expanded && (
            <span className="block text-[7px] text-white/15 font-mono mt-0.5 group-hover:text-white/30 transition-colors">
              Click for details
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
