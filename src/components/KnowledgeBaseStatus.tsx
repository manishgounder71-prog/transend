"use client";

import React from "react";
import { Globe, CheckCircle, Cpu } from "lucide-react";

export default function GoogleSearchGrounding() {
  return (
    <div className="mt-auto pt-3 border-t border-white/5">
      <div className="flex items-start gap-2.5">
        <div className="relative mt-0.5">
          <Globe size={12} className="text-emerald-400" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-bold text-emerald-400/80 font-mono uppercase tracking-wider">
              Google Search Grounding
            </span>
            <span className="text-[7px] font-bold text-emerald-500/40 font-mono px-1 py-0.5 border border-emerald-500/20 rounded">
              ACTIVE
            </span>
          </div>
          <p className="text-[8px] text-white/25 font-mono leading-relaxed">
            Boardroom debates &amp; Parallel Universe simulations are grounded
            with real-time Google Search results for data-driven, current
            responses.
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[7px] text-[#a855f7]/50 font-mono">
              <CheckCircle size={7} />
              Boardroom
            </span>
            <span className="flex items-center gap-1 text-[7px] text-[#00f0ff]/50 font-mono">
              <Cpu size={7} />
              Parallel Universe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
