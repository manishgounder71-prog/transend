"use client";

import React from "react";
import { getBorderColor, getProbColor, type UniverseBranch } from "./parallelData";

interface ParallelSimulatorBranchProps {
  branch: UniverseBranch;
  index: number;
}

export default function ParallelSimulatorBranch({ branch, index }: ParallelSimulatorBranchProps) {
  return (
    <div
      className={`glass-panel p-5 relative overflow-hidden flex flex-col justify-between min-h-[280px] before:content-[""] before:absolute before:top-0 before:left-0 before:w-1 before:h-full ${getBorderColor(branch.theme)} animate-in fade-in slide-in-from-bottom-4 duration-500`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div>
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
          <h4 className="text-[11.5px] font-bold text-white tracking-tight">{branch.name}</h4>
          <span className={`font-mono text-[9px] font-bold ${getProbColor(branch.theme)}`}>
            {branch.probability}
          </span>
        </div>
        <div className="flex flex-col gap-2 font-mono text-[10.5px]">
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-white/40">Revenue:</span>
            <span className="font-semibold text-[#10b981]">{branch.revenue}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-white/40">Incidents:</span>
            <span className="font-semibold text-slate-200">{branch.incidents}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-white/40">Velocity:</span>
            <span className="font-semibold text-[#00f0ff]">{branch.velocity}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-white/40">Vulnerabilities:</span>
            <span className="font-semibold text-slate-200">{branch.vulnerabilities}</span>
          </div>
        </div>
        {branch.narrative && (
          <p className="text-[10px] text-white/40 mt-3 leading-relaxed border-t border-white/[0.03] pt-2">
            {branch.narrative}
          </p>
        )}
      </div>

      {/* Visual dashed connector lines */}
      <div className="h-4 border-t border-dashed border-white/10 relative mt-4">
        <span className="absolute -top-1 left-[30%] w-1.5 h-1.5 rounded-full bg-[#0072ff] animate-ping" />
        <span className="absolute -top-1 left-[30%] w-1.5 h-1.5 rounded-full bg-[#0072ff]" />
        <span className="absolute -top-1 left-[70%] w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-ping" />
        <span className="absolute -top-1 left-[70%] w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
      </div>
    </div>
  );
}
