"use client";

import React from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import type { ProjectInfo } from "./gitlabTypes";

interface GitLabProjectSummaryProps {
  project: ProjectInfo;
}

export default function GitLabProjectSummary({ project }: GitLabProjectSummaryProps) {
  return (
    <div className="flex flex-col gap-3.5 mt-2 animate-in fade-in zoom-in-95 duration-200">
      <div className="p-3 bg-emerald-500/[0.02] border border-emerald-500/20 rounded-lg flex items-start gap-2.5 text-xs text-[#10b981]">
        <ShieldCheck size={16} className="flex-shrink-0 mt-0.5 text-emerald-400" />
        <div>
          <span className="font-bold uppercase text-[9.5px] tracking-wide text-emerald-400 font-mono">CONNECTION NOMINAL</span>
          <p className="text-[10.5px] leading-relaxed text-emerald-200/80 mt-0.5">Orbit is actively proxying payloads for your GitLab project.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 font-mono text-[10.5px]">
        <div className="flex flex-col border-b border-white/[0.04] pb-1.5">
          <span className="text-white/40 text-[8px] leading-none mb-1">PROJECT NAME</span>
          <span className="font-semibold text-[#00f0ff] flex items-center gap-1">
            {project.projectName}
            <a href={project.webUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#00f0ff]">
              <ExternalLink size={10} />
            </a>
          </span>
        </div>
        <div className="flex flex-col border-b border-white/[0.04] pb-1.5">
          <span className="text-white/40 text-[8px] leading-none mb-1">NAMESPACE OWNER</span>
          <span className="font-semibold text-[#a855f7]">@{project.owner.replace(" ", "")}</span>
        </div>
        <div className="flex flex-col border-b border-white/[0.04] pb-1.5">
          <span className="text-white/40 text-[8px] leading-none mb-1">STAR COUNT</span>
          <span className="font-semibold text-slate-200">{project.starCount} ★</span>
        </div>
        <div className="flex flex-col border-b border-white/[0.04] pb-1.5">
          <span className="text-white/40 text-[8px] leading-none mb-1">REPOSITORY PATH</span>
          <span className="font-semibold text-slate-200 select-all truncate">{project.path}</span>
        </div>
      </div>
    </div>
  );
}
