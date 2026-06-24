"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import {
  AlertOctagon, RefreshCw, Sparkles, TrendingUp, Users, ShieldAlert,
  Activity, Zap, Gauge, HeartPulse, ArrowUpRight, ArrowDownRight, BarChart3, Eye,
} from "lucide-react";
import type { TabId } from "@/lib/types";
import { GlowGauge, Sparkline, StatusDot } from "@/components/ui";

interface DashboardProps {
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
}

// ── Constants ──────────────────────────────────────────────

const INITIAL_SPARKLINE = [88, 90, 87, 92, 91, 94, 92];
const INITIAL_INCIDENT_SPARKLINE = [3, 5, 2, 4, 1, 3, 2];

// ── Agent Card Sub-Component ───────────────────────────────

interface AgentCardProps {
  initials: string;
  name: string;
  status: string;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
  textColor: string;
}

const AgentCard = memo(function AgentCard({
  initials,
  name,
  status,
  gradientFrom,
  gradientTo,
  shadowColor,
  textColor,
}: AgentCardProps) {
  return (
    <div className="flex items-center gap-3.5 p-3 bg-black/15 border border-white/5 rounded-lg hover:border-purple-500/20 transition-colors">
      <div
        className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs shadow-[0_0_8px_var(--shadow)] flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          boxShadow: `0 0 8px ${shadowColor}`,
        }}
      >
        {initials}
      </div>
      <div>
        <span className="text-[11.5px] font-semibold block text-white">{name}</span>
        <span className={`font-mono text-[9px] ${textColor} block mt-0.5 animate-pulse`}>
          {status}
        </span>
      </div>
    </div>
  );
});

// ── Main Dashboard Module ──────────────────────────────────

function DashboardModule({ setActiveTab }: DashboardProps) {
  const [healthScore, setHealthScore] = useState(92);
  const [confidence, setConfidence] = useState(84);
  const [sparklineData, setSparklineData] = useState<number[]>(INITIAL_SPARKLINE);
  const [incidentSparkline, setIncidentSparkline] = useState<number[]>(INITIAL_INCIDENT_SPARKLINE);
  const [currentTime, setCurrentTime] = useState("");
  const [animateIn, setAnimateIn] = useState(false);

  // Live time display
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Simulate live updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthScore((prev) =>
        Math.min(100, Math.max(75, prev + (Math.random() > 0.5 ? 1 : -1))),
      );
      setConfidence((prev) =>
        Math.min(100, Math.max(60, prev + (Math.random() > 0.5 ? 2 : -1))),
      );
      setSparklineData((prev) => [...prev.slice(-12), Math.round(80 + Math.random() * 18)]);
      setIncidentSparkline((prev) => [...prev.slice(-12), Math.round(Math.random() * 5)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const latestHealth = sparklineData[sparklineData.length - 1];
  const latestIncidents = incidentSparkline[incidentSparkline.length - 1];
  const stabilityScore = Math.max(0, 100 - latestIncidents * 20);

  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-3 duration-500 flex flex-col gap-6 ${animateIn ? "opacity-100" : "opacity-0"}`}
      role="region"
      aria-label="Mission Control Dashboard"
    >
      {/* Live status bar */}
      <div className="glass-panel p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusDot color="green" pulse size="md" label="All systems nominal" />
          <span className="text-[10px] font-bold text-white/60 font-mono">ALL SYSTEMS NOMINAL</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-white/30">
            <Eye size={10} className="inline mr-1" aria-hidden="true" />
            {currentTime}
          </span>
          <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/20 bg-black/30 px-2 py-0.5 rounded">
            <Zap size={9} className="text-[#00f0ff]" aria-hidden="true" />
            <span>LIVE</span>
          </div>
        </div>
      </div>

      {/* Alert Center Alert Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pipeline crash alert */}
        <button
          onClick={() => setActiveTab("pipeline")}
          className="glass-panel p-3.5 border-l-4 border-l-[#ef4444] hover:bg-white/2 cursor-pointer flex items-center justify-between transition animate-pulse group text-left"
          aria-label="View crashed pipeline in CI"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <RefreshCw size={14} className="text-[#ef4444] animate-spin" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#ef4444] block font-mono">PIPELINE CRASHED</span>
              <span className="text-[11px] text-white/70 block mt-0.5">Auto-Healing Agent active in auth-service-v3.</span>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-mono text-white/30 group-hover:text-white/50 transition-colors">
            VIEW IN CI
            <ArrowUpRight size={10} aria-hidden="true" />
          </span>
        </button>

        {/* Incident alert */}
        <button
          onClick={() => setActiveTab("incidents")}
          className="glass-panel p-3.5 border-l-4 border-l-[#f59e0b] hover:bg-white/2 cursor-pointer flex items-center justify-between transition group text-left"
          aria-label="View active debt alert in incidents"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShieldAlert size={15} className="text-[#f59e0b] animate-bounce" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#f59e0b] block font-mono">ACTIVE DEBT ALERT</span>
              <span className="text-[11px] text-white/70 block mt-0.5">Database thread pooling locks detected on gate replicas.</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-white/30 group-hover:text-white/50 transition-colors">
            DECK IN INC ➔
          </span>
        </button>
      </div>

      {/* Glow gauge row */}
      <div className="grid grid-cols-4 gap-3">
        <GlowGauge value={healthScore} label="Health" sublabel="Engineering" color="#10b981" icon={HeartPulse} />
        <GlowGauge value={confidence} label="Confidence" sublabel="Release Ready" color="#00f0ff" icon={BarChart3} />
        <GlowGauge value={Math.round(latestHealth)} label="Uptime" sublabel="Last 24h" color="#a855f7" icon={Gauge} />
        <GlowGauge value={stabilityScore} label="Stability" sublabel="Incident Rate" color="#f59e0b" icon={Activity} />
      </div>

      {/* Main Grid Deck */}
      <div className="grid grid-cols-1 xl:grid-cols-[290px_1fr_350px] gap-6">
        {/* Left Side */}
        <div className="flex flex-col gap-6">
          {/* Engineering Health */}
          <button
            onClick={() => setActiveTab("timemachine")}
            className="glass-panel p-6 flex flex-col items-center glow-border-success cursor-pointer hover:bg-white/[0.01] transition group text-center"
            aria-label="View engineering health timeline"
          >
            <div className="flex justify-between items-center w-full mb-1">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">Engineering Health</h3>
              <Activity size={12} className="text-[#10b981]" aria-hidden="true" />
            </div>

            <div className="relative w-[150px] h-[150px] my-4">
              <svg className="-rotate-90 w-full h-full" aria-hidden="true" viewBox="0 0 150 150">
                <circle className="fill-none stroke-black/25 stroke-[6]" cx="75" cy="75" r="62" />
                <circle
                  className="fill-none stroke-[#10b981] stroke-[6] stroke-linecap-round"
                  style={{
                    strokeDashoffset: 389.56 - (healthScore / 100) * 389.56,
                    filter: "drop-shadow(0 0 6px #10b981)",
                    transition: "stroke-dashoffset 1s ease-out",
                  }}
                  cx="75" cy="75" r="62"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-baseline">
                <span className="text-3xl font-extrabold tracking-tighter tabular-nums">{healthScore}</span>
                <span className="text-xs text-white/40 ml-0.5 font-mono">/100</span>
              </div>
            </div>

            <div className="w-full mb-2">
              <div className="flex justify-between text-[8px] font-mono text-white/20 mb-1">
                <span>Health Trend (12 ticks)</span>
                <span className={latestHealth > sparklineData[0] ? "text-[#10b981]" : "text-[#ef4444]"}>
                  {latestHealth > sparklineData[0] ? "+" : ""}
                  {(latestHealth - sparklineData[0]).toFixed(0)} pts
                </span>
              </div>
              <Sparkline data={sparklineData} color="#10b981" />
            </div>

            <span className="text-[10px] text-white/50 text-center leading-relaxed max-w-[200px] mt-1">
              Uptime normal. 12 repos synchronized. Click to scrub archives.
            </span>
          </button>

          {/* Release Confidence */}
          <button
            onClick={() => setActiveTab("predictor")}
            className="glass-panel p-6 flex flex-col glow-border-blue cursor-pointer hover:bg-white/[0.01] transition group text-left"
            aria-label="View release confidence predictor"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">Release Confidence</h3>
              <Sparkles size={13} className="text-[#00f0ff]" aria-hidden="true" />
            </div>

            <div className="flex justify-between items-baseline mb-2 font-mono">
              <span className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-wide">SAFE TO SHIP</span>
              <span className="text-xl font-extrabold text-[#00f0ff] tabular-nums">{confidence}%</span>
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
                <span className="font-bold text-[#10b981] flex items-center gap-1">
                  <TrendingUp size={10} aria-hidden="true" /> High
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/40">Rollback Risk:</span>
                <span className="font-bold text-[#10b981] flex items-center gap-1">
                  <ArrowDownRight size={10} aria-hidden="true" /> 4% (Low)
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center Side: Active Agents & Impact */}
        <div className="flex flex-col gap-6">
          {/* Active Agents */}
          <button
            onClick={() => setActiveTab("boardroom")}
            className="glass-panel p-6 flex-1 flex flex-col justify-between cursor-pointer hover:bg-white/[0.01] transition group text-left"
            aria-label="Open AI boardroom"
          >
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">Active AI Boardroom Agents</h3>
              <Users size={13} className="text-[#a855f7]" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-3">
              <AgentCard
                initials="CEO"
                name="CEO Agent"
                status="Monitoring Corporate Telemetry // Ready"
                gradientFrom="#a855f7"
                gradientTo="#581c87"
                shadowColor="#a855f7"
                textColor="text-[#a855f7]"
              />
              <AgentCard
                initials="CTO"
                name="CTO Agent"
                status="Reviewing Auth Pool Thread Upgrades // Ready"
                gradientFrom="#0072ff"
                gradientTo="#1e3a5f"
                shadowColor="#0072ff"
                textColor="text-[#00f0ff]"
              />
              <AgentCard
                initials="SEC"
                name="CISO Agent"
                status="Evaluating Gateway Port Manifests // Auditing"
                gradientFrom="#10b981"
                gradientTo="#064e3b"
                shadowColor="#10b981"
                textColor="text-[#10b981]"
              />
            </div>

            <span className="text-[9px] font-mono text-white/30 text-right mt-3 block group-hover:text-white/50 transition-colors">
              CONVENE BOARDROOM DEBATES ➔
            </span>
          </button>

          {/* Business Impact */}
          <button
            onClick={() => setActiveTab("parallel")}
            className="glass-panel p-6 cursor-pointer hover:bg-white/[0.01] transition group text-left"
            aria-label="Open parallel universe simulator"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">Business Impact Engine</h3>
              <TrendingUp size={14} className="text-[#10b981]" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-black/20 border border-white/5 rounded-lg hover:border-cyan-500/20 transition-colors">
                <span className="text-lg font-black text-[#00f0ff] block mb-0.5 tabular-nums">$42.8k</span>
                <span className="text-[7.5px] font-bold text-white/40 uppercase block">Cost Saved</span>
              </div>
              <div className="text-center p-3 bg-black/20 border border-white/5 rounded-lg hover:border-purple-500/20 transition-colors">
                <span className="text-lg font-black text-[#a855f7] block mb-0.5 tabular-nums">928 hrs</span>
                <span className="text-[7.5px] font-bold text-white/40 uppercase block">Time Saved</span>
              </div>
              <div className="text-center p-3 bg-black/20 border border-white/5 rounded-lg hover:border-emerald-500/20 transition-colors">
                <span className="text-lg font-black text-[#10b981] block mb-0.5 tabular-nums">+340%</span>
                <span className="text-[7.5px] font-bold text-white/40 uppercase block">Uptime Velocity</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex justify-between text-[8px] font-mono text-white/20 mb-1">
                <span>Incident Frequency</span>
                <span className="text-[#f59e0b]">{latestIncidents} active</span>
              </div>
              <Sparkline data={incidentSparkline} color="#f59e0b" />
            </div>
          </button>
        </div>

        {/* Right Side: Incident Radar */}
        <div>
          <button
            onClick={() => setActiveTab("incidents")}
            className="glass-panel p-6 h-full flex flex-col justify-between items-center min-h-[380px] cursor-pointer hover:bg-white/[0.01] transition group text-center w-full"
            aria-label="View incident radar"
          >
            <div className="flex justify-between items-center w-full mb-1">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">Incident Radar</h3>
              <AlertOctagon size={13} className="text-[#ef4444]" aria-hidden="true" />
            </div>

            <div className="relative w-[190px] h-[190px] bg-red-500/[0.04] border border-red-500/10 rounded-full overflow-hidden my-4">
              <div className="radar-sweep-effect" />
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_30px_rgba(255,255,255,0.02),inset_0_0_0_60px_rgba(255,255,255,0.02)]" />
              <div className="absolute top-0 left-[95px] w-[1px] h-full bg-white/[0.03]" />
              <div className="absolute top-[95px] left-0 w-full h-[1px] bg-white/[0.03]" />
              <div className="absolute top-[28%] left-[68%] w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444] animate-ping" />
              <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444]" />
              <div className="absolute top-[68%] left-[23%] w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444] animate-ping" />
              <div className="absolute top-[70%] left-[25%] w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444]" />
              <div className="absolute top-[42%] left-[13%] w-1 h-1 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b] animate-ping" />
              <div className="absolute top-[18%] left-[50%] w-1 h-1 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="flex items-center gap-2 text-[9.5px] text-white/50 tracking-wide mt-2">
              <StatusDot color="red" pulse size="sm" label="Critical alert" />
              <span>Ingress Scan: 2 anomalies in prod clusters.</span>
            </div>

            <div className="flex items-center gap-3 text-[8px] font-mono text-white/20 mt-1">
              <span>● Critical: 2</span>
              <span>● Warning: 1</span>
              <span>● Resolved: 1</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardModule);
