"use client";

import React, { useState, useMemo } from "react";
import { Clock, AlertTriangle, ShieldCheck, GitCommit, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineEvent {
  date: string;
  desc: string;
  commit: string;
  health: string;
  debt: string;
  verdict: string;
  warning?: boolean;
  color: string;
}

const timelineEvents: TimelineEvent[] = [
  { date: "May 01, 2026", desc: "Initial project bootstrap. Set base directories, manifests, and auth models.", commit: "v1.0.0", health: "95", debt: "None", verdict: "Perfect base structure. Zero tech debt.", warning: false, color: "#10b981" },
  { date: "May 15, 2026", desc: "Deployed OAuth gateway routing and database integration endpoints.", commit: "v1.0.4", health: "92", debt: "Low", verdict: "Added basic indexing limits to connection hooks.", warning: false, color: "#10b981" },
  { date: "Jun 01, 2026", desc: "Scaled clusters to 3 replicas. Set connection limit to 10 threads.", commit: "v1.1.2", health: "84", debt: "Medium", verdict: "⚠️ Throttling DB pools to 10 limits concurrency.", warning: true, color: "#f59e0b" },
  { date: "Jun 15, 2026", desc: "Launched payment gateway scripts and Stripe webhook integrations.", commit: "v1.5.0", health: "78", debt: "High", verdict: "⚠️ Webhook calls clash with DB pool limit.", warning: true, color: "#ef4444" },
  { date: "Jun 20, 2026 (Today)", desc: "Orbit CTO X deployed. Uptime at 98.4%. Self-healing agents armed.", commit: "v1.12.80", health: "92", debt: "Low", verdict: "Connection limits healed to 50. Security patches deployed.", warning: false, color: "#00f0ff" },
];

export default function TimeMachine() {
  const [sliderVal, setSliderVal] = useState(100);
  const [activeEventIdx, setActiveEventIdx] = useState(4);

  const event = timelineEvents[activeEventIdx];
  const healthScores = useMemo(() => timelineEvents.map((e) => parseInt(e.health)), []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderVal(val);
    // Map slider position to nearest event
    const idx = Math.round((val / 100) * (timelineEvents.length - 1));
    setActiveEventIdx(Math.min(timelineEvents.length - 1, Math.max(0, idx)));
  };

  const getHealthColor = (score: number) => {
    if (score < 80) return "text-[#ef4444]";
    if (score < 90) return "text-[#f59e0b]";
    return "text-[#10b981]";
  };

  const getDebtColor = (debt: string) => {
    if (debt === "None") return "text-[#10b981]";
    if (debt === "Low") return "text-cyan-400";
    if (debt === "Medium") return "text-[#f59e0b]";
    return "text-[#ef4444] font-bold";
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 h-[485px] animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Left: Timeline slider + mini health chart */}
      <div className="glass-panel p-5 flex flex-col justify-between h-full overflow-hidden">
        <div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 select-none">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#00f0ff]" />
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">Engineering Timeline</h3>
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-[#00f0ff] uppercase">{event.date}</span>
          </div>

          {/* Mini SVG Health Trend Chart */}
          <div className="h-[60px] mb-4">
            <svg width="100%" height="60" viewBox="0 0 200 60" className="overflow-visible">
              {/* Grid lines */}
              <line x1="0" y1="45" x2="200" y2="45" stroke="rgba(255,255,255,0.03)" />
              <line x1="0" y1="30" x2="200" y2="30" stroke="rgba(255,255,255,0.03)" />
              <line x1="0" y1="15" x2="200" y2="15" stroke="rgba(255,255,255,0.03)" />
              {/* Area fill */}
              <path
                d={`M ${healthScores.map((s, i) => `${(i / (healthScores.length - 1)) * 200},${60 - (s / 100) * 50}`).join(" L ")} L ${((healthScores.length - 1) / (healthScores.length - 1)) * 200},60 L 0,60 Z`}
                fill="url(#health-grad)"
                opacity={0.15}
              />
              {/* Line */}
              <path
                d={`M ${healthScores.map((s, i) => `${(i / (healthScores.length - 1)) * 200},${60 - (s / 100) * 50}`).join(" L ")}`}
                fill="none"
                stroke={event.warning ? "#f59e0b" : "#10b981"}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Active dot */}
              <circle
                cx={(activeEventIdx / (timelineEvents.length - 1)) * 200}
                cy={60 - (parseInt(event.health) / 100) * 50}
                r="5"
                fill={event.warning ? "#f59e0b" : "#10b981"}
                stroke="#050816"
                strokeWidth="2"
              >
                <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
              </circle>
              <defs>
                <linearGradient id="health-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={event.warning ? "#f59e0b" : "#10b981"} />
                  <stop offset="100%" stopColor={event.warning ? "#f59e0b" : "#10b981"} stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Navigation buttons + slider */}
        <div className="flex flex-col gap-4 px-2">
          {/* Event navigation */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setActiveEventIdx(Math.max(0, activeEventIdx - 1))}
              disabled={activeEventIdx === 0}
              className="p-1.5 rounded border border-white/5 text-white/30 hover:text-white hover:border-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex gap-1.5">
              {timelineEvents.map((e, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveEventIdx(i); setSliderVal((i / (timelineEvents.length - 1)) * 100); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === activeEventIdx
                      ? "scale-125 shadow-[0_0_6px_currentColor]"
                      : "opacity-20 hover:opacity-40"
                  }`}
                  style={{ backgroundColor: e.color, color: e.color }}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveEventIdx(Math.min(timelineEvents.length - 1, activeEventIdx + 1))}
              disabled={activeEventIdx === timelineEvents.length - 1}
              className="p-1.5 rounded border border-white/5 text-white/30 hover:text-white hover:border-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="relative w-full">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={sliderVal}
              onChange={handleSliderChange}
              className="time-range-slider w-full"
              style={{
                background: `linear-gradient(to right, ${event.color}44, ${event.color}88)`,
              }}
            />
          </div>

          <div className="flex justify-between text-[8px] font-mono text-white/20 select-none">
            {timelineEvents.map((e, i) => (
              <span key={i} className={i === activeEventIdx ? "text-[#00f0ff]/60 font-bold" : ""}>{e.date.split(",")[0]}</span>
            ))}
          </div>
        </div>

        {/* Warning/Success card */}
        <div className="mt-4">
          {event.warning ? (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs animate-pulse">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-[#ef4444]" />
              <div>
                <span className="font-bold uppercase text-[9.5px] text-[#ef4444]">Historical Flaw Detected</span>
                <p className="text-[10.5px] leading-relaxed text-red-300 mt-0.5">This deployment introduced the DB thread limit that triggered INC-4029.</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-start gap-2.5 text-xs">
              <ShieldCheck size={15} className="flex-shrink-0 mt-0.5 text-[#10b981]" />
              <div>
                <span className="font-bold uppercase text-[9.5px] text-[#10b981]">Codebase Health Nominal</span>
                <p className="text-[10.5px] leading-relaxed text-emerald-300 mt-0.5">No critical architectural regression in this commit block.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Event details */}
      <div className="glass-panel p-5 flex flex-col justify-between h-full overflow-hidden">
        <div className="border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none flex items-center gap-1.5">
            <GitCommit size={13} className="text-[#00f0ff]" />
            <span>Commit Archives</span>
          </h3>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-3 my-3 animate-in fade-in duration-300" key={activeEventIdx}>
          <div>
            <span className="text-[9px] text-white/40 block font-mono">COMMIT DATE</span>
            <h4 className="text-[12.5px] font-bold text-white tracking-tight">{event.date}</h4>
          </div>
          <div>
            <span className="text-[9px] text-white/40 block font-mono">LOG SUMMARY</span>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-0.5">{event.desc}</p>
          </div>
          <div>
            <span className="text-[9px] text-white/40 block font-mono">ARCHITECT REASONS</span>
            <p className="text-[10.5px] font-mono text-[#00f0ff] mt-0.5 leading-normal">{event.verdict}</p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <TrendingUp size={12} className={getHealthColor(parseInt(event.health))} />
            <span className="text-[10px] font-mono text-white/30">Health trajectory:</span>
            <span className={`text-[11px] font-bold ${getHealthColor(parseInt(event.health))}`}>{event.health}/100</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 font-mono text-[10px]">
          <div className="flex flex-col">
            <span className="text-white/30 text-[8px] leading-none mb-1 uppercase">VERSION</span>
            <span className="font-bold text-[#00f0ff]">{event.commit}</span>
          </div>
          <div className="flex flex-col border-l border-white/5 pl-2">
            <span className="text-white/30 text-[8px] leading-none mb-1 uppercase">HEALTH</span>
            <span className={`font-bold ${getHealthColor(parseInt(event.health))}`}>{event.health}/100</span>
          </div>
          <div className="flex flex-col border-l border-white/5 pl-2">
            <span className="text-white/30 text-[8px] leading-none mb-1 uppercase">DEBT</span>
            <span className={`font-bold ${getDebtColor(event.debt)}`}>{event.debt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
