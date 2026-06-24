"use client";

import React from "react";
import { Terminal, Cpu, Play } from "lucide-react";

interface GitLabTestConsoleProps {
  testLogs: string[];
  terminalEndRef: React.RefObject<HTMLDivElement | null>;
  isRunningTest: boolean;
  activePipelineId: number | null;
  activePipelineStatus: string;
  onTrigger: () => void;
}

export default function GitLabTestConsole({
  testLogs,
  terminalEndRef,
  isRunningTest,
  activePipelineId,
  activePipelineStatus,
  onTrigger,
}: GitLabTestConsoleProps) {
  return (
    <div className="glass-panel p-4 flex flex-col justify-between overflow-hidden bg-black/45 border border-white/5 rounded-lg h-full">
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-1.5 mb-2 select-none">
        <span className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-1.5">
          <Terminal size={11} className="text-[#00f0ff]" />
          Remote Test Console
        </span>
        {activePipelineStatus && (
          <span className="font-mono text-[8.5px] uppercase font-bold text-white/60">
            ID: #{activePipelineId}
          </span>
        )}
      </div>

      <div className="flex-1 bg-black/60 rounded border border-white/5 p-3 overflow-y-auto font-mono text-[9.5px] flex flex-col gap-1 pr-1.5 scrollbar-thin select-text min-h-[140px]">
        {testLogs.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center text-white/20 select-none">
            <Cpu size={18} className="mb-1" />
            <span>Remote pipeline idle. Click run below to engage builds.</span>
          </div>
        ) : (
          testLogs.map((log, index) => (
            <p key={index} className="leading-relaxed text-slate-300">
              {log}
            </p>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      <button
        onClick={onTrigger}
        disabled={isRunningTest}
        className="w-full font-sans text-[10px] font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] rounded py-2 cursor-pointer disabled:bg-white/5 disabled:text-white/35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-[0.98] select-none mt-3.5 font-bold"
      >
        {isRunningTest ? (
          <>
            <span className="w-2.5 h-2.5 border border-slate-950 border-t-transparent rounded-full animate-spin inline-block" />
            Running Remote Tests ({activePipelineStatus?.toUpperCase()})...
          </>
        ) : (
          <>
            <Play size={11} fill="currentColor" />
            Trigger Remote CI Pipeline
          </>
        )}
      </button>
    </div>
  );
}
