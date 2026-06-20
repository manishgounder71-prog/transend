"use client";

import React, { useState } from "react";
import { AlertOctagon, RefreshCw, Sparkles, TrendingUp, Users, ShieldAlert, Activity } from "lucide-react";

type TabId = "dashboard" | "digitaltwin" | "parallel" | "boardroom" | "predictor" | "hacker" | "incidents" | "timemachine" | "pipeline" | "gitlab";

interface DashboardProps {
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
}

export default function DashboardModule({ setActiveTab }: DashboardProps) {
  const [healthScore] = useState(92);
  const [confidence] = useState(84);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 flex flex-col gap-6">
      
      {/* Alert Center Alert Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pipeline crash alert */}
        <div 
          onClick={() => setActiveTab("pipeline")}
          className="glass-panel p-3.5 border-l-4 border-l-[#ef4444] hover:bg-white/2 cursor-pointer flex items-center justify-between transition animate-pulse"
        >
          <div className="flex items-center gap-3">
            <RefreshCw size={14} className="text-[#ef4444] animate-spin" />
            <div>
              <span className="text-[10px] font-bold text-[#ef4444] block font-mono">PIPELINE CRASHED</span>
              <span className="text-[11px] text-white/70 block mt-0.5">Auto-Healing Agent active in auth-service-v3.</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-white/30">VIEW IN CI ➔</span>
        </div>

        {/* Incident alert */}
        <div 
          onClick={() => setActiveTab("incidents")}
          className="glass-panel p-3.5 border-l-4 border-l-[#f59e0b] hover:bg-white/2 cursor-pointer flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert size={15} className="text-[#f59e0b] animate-bounce" />
            <div>
              <span className="text-[10px] font-bold text-[#f59e0b] block font-mono">ACTIVE DEBT ALERT</span>
              <span className="text-[11px] text-white/70 block mt-0.5">Database thread pooling locks detected on gate replicas.</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-white/30">DECK IN INC ➔</span>
        </div>
      </div>

      {/* Main Grid Deck */}
      <div className="grid grid-cols-1 xl:grid-cols-[290px_1fr_350px] gap-6">
        
        {/* Left Side: Circular score & release confidence */}
        <div className="flex flex-col gap-6">
          
          {/* Health circular progress */}
          <div 
            onClick={() => setActiveTab("timemachine")}
            className="glass-panel p-6 flex flex-col items-center glow-border-success cursor-pointer hover:bg-white/[0.01] transition"
          >
            <div className="flex justify-between items-center w-full mb-1">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
                Engineering Health
              </h3>
              <Activity size={12} className="text-[#10b981]" />
            </div>
            
            <div className="relative w-[150px] h-[150px] my-4">
              <svg className="-rotate-90 w-full h-full">
                <circle 
                  className="fill-none stroke-black/25 stroke-[6]"
                  cx="75" cy="75" r="62"
                />
                <circle 
                  className="fill-none stroke-[#10b981] stroke-[6] stroke-linecap-round circle-front-fill"
                  style={{ 
                    strokeDashoffset: 389.56 - (healthScore / 100) * 389.56,
                    filter: "drop-shadow(0 0 6px #10b981)"
                  }}
                  cx="75" cy="75" r="62"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-baseline">
                <span className="text-3xl font-extrabold tracking-tighter">{healthScore}</span>
                <span className="text-xs text-white/40 ml-0.5 font-mono">/100</span>
              </div>
            </div>
            
            <span className="text-[10px] text-white/50 text-center leading-relaxed max-w-[200px] mt-1 select-none">
              Uptime normal. 12 repos synchronized. Click to scrub archives.
            </span>
          </div>

          {/* Release Confidence */}
          <div 
            onClick={() => setActiveTab("predictor")}
            className="glass-panel p-6 flex flex-col glow-border-blue cursor-pointer hover:bg-white/[0.01] transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
                Release Confidence
              </h3>
              <Sparkles size={13} className="text-[#00f0ff]" />
            </div>
            
            <div className="flex justify-between items-baseline mb-2 font-mono">
              <span className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-wide">
                SAFE TO SHIP
              </span>
              <span className="text-xl font-extrabold text-[#00f0ff]">{confidence}%</span>
            </div>
            
            <div className="h-1.5 bg-black/45 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#0072ff] to-[#00f0ff] rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)] transition-all duration-1000"
                style={{ width: `${confidence}%` }}
              />
            </div>
            
            <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/40">Success Forecast:</span>
                <span className="font-bold text-[#10b981]">High</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/40">Rollback Risk:</span>
                <span className="font-bold text-[#10b981]">4% (Low)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Center Side: Active Agents & Impact */}
        <div className="flex flex-col gap-6">
          
          {/* Active Agents list */}
          <div 
            onClick={() => setActiveTab("boardroom")}
            className="glass-panel p-6 flex-1 flex flex-col justify-between cursor-pointer hover:bg-white/[0.01] transition"
          >
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
                Active AI Boardroom Agents
              </h3>
              <Users size={13} className="text-[#a855f7]" />
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Agent CEO */}
              <div className="flex items-center gap-3.5 p-3 bg-black/15 border border-white/5 rounded-lg">
                <div className="w-8 h-8 rounded bg-[#a855f7] flex items-center justify-center font-bold text-xs shadow-[0_0_8px_#a855f7] flex-shrink-0">
                  CEO
                </div>
                <div>
                  <span className="text-[11.5px] font-semibold block text-white">CEO Agent</span>
                  <span className="font-mono text-[9px] text-[#a855f7] block mt-0.5 animate-pulse">
                    Monitoring Corporate Telemetry // Ready
                  </span>
                </div>
              </div>
              
              {/* Agent CTO */}
              <div className="flex items-center gap-3.5 p-3 bg-black/15 border border-white/5 rounded-lg">
                <div className="w-8 h-8 rounded bg-[#0072ff] flex items-center justify-center font-bold text-xs shadow-[0_0_8px_#0072ff] flex-shrink-0">
                  CTO
                </div>
                <div>
                  <span className="text-[11.5px] font-semibold block text-white">CTO Agent</span>
                  <span className="font-mono text-[9px] text-[#00f0ff] block mt-0.5 animate-pulse">
                    Reviewing Auth Pool Thread Upgrades // Ready
                  </span>
                </div>
              </div>

              {/* Agent CISO */}
              <div className="flex items-center gap-3.5 p-3 bg-black/15 border border-white/5 rounded-lg">
                <div className="w-8 h-8 rounded bg-[#10b981] flex items-center justify-center font-bold text-xs shadow-[0_0_8px_#10b981] flex-shrink-0">
                  SEC
                </div>
                <div>
                  <span className="text-[11.5px] font-semibold block text-white">CISO Agent</span>
                  <span className="font-mono text-[9px] text-[#10b981] block mt-0.5 animate-pulse">
                    Evaluating Gateway Port Manifests // Auditing
                  </span>
                </div>
              </div>
            </div>
            
            <span className="text-[9px] font-mono text-white/30 text-right mt-3 block select-none">CONVENE BOARDROOM DEBATES ➔</span>
          </div>

          {/* Business Impact Card */}
          <div 
            onClick={() => setActiveTab("parallel")}
            className="glass-panel p-6 cursor-pointer hover:bg-white/[0.01] transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
                Business Impact Engine
              </h3>
              <TrendingUp size={14} className="text-[#10b981]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-black/20 border border-white/5 rounded-lg">
                <span className="text-lg font-black text-[#00f0ff] block mb-0.5">$42.8k</span>
                <span className="text-[7.5px] font-bold text-white/40 uppercase block">Cost Saved</span>
              </div>
              <div className="text-center p-3 bg-black/20 border border-white/5 rounded-lg">
                <span className="text-lg font-black text-[#a855f7] block mb-0.5">928 hrs</span>
                <span className="text-[7.5px] font-bold text-white/40 uppercase block">Time Saved</span>
              </div>
              <div className="text-center p-3 bg-black/20 border border-white/5 rounded-lg">
                <span className="text-lg font-black text-[#10b981] block mb-0.5">+340%</span>
                <span className="text-[7.5px] font-bold text-white/40 uppercase block">Uptime Velocity</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Incident Radar Sweep */}
        <div>
          <div 
            onClick={() => setActiveTab("incidents")}
            className="glass-panel p-6 h-full flex flex-col justify-between items-center min-h-[380px] cursor-pointer hover:bg-white/[0.01] transition"
          >
            <div className="flex justify-between items-center w-full mb-1">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
                Incident Radar
              </h3>
              <AlertOctagon size={13} className="text-[#ef4444]" />
            </div>
            
            <div className="relative w-[190px] h-[190px] bg-red-500/[0.04] border border-red-500/10 rounded-full overflow-hidden my-4">
              <div className="radar-sweep-effect" />
              {/* Radar Rings Grid */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_30px_rgba(255,255,255,0.02),inset_0_0_0_60px_rgba(255,255,255,0.02)]" />
              <div className="absolute top-0 left-[95px] w-[1px] h-full bg-white/[0.03]" />
              <div className="absolute top-[95px] left-0 w-full h-[1px] bg-white/[0.03]" />
              
              {/* Flashing Blips */}
              <div className="absolute top-[28%] left-[68%] w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444] animate-ping" />
              <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444]" />
              
              <div className="absolute top-[68%] left-[23%] w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444] animate-ping" />
              <div className="absolute top-[70%] left-[25%] w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444]" />
            </div>
            
            <div className="flex items-center gap-2 text-[9.5px] text-white/50 tracking-wide mt-2 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] pulse-red" />
              <span>Ingress Scan: 2 anomalies in prod clusters.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
