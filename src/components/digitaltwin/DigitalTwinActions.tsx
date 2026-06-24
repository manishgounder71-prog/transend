"use client";

import React from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import type { TwinNode } from "./digitalTwinData";

interface DigitalTwinActionsProps {
  selectedNode: TwinNode | null;
  isProcessing: boolean;
  onRecycle: (nodeId: string) => void;
  onChaosMonkey: (nodeId: string) => void;
}

export default function DigitalTwinActions({ selectedNode, isProcessing, onRecycle, onChaosMonkey }: DigitalTwinActionsProps) {
  if (!selectedNode || selectedNode.id === "root") return null;

  return (
    <div className="flex flex-col gap-2 border-t border-white/10 pt-4 mt-4">
      <button
        disabled={isProcessing}
        onClick={() => onRecycle(selectedNode.id)}
        className="w-full flex items-center justify-center gap-2 font-sans font-bold text-[10px] text-slate-950 bg-[#00f0ff] hover:bg-[#00f0ff]/80 transition rounded py-2 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed"
      >
        <RefreshCw size={11} className={isProcessing ? "animate-spin" : ""} />
        Recycle Kubernetes Pods
      </button>
      <button
        disabled={isProcessing}
        onClick={() => onChaosMonkey(selectedNode.id)}
        className={`w-full flex items-center justify-center gap-2 font-sans font-bold text-[10px] border transition rounded py-2 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed ${
          selectedNode.status === "CRITICAL"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
        }`}
      >
        <AlertTriangle size={11} />
        {selectedNode.status === "CRITICAL" ? "Resolve Outage State" : "Simulate Outage Event"}
      </button>
    </div>
  );
}
