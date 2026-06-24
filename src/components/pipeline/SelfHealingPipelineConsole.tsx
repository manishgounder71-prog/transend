"use client";

import React from "react";
import { Play, RotateCcw, Terminal, Cpu, AlertTriangle, CheckCircle } from "lucide-react";
import { type LogLine, type PipelineState } from "./pipelineData";

interface SelfHealingPipelineConsoleProps {
  logs: LogLine[];
  pipelineState: PipelineState;
  logTerminalRef: React.RefObject<HTMLDivElement | null>;
  onStart: () => void;
  onHeal: () => void;
  onReset: () => void;
}

function PipelineLog({ log }: { log: LogLine }) {
  const typeColor = {
    error: "text-red-400",
    success: "text-emerald-400",
    agent: "text-purple-400",
    info: "text-sky-400",
  }[log.type];

  const textColor = {
    error: "text-red-300",
    success: "text-emerald-200",
    agent: "text-purple-200 font-medium",
    info: "text-slate-300",
  }[log.type];

  return (
    <p className="leading-relaxed">
      <span className="text-white/20 mr-1.5">[{log.time}]</span>
      <span className={`mr-1.5 font-bold uppercase ${typeColor}`}>[{log.type}]</span>
      <span className={textColor}>{log.text}</span>
    </p>
  );
}

export default function SelfHealingPipelineConsole({
  logs,
  pipelineState,
  logTerminalRef,
  onStart,
  onHeal,
  onReset,
}: SelfHealingPipelineConsoleProps) {
  const stateLabel = {
    idle: "READY",
    running_fail: "EXECUTING TESTS",
    failed: "CRITICAL FAILURE",
    healing: "REPAIRING CORES",
    healed: "DEPLOYED NOMINAL",
  }[pipelineState];

  const stateIcon = {
    idle: null,
    running_fail: null,
    failed: <AlertTriangle size={14} className="stroke-[2.5]" />,
    healing: null,
    healed: <CheckCircle size={14} className="stroke-[2.5]" />,
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[#00f0ff]" />
          <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
            Self-Healing Console Output
          </h3>
        </div>
        <span
          className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
            pipelineState === "failed"
              ? "bg-red-500/10 border border-red-500/25 text-[#ef4444]"
              : pipelineState === "healed"
                ? "bg-emerald-500/10 border border-emerald-500/25 text-[#10b981]"
                : "bg-cyan-500/10 border border-cyan-500/25 text-[#00f0ff]"
          } uppercase tracking-wide`}
        >
          {stateIcon[pipelineState]}
          {stateLabel}
        </span>
      </div>

      {/* Live logs terminal box */}
      <div
        ref={logTerminalRef}
        className="flex-1 bg-black/45 border border-white/5 rounded-lg p-4 font-mono text-[10.5px] overflow-y-auto flex flex-col gap-1.5 select-text"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center gap-2 text-white/30">
            <Cpu size={24} className="animate-pulse" />
            <span>Pipeline idle. Initiate simulation run parameters.</span>
          </div>
        ) : (
          logs.map((log, i) => <PipelineLog key={i} log={log} />)
        )}
      </div>

      {/* Action Panel triggers */}
      <div className="flex gap-3 mt-4 border-t border-white/5 pt-3">
        {pipelineState === "idle" && (
          <button
            onClick={onStart}
            className="flex-1 font-sans text-[11px] font-bold text-slate-950 bg-[#ef4444] hover:bg-[#ef4444]/90 rounded py-2 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.3)] transition flex justify-center items-center gap-2 active:scale-[0.98]"
          >
            <Play size={12} fill="currentColor" />
            Simulate CI/CD Failure
          </button>
        )}

        {pipelineState === "failed" && (
          <button
            onClick={onHeal}
            className="flex-1 font-sans text-[11px] font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] hover:shadow-[0_0_16px_rgba(168,85,247,0.4)] rounded py-2 cursor-pointer transition flex justify-center items-center gap-2 active:scale-[0.98]"
          >
            <Cpu size={12} />
            Engage Auto-Healing Agent
          </button>
        )}

        {(pipelineState === "healing" || pipelineState === "running_fail") && (
          <button
            disabled
            className="flex-1 font-sans text-[11px] font-semibold text-white/50 bg-white/5 border border-white/10 rounded py-2 cursor-not-allowed flex justify-center items-center gap-2"
          >
            <span className="w-3 h-3 border border-white/30 border-t-transparent rounded-full animate-spin" />
            Autonomous Running...
          </button>
        )}

        {pipelineState === "healed" && (
          <button
            onClick={onReset}
            className="flex-1 font-sans text-[11px] font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded py-2 cursor-pointer transition flex justify-center items-center gap-2 active:scale-[0.98]"
          >
            <RotateCcw size={12} />
            Reset Console
          </button>
        )}
      </div>
    </div>
  );
}
