"use client";

import React from "react";
import { GitFork, Cpu, ShieldAlert } from "lucide-react";
import { type TemplateItem } from "./parallelData";

interface ParallelSimulatorInputProps {
  query: string;
  isLoading: boolean;
  isLoadingAI: boolean;
  aiStatus: "idle" | "generating" | "fallback" | "ready";
  templates: TemplateItem[];
  onQueryChange: (value: string) => void;
  onEnterPress: () => void;
  onSimulate: () => void;
  onTemplateClick: (text: string) => void;
}

export default function ParallelSimulatorInput({
  query,
  isLoading,
  isLoadingAI,
  aiStatus,
  templates,
  onQueryChange,
  onEnterPress,
  onSimulate,
  onTemplateClick,
}: ParallelSimulatorInputProps) {
  return (
    <div className="glass-panel p-5">
      <h3 className="text-sm font-bold text-white tracking-wide uppercase select-none">
        Parallel Universe Simulation Engine
      </h3>
      <p className="text-[10px] text-white/40 mt-0.5 mb-4 leading-relaxed">
        Forecast the impact of critical software decisions across multiple future branches (velocity, cost, incident probability, revenue impact).
      </p>

      {/* AI Status indicator */}
      {isLoadingAI && (
        <div className="mb-3 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Cpu size={12} className="text-purple-400 animate-pulse" />
          <span className="font-mono text-[9px] text-purple-400">
            AI agents calculating parallel realities...
          </span>
        </div>
      )}
      {aiStatus === "fallback" && !isLoadingAI && !isLoading && (
        <div className="mb-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <ShieldAlert size={12} className="text-amber-400" />
          <span className="font-mono text-[9px] text-amber-400">
            AI offline — using local simulation engine
          </span>
        </div>
      )}
      {aiStatus === "ready" && !isLoading && (
        <div className="mb-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Cpu size={12} className="text-emerald-400" />
          <span className="font-mono text-[9px] text-emerald-400">
            AI-generated simulation ready
          </span>
        </div>
      )}

      {/* Query Input Deck */}
      <div className="grid grid-cols-[24px_1fr_140px] items-center gap-3 bg-black/30 border border-white/5 rounded-lg px-4 py-2 w-full">
        <GitFork size={14} className="text-[#00f0ff]" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEnterPress();
          }}
          placeholder="Enter scenario (e.g. 'What if we delay launch 2 weeks to fix tech debt?')..."
          className="bg-transparent border-none outline-none text-xs text-white placeholder-white/30 w-full"
        />
        <button
          onClick={onSimulate}
          disabled={isLoading}
          className="font-sans text-[11px] font-bold text-slate-950 bg-[#00f0ff] border-none rounded px-4 py-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:shadow-[0_0_16px_rgba(0,240,255,0.6)] transition disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? "Simulating..." : "Simulate Branch"}
        </button>
      </div>

      {/* Quick Scenario Templates list */}
      <div className="mt-4 flex flex-col gap-2">
        <span className="font-mono text-[9px] font-bold text-white/30 tracking-wider uppercase select-none">
          💡 QUICK SCENARIO TEMPLATES
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {templates.map((tpl, i) => {
            const Icon = tpl.icon;
            return (
              <button
                key={i}
                onClick={() => onTemplateClick(tpl.text)}
                className="glass-panel p-2.5 flex items-center gap-2.5 hover:border-[#00f0ff]/30 text-left transition hover:bg-white/2 cursor-pointer group active:scale-[0.98]"
              >
                <Icon size={14} className="text-white/40 group-hover:text-[#00f0ff] transition" />
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition leading-tight">
                  {tpl.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
