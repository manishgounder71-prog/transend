"use client";

import React from "react";
import type { AISimulationResult } from "./parallelData";

interface ParallelSimulatorAnalysisProps {
  scenarioAnalysis: string;
  metricsSummary: AISimulationResult["metricsSummary"] | null;
}

export default function ParallelSimulatorAnalysis({
  scenarioAnalysis,
  metricsSummary,
}: ParallelSimulatorAnalysisProps) {
  return (
    <div className="glass-panel p-4 border-l-4 border-l-[#00f0ff] animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] font-bold text-[#00f0ff]">AI</span>
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-[#00f0ff] font-mono uppercase tracking-wider mb-1">
            Strategic Assessment
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">{scenarioAnalysis}</p>
          {metricsSummary && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-black/30 border border-white/5 rounded p-2 text-center">
                <span className="text-[7px] font-bold text-white/30 font-mono uppercase block">Best Case</span>
                <span className="text-[11px] font-bold text-[#10b981]">{metricsSummary.bestCaseProbability}%</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded p-2 text-center">
                <span className="text-[7px] font-bold text-white/30 font-mono uppercase block">Worst Case</span>
                <span className="text-[11px] font-bold text-[#ef4444]">{metricsSummary.worstCaseProbability}%</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded p-2 text-center">
                <span className="text-[7px] font-bold text-white/30 font-mono uppercase block">Revenue Impact</span>
                <span className="text-[11px] font-bold text-[#00f0ff]">{metricsSummary.expectedRevenueImpact}</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded p-2 text-center">
                <span className="text-[7px] font-bold text-white/30 font-mono uppercase block">Primary Risk</span>
                <span className="text-[11px] font-bold text-[#f59e0b] truncate block max-w-[100px]" title={metricsSummary.primaryRisk}>
                  {metricsSummary.primaryRisk}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
