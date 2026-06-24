"use client";

import React from "react";
import { Award, ShieldAlert } from "lucide-react";

interface BoardroomVerdictProps {
  verdict: string;
  isDebating: boolean;
  isLoadingAI: boolean;
  bubbles: unknown[];
}

export default function BoardroomVerdict({ verdict, isDebating, isLoadingAI, bubbles }: BoardroomVerdictProps) {
  const hasResult = bubbles.length > 0 && !isDebating && !isLoadingAI;

  return (
    <div
      className="mt-3 p-3 rounded-lg border border-dashed text-xs bg-cyan-500/[0.02] select-none"
      style={{
        borderColor: hasResult ? "rgba(16, 185, 129, 0.25)" : "rgba(255,255,255,0.06)",
        boxShadow: hasResult ? "0 0 10px rgba(16,185,129,0.08)" : "none",
      }}
    >
      <h4 className="font-bold uppercase tracking-wider text-[9px] text-[#00f0ff] mb-1 select-none flex items-center gap-1.5">
        {hasResult ? <Award size={10} className="text-[#10b981]" /> : <ShieldAlert size={10} />}
        <span>Final Verdict Recommendation</span>
      </h4>
      <p className={`text-[10.5px] leading-normal ${hasResult ? "text-[#10b981] font-semibold" : "text-white/40"}`}>
        {isLoadingAI ? "Awaiting AI executive consensus..." : verdict}
      </p>
    </div>
  );
}
