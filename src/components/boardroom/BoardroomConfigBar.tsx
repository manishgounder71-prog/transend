"use client";

import React from "react";
import { Play, Cpu, ShieldAlert } from "lucide-react";

interface BoardroomConfigBarProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  customTopic: string;
  onCustomTopicChange: (topic: string) => void;
  isDebating: boolean;
  isLoadingAI: boolean;
  aiStatus: "idle" | "generating" | "fallback" | "ready";
  onConvene: () => void;
  onCustomKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  customTopicDisabled: boolean;
}

export default function BoardroomConfigBar({
  topic,
  onTopicChange,
  customTopic,
  onCustomTopicChange,
  isDebating,
  isLoadingAI,
  aiStatus,
  onConvene,
  onCustomKeyDown,
  customTopicDisabled,
}: BoardroomConfigBarProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-2 mb-2 select-none">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            AI Boardroom Executive Panel
          </h3>
          <p className="text-[10px] text-white/40 mt-0.5">
            Virtual executive meeting of AI agents debating key business decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            disabled={isDebating || isLoadingAI}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="bg-black/45 border border-white/10 rounded px-2 py-1 text-[10px] text-white font-semibold outline-none focus:border-[#00f0ff]/40 transition"
          >
            <option value="auth_debt">Topic: Auth DB Debt</option>
            <option value="hotfix">Topic: Emergency Hotfix</option>
            <option value="failover">Topic: Multi-Region Failover</option>
            <option value="custom">Custom Proposal...</option>
          </select>
          {topic === "custom" && (
            <input
              type="text"
              disabled={isDebating || isLoadingAI}
              value={customTopic}
              onChange={(e) => onCustomTopicChange(e.target.value)}
              onKeyDown={onCustomKeyDown}
              placeholder="Type your debate proposal..."
              className="bg-black/45 border border-white/10 rounded px-2 py-1 text-[10px] text-white font-semibold outline-none focus:border-[#a855f7]/40 transition placeholder-white/25 min-w-[180px] flex-1"
            />
          )}
          <button
            disabled={customTopicDisabled}
            onClick={onConvene}
            className="font-sans text-[10px] font-bold text-slate-950 bg-[#00f0ff] hover:bg-[#00f0ff]/80 transition rounded px-3 py-1 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed flex items-center gap-1 active:scale-[0.98]"
          >
            {isLoadingAI ? (
              <span className="w-2.5 h-2.5 border border-slate-950 border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <Play size={10} fill="currentColor" />
            )}
            {isLoadingAI ? "Generating..." : "Convene"}
          </button>
        </div>
      </div>

      {/* AI Status indicator (outside bordered header) */}
      {isLoadingAI && (
        <div className="mb-2 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Cpu size={12} className="text-purple-400 animate-pulse" />
          <span className="font-mono text-[9px] text-purple-400">
            AI agents formulating debate strategies...
          </span>
        </div>
      )}
      {aiStatus === "fallback" && !isLoadingAI && (
        <div className="mb-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <ShieldAlert size={12} className="text-amber-400" />
          <span className="font-mono text-[9px] text-amber-400">
            AI offline — using local executive scripts
          </span>
        </div>
      )}
      {aiStatus === "ready" && !isDebating && !isLoadingAI && (
        <div className="mb-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Cpu size={12} className="text-emerald-400" />
          <span className="font-mono text-[9px] text-emerald-400">
            AI-generated debate ready
          </span>
        </div>
      )}
    </>
  );
}
