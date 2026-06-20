"use client";

import React, { useState } from "react";
import { GitFork, Users, Calendar, AlertOctagon, TrendingUp, HelpCircle } from "lucide-react";

interface UniverseBranch {
  name: string;
  probability: string;
  revenue: string;
  incidents: string;
  velocity: string;
  vulnerabilities: string;
  theme: "cyan" | "purple" | "warning";
}

const templates = [
  { text: "What if we hire 2 engineers?", icon: Users },
  { text: "What if release is delayed by 1 week?", icon: Calendar },
  { text: "What if auth-service fails?", icon: AlertOctagon },
  { text: "What if traffic increases 500%?", icon: TrendingUp }
];

export default function ParallelSimulator({ onSimulate }: { onSimulate: () => void }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<UniverseBranch[] | null>(null);

  // Extract numeric values from a query string
  const extractNumber = (text: string): number => {
    const matches = text.match(/\d+/g);
    if (matches && matches.length > 0) {
      return parseInt(matches[0], 10);
    }
    return 0;
  };

  const formatCurrency = (val: number): string => {
    if (Math.abs(val) >= 1000) return `${val >= 0 ? "+" : ""}$${Math.round(val / 1000)}k`;
    return `${val >= 0 ? "+" : ""}$${val.toLocaleString()}`;
  };

  const runSimulation = (scenarioText?: string) => {
    const targetQuery = scenarioText || query;
    if (!targetQuery.trim()) return;
    
    setIsLoading(true);
    setBranches(null);
    onSimulate(); // Callback to trigger boardroom debate sync

    setTimeout(() => {
      setIsLoading(false);
      const cmd = targetQuery.toLowerCase();
      const num = extractNumber(cmd);
      
      if (cmd.includes("hire") || cmd.includes("engineer")) {
        // Dynamic: each engineer costs ~$12k/mo salary, boosts velocity by ~8%, revenue by $36k
        const n = num || 2; // default to 2 engineers
        const revenueBoost = n * 36000;
        const velocityBoost = Math.min(60, n * 8);
        const trainingCost = n * 5000;
        const extremeRevenue = n * 64000;

        setBranches([
          {
            name: `Universe A: ${n}-Engineer Sprint Boost`,
            probability: `${Math.max(50, 85 - n * 3)}% PROBABILITY`,
            revenue: `${formatCurrency(revenueBoost)} (${n}× Sprint Speedup)`,
            incidents: `${Math.min(15, 2 + n)}% (Nominal)`,
            velocity: `+${velocityBoost}% (${n}× Dev Boost)`,
            vulnerabilities: "0 (All Patched)",
            theme: "cyan"
          },
          {
            name: `Universe B: Onboarding Overhead (×${n})`,
            probability: `${Math.min(35, 12 + n * 2)}% PROBABILITY`,
            revenue: `${formatCurrency(-trainingCost)} (Training ×${n})`,
            incidents: `${Math.min(30, 8 + n * 3)}% (PR review lag)`,
            velocity: `-${Math.min(25, 5 + n * 2)}% (Short-term lag)`,
            vulnerabilities: `${Math.min(4, Math.ceil(n / 2))} (Unreviewed)`,
            theme: "purple"
          },
          {
            name: `Universe C: Peak Efficiency (×${n})`,
            probability: `${Math.max(2, 8 - n)}% PROBABILITY`,
            revenue: `${formatCurrency(extremeRevenue)} (Peak Output)`,
            incidents: "0% (All Clear)",
            velocity: `+${Math.min(80, velocityBoost * 2)}% (Peak Output)`,
            vulnerabilities: "0 (All Patched)",
            theme: "warning"
          }
        ]);
      } else if (cmd.includes("delay") || cmd.includes("week") || cmd.includes("postpone")) {
        // Dynamic: each week delay costs ~$18k/wk opportunity cost, but saves incident risk
        const weeks = num || 1; // default to 1 week
        const safeguardRevenue = weeks * 40000;
        const opportunityCost = weeks * 18000;
        const outageCost = weeks * 28000;

        setBranches([
          {
            name: `Universe A: ${weeks}-Week Safe Delay`,
            probability: `${Math.min(92, 75 + weeks * 3)}% PROBABILITY`,
            revenue: `${formatCurrency(safeguardRevenue)} (${weeks}-wk Safe Window)`,
            incidents: `${Math.max(0, 5 - weeks * 2)}% (Risks Cleared)`,
            velocity: `-${Math.min(30, 10 + weeks * 3)}% (${weeks}-wk Lag)`,
            vulnerabilities: "0 (All Patched)",
            theme: "cyan"
          },
          {
            name: "Universe B: Ship Now Anyway",
            probability: `${Math.max(5, 18 - weeks * 2)}% PROBABILITY`,
            revenue: `${formatCurrency(-opportunityCost)} (Rushed Window)`,
            incidents: `${Math.min(95, 60 + weeks * 12)}% (DB Thread Risk)`,
            velocity: "Nominal",
            vulnerabilities: `${Math.min(6, 1 + weeks)} (Unresolved)`,
            theme: "purple"
          },
          {
            name: `Universe C: ${weeks}-Week Hotfix Cascade`,
            probability: `${Math.max(2, 7 - weeks)}% PROBABILITY`,
            revenue: `${formatCurrency(-outageCost)} (Severe Outage)`,
            incidents: `${Math.min(99, 85 + weeks * 5)}% (High Crash Risk)`,
            velocity: "+10% (Rushed Flow)",
            vulnerabilities: `${Math.min(8, 3 + weeks)} (High Alert)`,
            theme: "warning"
          }
        ]);
      } else if (cmd.includes("auth-service") || cmd.includes("fail") || cmd.includes("service")) {
        setBranches([
          {
            name: "Universe A: Elastic Routing",
            probability: "90% PROBABILITY",
            revenue: "Uptime nominal",
            incidents: "2% (Negligible)",
            velocity: "Nominal",
            vulnerabilities: "0 (Patched)",
            theme: "cyan"
          },
          {
            name: "Universe B: DB Cascading Lock",
            probability: "8% PROBABILITY",
            revenue: "-$85,000 (3hr Outage)",
            incidents: "98% (High Alert)",
            velocity: "-40% (Emergency Mode)",
            vulnerabilities: "3 (Vulnerable)",
            theme: "purple"
          },
          {
            name: "Universe C: Chaos Recovery",
            probability: "2% PROBABILITY",
            revenue: "Uptime nominal",
            incidents: "0% (Reset nominal)",
            velocity: "+5% (Fast Recycle)",
            vulnerabilities: "0",
            theme: "warning"
          }
        ]);
      } else if (cmd.includes("traffic") || cmd.includes("%")) {
        // Dynamic: parse traffic percentage multiplier
        const pct = num || 500;
        const multiplier = pct / 100;
        const revenueGain = Math.round(multiplier * 24000);
        const outageLoss = Math.round(multiplier * 8400);

        setBranches([
          {
            name: `Universe A: Auto-Scale (${pct}% Load)`,
            probability: `${Math.max(55, 90 - Math.floor(multiplier * 3))}% PROBABILITY`,
            revenue: `${formatCurrency(revenueGain)}/mo (Scaled)`,
            incidents: `${Math.min(20, Math.ceil(multiplier))}% (Replicas hold)`,
            velocity: "Nominal",
            vulnerabilities: "0",
            theme: "cyan"
          },
          {
            name: `Universe B: Ingress Overload (${pct}%)`,
            probability: `${Math.min(35, 8 + Math.floor(multiplier * 2))}% PROBABILITY`,
            revenue: `${formatCurrency(-outageLoss)} (Latency drops)`,
            incidents: `${Math.min(95, 50 + Math.floor(multiplier * 5))}% (Thread Starvation)`,
            velocity: `-${Math.min(40, Math.floor(multiplier * 3))}% (Latency lock)`,
            vulnerabilities: `${Math.min(4, Math.ceil(multiplier / 2))}`,
            theme: "purple"
          },
          {
            name: "Universe C: Rate Limiter Throttle",
            probability: `${Math.max(2, 7 - Math.floor(multiplier))}% PROBABILITY`,
            revenue: `${formatCurrency(-Math.round(multiplier * 2000))}/mo (Throttled)`,
            incidents: `${Math.min(30, Math.floor(multiplier * 3))}% (Soft restrict)`,
            velocity: "Nominal",
            vulnerabilities: "0",
            theme: "warning"
          }
        ]);
      } else {
        // Fallback default
        setBranches([
          {
            name: "Universe A: Optimistic Branch",
            probability: "70% PROBABILITY",
            revenue: "+$80k (Boosted Sales)",
            incidents: "5% (Low Risk)",
            velocity: "+12% (Optimal)",
            vulnerabilities: "0 (All Patched)",
            theme: "cyan"
          },
          {
            name: "Universe B: Nominal Branch",
            probability: "25% PROBABILITY",
            revenue: "Nominal",
            incidents: "15% (Typical load)",
            velocity: "Nominal",
            vulnerabilities: "1 (Medium CVE)",
            theme: "purple"
          },
          {
            name: "Universe C: Degraded Branch",
            probability: "5% PROBABILITY",
            revenue: "-$50k (Infrastructure issues)",
            incidents: "75% (High Crash Risk)",
            velocity: "-18% (Technical Debt)",
            vulnerabilities: "4 (Critical CVE)",
            theme: "warning"
          }
        ]);
      }
    }, 1500);
  };

  const handleTemplateClick = (text: string) => {
    setQuery(text);
    runSimulation(text);
  };

  const getBorderColor = (theme: string) => {
    if (theme === "cyan") return "before:bg-[#00f0ff]";
    if (theme === "purple") return "before:bg-[#a855f7]";
    return "before:bg-[#f59e0b]";
  };

  const getProbColor = (theme: string) => {
    if (theme === "cyan") return "text-[#00f0ff]";
    if (theme === "purple") return "text-[#a855f7]";
    return "text-[#f59e0b]";
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* Simulation Prompt */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white tracking-wide uppercase select-none">
          Parallel Universe Simulation Engine
        </h3>
        <p className="text-[10px] text-white/40 mt-0.5 mb-4 leading-relaxed">
          Forecast the impact of critical software decisions across multiple future branches (velocity, cost, incident probability, revenue impact).
        </p>

        {/* Query Input Deck */}
        <div className="grid grid-cols-[24px_1fr_140px] items-center gap-3 bg-black/30 border border-white/5 rounded-lg px-4 py-2 w-full">
          <GitFork size={14} className="text-[#00f0ff]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSimulation();
            }}
            placeholder="Enter scenario (e.g. 'What if we delay launch 2 weeks to fix tech debt?')..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder-white/30 w-full"
          />
          <button
            onClick={() => runSimulation()}
            className="font-sans text-[11px] font-bold text-slate-950 bg-[#00f0ff] border-none rounded px-4 py-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:shadow-[0_0_16px_rgba(0,240,255,0.6)] transition"
          >
            Simulate Branch
          </button>
        </div>

        {/* Quick Scenario Templates list */}
        <div className="mt-4 flex flex-col gap-2">
          <span className="font-mono text-[9px] font-bold text-white/30 tracking-wider uppercase select-none">
            💡 QUICK SCENARIO TEMPLATES
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map((tpl, i) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleTemplateClick(tpl.text)}
                  className="glass-panel p-2.5 flex items-center gap-2.5 hover:border-[#00f0ff]/30 text-left transition hover:bg-white/2 cursor-pointer group active:scale-[0.98]"
                >
                  <Icon size={14} className="text-white/40 group-hover:text-[#00f0ff] transition" />
                  <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition leading-tight">
                    {tpl.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Branches Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading && (
          <div className="col-span-3 glass-panel p-10 flex flex-col justify-center items-center gap-3 text-center">
            <svg className="w-9 h-9 text-[#00f0ff] animate-spin" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" stroke-dasharray="32 32"/>
            </svg>
            <h3 className="text-xs font-semibold font-mono text-white animate-pulse">
              Calculating Parallel Realities...
            </h3>
          </div>
        )}

        {!isLoading && !branches && (
          <div className="col-span-3 glass-panel py-12 flex flex-col items-center justify-center text-center gap-2 text-white/30">
            <HelpCircle size={24} className="animate-bounce" />
            <p className="text-xs font-medium">
              Enter a decision parameter or click one of the quick scenario cards above to calculate timelines.
            </p>
          </div>
        )}

        {!isLoading && branches && branches.map((branch, i) => (
          <div 
            key={i}
            className={`glass-panel p-5 relative overflow-hidden flex flex-col justify-between min-h-[220px] before:content-[""] before:absolute before:top-0 before:left-0 before:w-1 before:h-full ${getBorderColor(branch.theme)} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                <h4 className="text-[11.5px] font-bold text-white tracking-tight">{branch.name}</h4>
                <span className={`font-mono text-[9px] font-bold ${getProbColor(branch.theme)}`}>
                  {branch.probability}
                </span>
              </div>
              <div className="flex flex-col gap-2 font-mono text-[10.5px]">
                <div className="flex justify-between border-b border-white/[0.02] pb-1">
                  <span className="text-white/40">Revenue:</span>
                  <span className="font-semibold text-[#10b981]">{branch.revenue}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.02] pb-1">
                  <span className="text-white/40">Incidents:</span>
                  <span className="font-semibold text-slate-200">{branch.incidents}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.02] pb-1">
                  <span className="text-white/40">Velocity:</span>
                  <span className="font-semibold text-[#00f0ff]">{branch.velocity}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.02] pb-1">
                  <span className="text-white/40">Vulnerabilities:</span>
                  <span className="font-semibold text-slate-200">{branch.vulnerabilities}</span>
                </div>
              </div>
            </div>
            
            {/* Visual dashed connector lines */}
            <div className="h-4 border-t border-dashed border-white/10 relative mt-4">
              <span className="absolute -top-1 left-[30%] w-1.5 h-1.5 rounded-full bg-[#0072ff] animate-ping" />
              <span className="absolute -top-1 left-[30%] w-1.5 h-1.5 rounded-full bg-[#0072ff]" />
              <span className="absolute -top-1 left-[70%] w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-ping" />
              <span className="absolute -top-1 left-[70%] w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
