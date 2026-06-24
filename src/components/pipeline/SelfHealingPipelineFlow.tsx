"use client";

import React from "react";
import { FileText } from "lucide-react";
import { type PipelineState } from "./pipelineData";
import PipelineDAG from "./PipelineDAG";

interface SelfHealingPipelineFlowProps {
  pipelineState: PipelineState;
  visibleDiff: boolean;
}

export default function SelfHealingPipelineFlow({ pipelineState, visibleDiff }: SelfHealingPipelineFlowProps) {
  return (
    <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
      <div>
        <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none mb-1">
          Pipeline Flow Topology
        </h3>
        <p className="text-[10px] text-white/40">
          Real-time DAG status tracking of deployment stages.
        </p>
      </div>

      {/* D3.js animated DAG visualization */}
      <div className="flex-1 flex items-center justify-center py-2">
        <PipelineDAG pipelineState={pipelineState} />
      </div>

      {/* Patch Code Diff display */}
      {visibleDiff && (
        <div className="bg-black/40 border border-purple-500/25 rounded-lg p-3 font-mono text-[9px] leading-relaxed animate-in slide-in-from-bottom-2 duration-300 mt-2">
          <div className="flex items-center gap-1.5 text-purple-400 font-bold border-b border-white/5 pb-1 mb-1.5">
            <FileText size={10} />
            <span>AUTO FIX // prisma/schema.prisma</span>
          </div>
          <p className="text-red-400 line-through">
            - database_url = &quot;postgresql://db:5432/main?connection_limit=10&quot;
          </p>
          <p className="text-emerald-400 font-bold">
            + database_url = &quot;postgresql://db:5432/main?connection_limit=50&amp;pool_timeout=30&quot;
          </p>
        </div>
      )}
    </div>
  );
}
