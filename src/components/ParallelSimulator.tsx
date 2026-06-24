"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { dispatchGameEvent } from "@/lib/gamification";
import {
  type UniverseBranch,
  type AISimulationResult,
  templates,
  extractNumber,
  formatCurrency,
} from "./parallel/parallelData";
import ParallelSimulatorInput from "./parallel/ParallelSimulatorInput";
import ParallelSimulatorBranch from "./parallel/ParallelSimulatorBranch";
import ParallelSimulatorAnalysis from "./parallel/ParallelSimulatorAnalysis";

export default function ParallelSimulator({ onSimulate }: { onSimulate: () => void }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "generating" | "fallback" | "ready">("idle");
  const [branches, setBranches] = useState<UniverseBranch[] | null>(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState<string | null>(null);
  const [metricsSummary, setMetricsSummary] = useState<AISimulationResult["metricsSummary"] | null>(null);

  // Fetch AI-generated simulation from the API
  const fetchAISimulation = async (scenarioText: string): Promise<AISimulationResult | null> => {
    try {
      const response = await fetch("/api/ai/parallel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioText }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.needsFallback) return null;
        throw new Error(data.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data as AISimulationResult;
    } catch (err) {
      console.error("AI simulation fetch failed:", err);
      return null;
    }
  };

  const runSimulation = async (scenarioText?: string) => {
    const targetQuery = scenarioText || query;
    if (!targetQuery.trim()) return;

    // Try AI first
    setIsLoading(true);
    setIsLoadingAI(true);
    setAiStatus("generating");
    setBranches(null);
    setScenarioAnalysis(null);
    setMetricsSummary(null);
    onSimulate();

    const aiResult = await fetchAISimulation(targetQuery);

    if (aiResult && aiResult.branches && aiResult.branches.length === 3) {
      setAiStatus("ready");
      setIsLoadingAI(false);
      const validatedBranches = aiResult.branches.map((b) => ({
        ...b,
        theme: b.theme as "cyan" | "purple" | "warning",
      }));
      setBranches(validatedBranches);
      setScenarioAnalysis(aiResult.scenarioAnalysis);
      setMetricsSummary(aiResult.metricsSummary);
      setIsLoading(false);
      dispatchGameEvent("parallel:simulated");
      return;
    }

    // Fallback to local simulation engine
    setAiStatus("fallback");
    setIsLoadingAI(false);

    setTimeout(() => {
      setIsLoading(false);
      const cmd = targetQuery.toLowerCase();
      const num = extractNumber(cmd);

      if (cmd.includes("hire") || cmd.includes("engineer")) {
        const n = num || 2;
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
            theme: "cyan",
            narrative: `Adding ${n} engineers accelerates feature delivery by ${velocityBoost}% with minimal disruption. Best-case execution with strong onboarding.`,
          },
          {
            name: `Universe B: Onboarding Overhead (×${n})`,
            probability: `${Math.min(35, 12 + n * 2)}% PROBABILITY`,
            revenue: `${formatCurrency(-trainingCost)} (Training ×${n})`,
            incidents: `${Math.min(30, 8 + n * 3)}% (PR review lag)`,
            velocity: `-${Math.min(25, 5 + n * 2)}% (Short-term lag)`,
            vulnerabilities: `${Math.min(4, Math.ceil(n / 2))} (Unreviewed)`,
            theme: "purple",
            narrative: `New hires require ${n}× onboarding overhead, temporarily slowing delivery velocity while senior engineers ramp up on the codebase.`,
          },
          {
            name: `Universe C: Peak Efficiency (×${n})`,
            probability: `${Math.max(2, 8 - n)}% PROBABILITY`,
            revenue: `${formatCurrency(extremeRevenue)} (Peak Output)`,
            incidents: "0% (All Clear)",
            velocity: `+${Math.min(80, velocityBoost * 2)}% (Peak Output)`,
            vulnerabilities: "0 (All Patched)",
            theme: "warning",
            narrative: `In a perfect scenario, ${n} engineers hit peak efficiency immediately — but this requires flawless integration rarely achieved in practice.`,
          },
        ]);
        setScenarioAnalysis(`Hiring ${n} engineers presents a ${Math.max(50, 85 - n * 3)}% probability of positive outcome, but carries short-term onboarding costs. The net benefit materializes after the initial ramp-up period.`);
      } else if (cmd.includes("delay") || cmd.includes("week") || cmd.includes("postpone")) {
        const weeks = num || 1;
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
            theme: "cyan",
            narrative: `A ${weeks}-week delay clears technical debt and reduces incident risk significantly. The safe window allows for comprehensive testing and security hardening.`,
          },
          {
            name: "Universe B: Ship Now Anyway",
            probability: `${Math.max(5, 18 - weeks * 2)}% PROBABILITY`,
            revenue: `${formatCurrency(-opportunityCost)} (Rushed Window)`,
            incidents: `${Math.min(95, 60 + weeks * 12)}% (DB Thread Risk)`,
            velocity: "Nominal",
            vulnerabilities: `${Math.min(6, 1 + weeks)} (Unresolved)`,
            theme: "purple",
            narrative: `Shipping immediately captures short-term revenue but exposes the team to ${Math.min(95, 60 + weeks * 12)}% incident probability from unresolved technical debt.`,
          },
          {
            name: `Universe C: ${weeks}-Week Hotfix Cascade`,
            probability: `${Math.max(2, 7 - weeks)}% PROBABILITY`,
            revenue: `${formatCurrency(-outageCost)} (Severe Outage)`,
            incidents: `${Math.min(99, 85 + weeks * 5)}% (High Crash Risk)`,
            velocity: "+10% (Rushed Flow)",
            vulnerabilities: `${Math.min(8, 3 + weeks)} (High Alert)`,
            theme: "warning",
            narrative: `A rushed deployment triggers cascading hotfixes, resulting in ${Math.min(99, 85 + weeks * 5)}% incident probability and severe customer impact.`,
          },
        ]);
        setScenarioAnalysis(`A ${weeks}-week delay is the safest path with ${Math.min(92, 75 + weeks * 3)}% probability of success. The primary risk of shipping now is database thread pool exhaustion and cascading failures.`);
      } else if (cmd.includes("auth-service") || cmd.includes("fail") || cmd.includes("service")) {
        setBranches([
          {
            name: "Universe A: Elastic Routing",
            probability: "90% PROBABILITY",
            revenue: "Uptime nominal",
            incidents: "2% (Negligible)",
            velocity: "Nominal",
            vulnerabilities: "0 (Patched)",
            theme: "cyan",
            narrative: "Elastic routing and circuit breakers successfully isolate the auth-service failure. User-facing impact is minimal with automatic failover.",
          },
          {
            name: "Universe B: DB Cascading Lock",
            probability: "8% PROBABILITY",
            revenue: "-$85,000 (3hr Outage)",
            incidents: "98% (High Alert)",
            velocity: "-40% (Emergency Mode)",
            vulnerabilities: "3 (Vulnerable)",
            theme: "purple",
            narrative: "Database connection pool exhaustion cascades across services, causing a 3-hour outage. Emergency mode reduces all service capacity by 40%.",
          },
          {
            name: "Universe C: Chaos Recovery",
            probability: "2% PROBABILITY",
            revenue: "Uptime nominal",
            incidents: "0% (Reset nominal)",
            velocity: "+5% (Fast Recycle)",
            vulnerabilities: "0",
            theme: "warning",
            narrative: "A rare scenario where rapid pod recycling and connection re-establishment results in zero downtime — but this requires perfect orchestration.",
          },
        ]);
        setScenarioAnalysis("Auth-service failure has a 90% chance of graceful degradation via elastic routing. The main risk is database connection pool cascading locks, which can cause multi-hour outages.");
      } else if (cmd.includes("traffic") || cmd.includes("%")) {
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
            theme: "cyan",
            narrative: `Auto-scaling handles ${pct}% traffic load seamlessly. Horizontal pod autoscaling provisions additional replicas to maintain throughput.`,
          },
          {
            name: `Universe B: Ingress Overload (${pct}%)`,
            probability: `${Math.min(35, 8 + Math.floor(multiplier * 2))}% PROBABILITY`,
            revenue: `${formatCurrency(-outageLoss)} (Latency drops)`,
            incidents: `${Math.min(95, 50 + Math.floor(multiplier * 5))}% (Thread Starvation)`,
            velocity: `-${Math.min(40, Math.floor(multiplier * 3))}% (Latency lock)`,
            vulnerabilities: `${Math.min(4, Math.ceil(multiplier / 2))}`,
            theme: "purple",
            narrative: `Ingress throttling under ${pct}% load causes thread starvation and severe latency degradation. Auto-scaling triggers too late to prevent impact.`,
          },
          {
            name: "Universe C: Rate Limiter Throttle",
            probability: `${Math.max(2, 7 - Math.floor(multiplier))}% PROBABILITY`,
            revenue: `${formatCurrency(-Math.round(multiplier * 2000))}/mo (Throttled)`,
            incidents: `${Math.min(30, Math.floor(multiplier * 3))}% (Soft restrict)`,
            velocity: "Nominal",
            vulnerabilities: "0",
            theme: "warning",
            narrative: `Rate limiters cut traffic to manageable levels, preventing total outage but causing revenue loss from throttled user requests.`,
          },
        ]);
        setScenarioAnalysis(`${pct}% traffic surge has a ${Math.max(55, 90 - Math.floor(multiplier * 3))}% probability of successful auto-scaling. The key risk is ingress overload causing thread starvation and customer-facing latency.`);
      } else {
        setBranches([
          {
            name: "Universe A: Optimistic Branch",
            probability: "70% PROBABILITY",
            revenue: "+$80k (Boosted Sales)",
            incidents: "5% (Low Risk)",
            velocity: "+12% (Optimal)",
            vulnerabilities: "0 (All Patched)",
            theme: "cyan",
            narrative: "Best-case execution with successful team coordination, minimal technical debt, and favorable market conditions.",
          },
          {
            name: "Universe B: Nominal Branch",
            probability: "25% PROBABILITY",
            revenue: "Nominal",
            incidents: "15% (Typical load)",
            velocity: "Nominal",
            vulnerabilities: "1 (Medium CVE)",
            theme: "purple",
            narrative: "Standard operational conditions with moderate risks. Normal engineering throughput with average incident response.",
          },
          {
            name: "Universe C: Degraded Branch",
            probability: "5% PROBABILITY",
            revenue: "-$50k (Infrastructure issues)",
            incidents: "75% (High Crash Risk)",
            velocity: "-18% (Technical Debt)",
            vulnerabilities: "4 (Critical CVE)",
            theme: "warning",
            narrative: "Worst-case scenario where unresolved technical debt, infrastructure instability, and security vulnerabilities compound into significant business impact.",
          },
        ]);
        setScenarioAnalysis("This scenario carries a 70% probability of positive outcome. The primary risks are technical debt accumulation and infrastructure stability under load.");
      }
      // Fire game event for XP tracking on fallback simulation
      dispatchGameEvent("parallel:simulated");
    }, 1500);
  };

  const handleTemplateClick = (text: string) => {
    setQuery(text);
    runSimulation(text);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <ParallelSimulatorInput
        query={query}
        isLoading={isLoading}
        isLoadingAI={isLoadingAI}
        aiStatus={aiStatus}
        templates={templates}
        onQueryChange={setQuery}
        onEnterPress={() => runSimulation()}
        onSimulate={() => runSimulation()}
        onTemplateClick={handleTemplateClick}
      />

      {scenarioAnalysis && !isLoading && (
        <ParallelSimulatorAnalysis
          scenarioAnalysis={scenarioAnalysis}
          metricsSummary={metricsSummary}
        />
      )}

      {/* Branches Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading && (
          <div className="col-span-3 glass-panel p-10 flex flex-col justify-center items-center gap-3 text-center">
            <svg className="w-9 h-9 text-[#00f0ff] animate-spin" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="32 32" />
            </svg>
            <h3 className="text-xs font-semibold font-mono text-white animate-pulse">
              {isLoadingAI ? "Consulting AI simulation engine..." : "Calculating Parallel Realities..."}
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
          <ParallelSimulatorBranch key={i} branch={branch} index={i} />
        ))}
      </div>
    </div>
  );
}
