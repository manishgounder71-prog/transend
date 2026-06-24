"use client";

import React from "react";
import type { TwinNode } from "./digitalTwinData";
import { getStatusColor } from "./digitalTwinData";

interface DigitalTwinNodeDetailsProps {
  selectedNode: TwinNode | null;
}

export default function DigitalTwinNodeDetails({ selectedNode }: DigitalTwinNodeDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-white/10 pb-3 flex justify-between items-center">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase truncate max-w-[180px]">
          {selectedNode ? selectedNode.name : "System Topology Map"}
        </h3>
        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/25 text-[#a855f7] uppercase tracking-wide">
          {selectedNode ? selectedNode.type : "ROOT"}
        </span>
      </div>

      {selectedNode ? (
        <div className="flex flex-col gap-4 text-xs">
          <p className="text-white/60 leading-relaxed">
            Real-time telemetry and SDLC structural mapping for <strong>{selectedNode.name}</strong>.
          </p>
          <div className="flex flex-col gap-2.5 font-mono">
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Node Class:</span>
              <span className="font-semibold text-[#00f0ff]">{selectedNode.type}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Code Volume:</span>
              <span className="font-semibold text-[#a855f7]">{selectedNode.loc}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Deployment Status:</span>
              <span className={`font-bold ${getStatusColor(selectedNode.status)}`}>
                {selectedNode.status}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Connected Pods:</span>
              <span className="font-semibold text-[#00f0ff]">{selectedNode.pods}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">API Health:</span>
              <span className="font-semibold text-[#10b981]">{selectedNode.health}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Git Owner:</span>
              <span className="font-semibold text-[#a855f7]">@{selectedNode.author.replace(" ", "")}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 text-xs">
          <p className="text-white/40 leading-relaxed">
            Select any node in the digital twin graph to view real-time health data, ownership mapping, dependency paths, and associated AI agent processes.
          </p>
          <div className="flex flex-col gap-2.5 font-mono">
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Total Repos:</span>
              <span className="font-semibold text-[#00f0ff]">14</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Microservices:</span>
              <span className="font-semibold text-[#a855f7]">28</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Active Pods:</span>
              <span className="font-semibold text-[#10b981]">124</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Debt Score:</span>
              <span className="font-semibold text-[#f59e0b]">Medium</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
