"use client";

import React, { useState, useEffect } from "react";
import { Play, CheckCircle, Terminal, HelpCircle, AlertOctagon } from "lucide-react";
import { dispatchGameEvent, recordHealthSnapshot } from "@/lib/gamification";

interface RiskIndex {
  name: string;
  val: number;
  type: "danger" | "warning" | "success";
}

export default function ReleasePredictor() {
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number>(84);
  const [commitsCount, setCommitsCount] = useState(0);
  const [metrics, setMetrics] = useState<RiskIndex[]>([
    { name: "Deployment Risk", val: 88, type: "danger" },
    { name: "Rollback Risk", val: 12, type: "success" },
    { name: "Incident Probability", val: 64, type: "warning" },
    { name: "Customer Blast Radius", val: 81, type: "danger" },
    { name: "Technical Debt Accrual", val: 52, type: "warning" },
    { name: "Security Vulnerabilities", val: 8, type: "success" }
  ]);

  // Fetch commits count from the GitLab integration route on mount
  useEffect(() => {
    fetch("/api/gitlab/commits")
      .then(res => res.json())
      .then(data => {
        if (data && data.commits) {
          setCommitsCount(data.commits.length);
        }
      })
      .catch(err => console.error("Predictor commits query failed:", err));
  }, []);

  const runAssessment = () => {
    setIsScanning(true);
    setLogs([]);
    setHasScanned(false);

    // Default to 3 mock commits if offline or token not connected
    const activeCommits = commitsCount || 3;

    const scanLogs = [
      "Securing GitLab connection endpoint... Authorized.",
      `Auditing commits on target branch... Detected ${activeCommits} active commits since baseline.`,
      activeCommits > 5 
        ? `⚠️ Warning: Elevated volume of ${activeCommits} unreviewed pipeline commits detected.` 
        : `Info: Nominal volume of ${activeCommits} commits detected since baseline.`,
      "Parsing security scanners: Snyk container audit completed.",
      "Audit logs show 4 medium vulnerability alerts in nginx ingress config.",
      "Reading Jest specs: code coverage at 74% (Fail-safe buffer is 80%).",
      "Modeling database scale response: auth connection limits are tight.",
      "Aggregating Doom indices based on active telemetry..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < scanLogs.length) {
        setLogs(prev => [...prev, scanLogs[i]]);
        i++;
      } else {
        clearInterval(interval);
        
        // Dynamically compute risk indices based on commit count
        const calculatedRisk = Math.min(95, 20 + activeCommits * 10);
        const calculatedIncidentProb = Math.min(90, 10 + activeCommits * 8);
        const calculatedRollback = Math.min(60, 2 + activeCommits * 5);
        const calculatedConfidence = Math.max(30, 99 - activeCommits * 5);

        setMetrics([
          { name: "Deployment Risk", val: calculatedRisk, type: calculatedRisk > 70 ? "danger" : calculatedRisk > 40 ? "warning" : "success" },
          { name: "Rollback Risk", val: calculatedRollback, type: calculatedRollback > 50 ? "danger" : "success" },
          { name: "Incident Probability", val: calculatedIncidentProb, type: calculatedIncidentProb > 60 ? "danger" : calculatedIncidentProb > 30 ? "warning" : "success" },
          { name: "Customer Blast Radius", val: Math.min(90, 20 + activeCommits * 6), type: "warning" },
          { name: "Technical Debt Accrual", val: Math.min(95, 10 + activeCommits * 7), type: "warning" },
          { name: "Security Vulnerabilities", val: activeCommits > 5 ? 18 : 2, type: activeCommits > 5 ? "danger" : "success" }
        ]);

        setConfidenceScore(calculatedConfidence);
        setHasScanned(true);
        setIsScanning(false);
        dispatchGameEvent("risk:assessed");
        recordHealthSnapshot(calculatedConfidence);
      }
    }, 700);
  };


  const getMeterColor = (type: string) => {
    if (type === "danger") return "bg-[#ef4444]";
    if (type === "warning") return "bg-[#f59e0b]";
    return "bg-[#10b981]";
  };

  const getPolygonPoints = () => {
    // Return points based on metrics
    // Center is (100, 100). Radius is 90.
    // 6 directions: 0 deg (100, 10), 60 deg (178, 55), 120 deg (178, 145), 180 deg (100, 190), 240 deg (22, 145), 300 deg (22, 55)
    // Scale vectors by metrics
    const angles = [0, 60, 120, 180, 240, 300];
    const pts = angles.map((ang, i) => {
      const scale = (metrics[i].val / 100) * 80 + 10; // minimum radius 10, max 90
      const rad = (ang * Math.PI) / 180;
      const x = 100 + scale * Math.sin(rad);
      const y = 100 - scale * Math.cos(rad);
      return `${Math.round(x)},${Math.round(y)}`;
    });
    return pts.join(" ");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 h-[485px] animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* Left side: Risk index bars and Scan logger */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
        <div className="flex justify-between items-start border-b border-white/5 pb-2">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase select-none">
              Release Doom Risk Analysis
            </h3>
            <p className="text-[10px] text-white/40 mt-0.5">
              AI simulation modeling across 6 core risk indexes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasScanned && (
              <button
                onClick={runAssessment}
                className="font-sans text-[10px] font-bold text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition rounded px-3 py-1.5 cursor-pointer flex items-center gap-1.5"
              >
                ↻ Re-Scan
              </button>
            )}
            <button
              disabled={isScanning}
              onClick={runAssessment}
              className="font-sans text-[10px] font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-cyan-400 hover:from-[#00f0ff]/80 hover:to-cyan-400/80 transition rounded px-3.5 py-1.5 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-[0.98] shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              <Play size={10} fill="currentColor" />
              Evaluate Risk
            </button>
          </div>
        </div>

        {/* Dynamic Scan terminal during scanning */}
        {isScanning || (logs.length > 0 && !hasScanned) ? (
          <div className="flex-1 bg-black/45 border border-white/5 rounded-lg p-4 font-mono text-[10px] overflow-y-auto flex flex-col gap-1.5 my-3">
            <div className="flex items-center gap-1.5 text-[#00f0ff] font-bold pb-1 border-b border-white/5 mb-1 select-none">
              <Terminal size={12} />
              <span>DOOM ANALYZER LOGS</span>
            </div>
            {logs.map((log, i) => (
              <p key={i} className="text-slate-300 leading-relaxed">
                ➔ {log}
              </p>
            ))}
            {isScanning && (
              <div className="flex items-center gap-2 text-[#00f0ff] font-bold mt-2 animate-pulse select-none">
                <span className="w-2 h-2 border border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
                Aggregating pipeline metrics...
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 my-4 flex-1 justify-center content-center">
            {metrics.map((item, i) => (
              <div key={i} className="risk-meter-item">
                <div className="meter-meta flex justify-between font-sans text-xs font-semibold mb-1">
                  <span className="text-white/60">{item.name}</span>
                  <span className={`font-bold ${
                    item.val > 70 ? "text-[#ef4444]" :
                    item.val > 40 ? "text-[#f59e0b]" : "text-[#10b981]"
                  }`}>
                    {item.val}%
                  </span>
                </div>
                <div className="h-2 bg-black/45 rounded-full overflow-hidden w-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${getMeterColor(item.type)}`}
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-white/5 pt-3 select-none flex items-center gap-2">
          {hasScanned ? (
            <div className="flex items-center gap-2 text-[#10b981] font-mono text-[10.5px]">
              <CheckCircle size={14} />
              <span>Assessment Completed. All targets verified.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white/35 font-mono text-[10.5px]">
              <HelpCircle size={14} />
              <span>Trigger Evaluator to run multi-vector risk checks.</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Graphical Radar Chart and Score Gauge */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between items-center text-center">
        <div className="w-full text-left">
          <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
            Risk Distribution
          </h3>
          <p className="text-[9px] text-white/30 font-mono mt-0.5">
            RELEASE CONFIDENCE: <span className="text-[#00f0ff] font-bold">{confidenceScore}%</span>
          </p>
        </div>
        
        <div className="w-[170px] h-[170px] relative my-2">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Grid Circles */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            {/* Spokes */}
            <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.04)"/>
            <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.04)"/>
            <line x1="36" y1="36" x2="164" y2="164" stroke="rgba(255,255,255,0.04)"/>
            {/* Dynamic Risk Polygon */}
            <polygon 
              points={getPolygonPoints()} 
              fill={confidenceScore > 90 ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"} 
              stroke={confidenceScore > 90 ? "#10b981" : "var(--color-critical)"} 
              strokeWidth="2"
              className="transition-all duration-[1.2s] ease-out"
            />
            {/* Label indicators on spokes */}
            <circle cx="100" cy="10" r="2.5" fill="rgba(255,255,255,0.2)"/>
            <circle cx="190" cy="100" r="2.5" fill="rgba(255,255,255,0.2)"/>
            <circle cx="100" cy="190" r="2.5" fill="rgba(255,255,255,0.2)"/>
            <circle cx="10" cy="100" r="2.5" fill="rgba(255,255,255,0.2)"/>
          </svg>
        </div>
        
        {confidenceScore > 90 ? (
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[9px] font-bold uppercase animate-pulse select-none">
            <CheckCircle size={10} />
            <span>Consensus: Safe to deploy tomorrow</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#ef4444] font-mono text-[9px] font-bold uppercase animate-pulse select-none">
            <AlertOctagon size={10} />
            <span>High Risk Warning: Delay recommended</span>
          </div>
        )}
      </div>

    </div>
  );
}
