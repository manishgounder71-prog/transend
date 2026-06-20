"use client";

import React, { useState } from "react";
import { Clock, AlertTriangle, ShieldCheck, GitCommit } from "lucide-react";

interface TimelineEvent {
  date: string;
  desc: string;
  commit: string;
  health: string;
  debt: string;
  verdict: string;
  warning?: boolean;
}

const timelineEvents: Record<number, TimelineEvent> = {
  0: { 
    date: "May 01, 2026", 
    desc: "Initial project bootstrap committed. Set base directories, configuration manifests, and basic auth models.", 
    commit: "v1.0.0", 
    health: "95/100", 
    debt: "None",
    verdict: "Perfect base structure. Zero technical debt detected."
  },
  25: { 
    date: "May 15, 2026", 
    desc: "Deployed OAuth gateway routing and database integration endpoints.", 
    commit: "v1.0.4", 
    health: "92/100", 
    debt: "Low",
    verdict: "Added basic indexing limits to connection hooks."
  },
  50: { 
    date: "June 01, 2026", 
    desc: "Scaled clusters to 3 replicas. Set connection limit limits to 10 threads.", 
    commit: "v1.1.2", 
    health: "84/100", 
    debt: "Medium",
    verdict: "⚠️ DESIGN WARNING: Throttling database connection pools to 10 limits concurrency.",
    warning: true
  },
  75: { 
    date: "June 15, 2026", 
    desc: "Launched payment gateway scripts and Stripe webhooks integrations.", 
    commit: "v1.5.0", 
    health: "78/100", 
    debt: "High",
    verdict: "⚠️ WARNING: Elevated webhook calls clash with database connection pools limit.",
    warning: true
  },
  100: { 
    date: "June 20, 2026 (Today)", 
    desc: "Deployment of Orbit CTO X Command Center. Uptime at 98.4%. Self-healing and AI boardroom agents fully armed.", 
    commit: "v1.12.80", 
    health: "92/100", 
    debt: "Low",
    verdict: "Connection limits auto-healed to 50 threads. Security patches deployed."
  }
};

export default function TimeMachine() {
  const [sliderVal, setSliderVal] = useState(100);

  // Find closest tick value
  const ticks = [0, 25, 50, 75, 100];
  const closest = ticks.reduce((prev, curr) => 
    Math.abs(curr - sliderVal) < Math.abs(prev - sliderVal) ? curr : prev
  );

  const event = timelineEvents[closest];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderVal(parseInt(e.target.value));
  };

  const getHealthColor = (health: string) => {
    const score = parseInt(health.split("/")[0]);
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
      
      {/* Timeline slider control panel */}
      <div className="glass-panel p-5 flex flex-col justify-between h-full overflow-hidden">
        <div>
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3 select-none">
            <Clock size={14} className="text-[#00f0ff]" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Engineering Timeline Scrubber
            </h3>
          </div>
          <p className="text-[10px] text-white/40 mt-0.5 mb-6 leading-relaxed">
            Scrub back and forth through structural codebase evolution, past deployments, incident alerts, and debt accumulation histories.
          </p>
        </div>
        
        {/* Slider Controls */}
        <div className="flex flex-col gap-5 flex-1 justify-center px-4">
          <div className="relative w-full">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={sliderVal}
              onChange={handleSliderChange}
              className="time-range-slider w-full"
            />
            {/* Visual indicators on range trail */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-1">
              {ticks.map(t => (
                <span key={t} className={`w-1.5 h-1.5 rounded-full ${sliderVal >= t ? "bg-[#00f0ff]" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
          
          <div className="timeline-ticks flex justify-between text-[9px] font-mono text-white/30 tracking-tight select-none">
            <button onClick={() => setSliderVal(0)} className="hover:text-white transition">May 01</button>
            <button onClick={() => setSliderVal(25)} className="hover:text-white transition">May 15</button>
            <button onClick={() => setSliderVal(50)} className="hover:text-white transition">Jun 01</button>
            <button onClick={() => setSliderVal(75)} className="hover:text-white transition">Jun 15</button>
            <button onClick={() => setSliderVal(100)} className="hover:text-white transition font-bold text-[#00f0ff]">Today</button>
          </div>
        </div>

        {/* Dynamic warning if historical error decision point */}
        <div className="mt-4">
          {event.warning ? (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-[#ef4444] animate-pulse">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase text-[9.5px]">Historical Flaw Detected</span>
                <p className="text-[10.5px] leading-relaxed text-red-300 mt-0.5">This deployment introduced the database thread limit which later triggered INC-4029.</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-start gap-2.5 text-xs text-[#10b981]">
              <ShieldCheck size={15} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase text-[9.5px]">Codebase Health Nominal</span>
                <p className="text-[10.5px] leading-relaxed text-emerald-300 mt-0.5">No critical architectural regression introduced in this commit block.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Details Card */}
      <div className="glass-panel p-5 flex flex-col justify-between h-full overflow-hidden">
        <div className="border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none flex items-center gap-1.5">
            <GitCommit size={13} className="text-[#00f0ff]" />
            <span>Commit Archives Metadata</span>
          </h3>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-3 my-3">
          <div>
            <span className="text-[9px] text-white/40 block font-mono">COMMIT DATE</span>
            <h4 className="text-[12.5px] font-bold text-white tracking-tight" id="timeline-event-date">
              {event.date}
            </h4>
          </div>
          
          <div>
            <span className="text-[9px] text-white/40 block font-mono">LOG SUMMARY</span>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-0.5" id="timeline-event-desc">
              {event.desc}
            </p>
          </div>

          <div>
            <span className="text-[9px] text-white/40 block font-mono">ARCHITECT REASONS</span>
            <p className="text-[10.5px] font-mono text-[#00f0ff] mt-0.5 leading-normal">
              {event.verdict}
            </p>
          </div>
        </div>
        
        <div className="event-stats-row grid grid-cols-3 gap-2 border-t border-white/5 pt-3 font-mono text-[10px]">
          <div className="event-stat flex flex-col">
            <span className="text-white/30 text-[8px] leading-none mb-1 uppercase">VERSION</span>
            <span className="font-bold text-[#00f0ff]">{event.commit}</span>
          </div>
          <div className="event-stat flex flex-col border-l border-white/5 pl-2">
            <span className="text-white/30 text-[8px] leading-none mb-1 uppercase">HEALTH</span>
            <span className={`font-bold ${getHealthColor(event.health)}`}>{event.health}</span>
          </div>
          <div className="event-stat flex flex-col border-l border-white/5 pl-2">
            <span className="text-white/30 text-[8px] leading-none mb-1 uppercase">DEBT LEVEL</span>
            <span className={`font-bold ${getDebtColor(event.debt)}`}>{event.debt}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
