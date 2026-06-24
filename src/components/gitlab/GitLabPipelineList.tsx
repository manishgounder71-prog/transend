"use client";

import React from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import type { PipelineInfo } from "./gitlabTypes";

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "success":
      return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400";
    case "failed":
      return "bg-red-500/10 border-red-500/25 text-red-400";
    case "running":
    case "pending":
      return "bg-amber-500/10 border-amber-500/25 text-amber-400 animate-pulse";
    default:
      return "bg-slate-500/10 border-slate-500/25 text-slate-400";
  }
}

interface GitLabPipelineListProps {
  pipelines: PipelineInfo[];
  isLoadingPipelines: boolean;
}

export default function GitLabPipelineList({ pipelines, isLoadingPipelines }: GitLabPipelineListProps) {
  return (
    <div className="overflow-y-auto flex flex-col gap-2.5 pr-1.5">
      {isLoadingPipelines && pipelines.length === 0 ? (
        <div className="h-full flex items-center justify-center text-xs text-white/30 font-mono">
          <RefreshCw size={12} className="animate-spin mr-1.5" />
          Querying API data lake...
        </div>
      ) : pipelines.length === 0 ? (
        <div className="h-full flex flex-center items-center text-xs text-white/30 font-mono text-center">
          No recent pipelines found on this project.
        </div>
      ) : (
        pipelines.map((pipe) => (
          <a
            key={pipe.id}
            href={pipe.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-black/25 border border-white/5 hover:border-white/15 rounded-lg flex items-center justify-between gap-3 transition"
          >
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="text-[11px] font-bold text-white truncate max-w-[220px]">
                {pipe.commitMessage}
              </span>
              <div className="flex items-center gap-2 font-mono text-[9px] text-white/40">
                <span>
                  Branch: <strong className="text-[#00f0ff]">{pipe.ref}</strong>
                </span>
                <span>•</span>
                <span>
                  SHA: [{pipe.sha}]
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className={`font-mono text-[8px] font-bold border rounded px-1.5 py-0.5 tracking-wide uppercase ${getStatusBadge(pipe.status)}`}>
                {pipe.status}
              </span>
              <ExternalLink size={10} className="text-white/20" />
            </div>
          </a>
        ))
      )}
    </div>
  );
}
