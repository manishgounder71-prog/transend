"use client";

import React, { useState } from "react";
import { ShieldAlert, Terminal, FileText } from "lucide-react";

interface IncidentLog {
  time: string;
  msg: string;
  type: "error" | "warn" | "success" | "info";
}

const mockLogs: IncidentLog[] = [
  { time: "11:04:12", msg: "Connection pool exhaustion detected on auth-service-v3.", type: "error" },
  { time: "11:04:15", msg: "Gateway timeouts (504) scaling on endpoint /v1/auth/verify.", type: "error" },
  { time: "11:04:20", msg: "Chaos engine triggered: isolating database nodes replica-1.", type: "warn" },
  { time: "11:04:35", msg: "CISO Agent scanning replica pods configurations.", type: "info" },
  { time: "11:04:55", msg: "CTO Agent generating connection pool multiplier patches.", type: "info" },
  { time: "11:05:10", msg: "Injecting prisma connection limit modifications into configs.", type: "success" },
  { time: "11:05:30", msg: "DevOps Agent initiating rolling recycle on gateway pods.", type: "info" },
  { time: "11:05:45", msg: "Connection limits expanded to 50 threads. Latency drops below 15ms.", type: "success" },
  { time: "11:06:00", msg: "All integration checks passed. System health is normal.", type: "success" }
];

export default function IncidentCommander() {
  const [incidentState, setIncidentState] = useState<"idle" | "triggered" | "resolving" | "resolved">("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<IncidentLog[]>([]);
  const [showPostmortem, setShowPostmortem] = useState(false);

  const triggerOutage = () => {
    setIncidentState("triggered");
    setLogs([]);
    setProgress(0);
    setShowPostmortem(false);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < mockLogs.length) {
        setLogs(prev => [...prev, mockLogs[idx]]);
        setProgress(Math.floor(((idx + 1) / mockLogs.length) * 100));
        idx++;
      } else {
        clearInterval(interval);
        setIncidentState("resolved");
      }
    }, 1800);
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "error": return "text-red-400";
      case "warn": return "text-amber-400";
      case "success": return "text-emerald-400 font-medium";
      default: return "text-[#00f0ff]";
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[485px] overflow-y-auto pr-1 animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* Incident Header Status Alert */}
      <div className={`glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-500 ${
        incidentState === "triggered" ? "glow-border-critical bg-red-500/[0.03]" : 
        incidentState === "resolved" ? "border-[#10b981]/30 bg-emerald-500/[0.01]" : "border-white/5"
      }`}>
        <div className="flex items-center gap-4">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
            incidentState === "triggered" ? "bg-[#ef4444] pulse-red" : 
            incidentState === "resolved" ? "bg-[#10b981] pulse-emerald" : "bg-white/20"
          }`} />
          <div>
            <h3 className={`text-sm font-bold tracking-tight uppercase ${
              incidentState === "triggered" ? "text-[#ef4444] animate-pulse" : "text-white"
            }`}>
              {incidentState === "idle" && "System Ingress Status: Active & Operational"}
              {incidentState === "triggered" && "INC-4029: DB CONNECTION TIMEOUTS IN K8S CLUSTER"}
              {incidentState === "resolved" && "INC-4029 RESOLVED: Telemetry Restored"}
            </h3>
            <p className="text-[10.5px] text-white/50 mt-0.5 font-sans leading-relaxed">
              {incidentState === "idle" && "Continuous uptime mapping. No anomalies detected."}
              {incidentState === "triggered" && "Critical thread limits reached on auth-service. Automated AI agents dispatched."}
              {incidentState === "resolved" && "All nodes reporting nominal capacity. Database replication latency normal."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {incidentState === "idle" && (
            <button
              onClick={triggerOutage}
              className="w-full md:w-auto font-sans text-[10px] font-bold text-slate-950 bg-[#ef4444] hover:bg-[#ef4444]/90 rounded px-4 py-1.5 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.3)] transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <ShieldAlert size={12} />
              Simulate Outage
            </button>
          )}

          {incidentState === "triggered" && (
            <span className="font-mono text-[9.5px] font-bold text-[#f59e0b] px-2 py-1 bg-amber-500/5 border border-amber-500/20 rounded animate-pulse select-none">
              Auto-Remediation Active...
            </span>
          )}

          {incidentState === "resolved" && (
            <>
              <button
                onClick={() => setShowPostmortem(!showPostmortem)}
                className="font-sans text-[10px] font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded px-3 py-1.5 transition flex items-center gap-1.5"
              >
                <FileText size={12} />
                {showPostmortem ? "Hide Postmortem" : "Export Postmortem"}
              </button>
              <button
                onClick={() => {
                  setIncidentState("idle");
                  setLogs([]);
                  setProgress(0);
                  setShowPostmortem(false);
                }}
                className="font-sans text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded px-3 py-1.5 transition"
              >
                Reset Dashboard
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid Dashboard */}
      {showPostmortem ? (
        <div className="glass-panel p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h4 className="text-xs font-bold text-[#10b981] tracking-wider uppercase font-mono">
              📝 Incident Postmortem Report // INC-4029
            </h4>
            <span className="text-[9px] text-white/40 font-mono">CLASSIFIED INTERNAL // CTO-X</span>
          </div>
          <div className="font-mono text-[10.5px] leading-relaxed text-slate-300 bg-black/45 border border-white/5 rounded-lg p-4 h-[250px] overflow-y-auto select-text">
            <h1 className="text-sm font-bold text-white mb-2">INCIDENT REPORT: Database Connection Exhaustion</h1>
            <p className="text-white/40 mb-3">ID: INC-4029 | Date: June 20, 2026 | Severity: P1 Critical</p>
            
            <h2 className="text-xs font-bold text-white border-b border-white/5 pb-0.5 mt-4 mb-2">1. Summary</h2>
            <p className="mb-3">On June 20, 2026, the primary Kubernetes ingress controller recorded a surge in 504 Gateway Timeouts at /v1/auth/verify. Database pooling parameters limit queries concurrency to 10 connections. Heavy webhook transactions triggered a pool lockout.</p>
            
            <h2 className="text-xs font-bold text-white border-b border-white/5 pb-0.5 mt-4 mb-2">2. Root Cause</h2>
            <p className="mb-3">Auth-service thread allocation is throttled inside prisma/schema.prisma configurations. Auto-scaling rules recycled containers but thread limitations starved query completions.</p>
            
            <h2 className="text-xs font-bold text-white border-b border-white/5 pb-0.5 mt-4 mb-2">3. Mitigation & Auto-Healing</h2>
            <p className="mb-2">The CTO-X Autonomous Agent performed the following remediations:</p>
            <ul className="list-disc pl-4 mb-3 flex flex-col gap-1 text-white/80">
              <li>Disconnected replica-1 query loops to protect primary cluster state.</li>
              <li>Generated database connection limit upgrade patches (connection_limit=50).</li>
              <li>Triggered emergency GitLab CI/CD builds which verified and deployed configurations automatically.</li>
              <li>Uptime restored to 100% nominal within 2.5 minutes.</li>
            </ul>

            <h2 className="text-xs font-bold text-white border-b border-white/5 pb-0.5 mt-4 mb-2">4. Uptime Action Timeline</h2>
            <p className="mb-1"><strong>[11:04:12]</strong> Outage warning dispatched via Prometheus logs.</p>
            <p className="mb-1"><strong>[11:04:35]</strong> CISO Agent isolated target container blocks.</p>
            <p className="mb-1"><strong>[11:05:10]</strong> Automated schema parameter patches compiled.</p>
            <p className="mb-3"><strong>[11:05:45]</strong> Rolling upgrades completed successfully. API restored.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recovery Progress Checklist */}
          <div className="glass-panel p-5 flex flex-col justify-between min-h-[240px]">
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none mb-1">
                Automated Recovery Progress
              </h3>
              <div className="flex justify-between items-baseline mb-2 font-mono">
                <span className="text-[10px] text-white/40">Patch deployment:</span>
                <span className="text-xs font-black text-[#a855f7]">{progress}%</span>
              </div>
              <div className="h-1.5 bg-black/45 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-[#a855f7] rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs font-medium">
              <div className={`flex items-center gap-2 ${progress >= 20 ? "text-[#10b981]" : "text-white/30"}`}>
                {progress >= 20 ? "✓" : "○"} Identify query thread leaks (CISO)
              </div>
              <div className={`flex items-center gap-2 ${progress >= 40 ? "text-[#10b981]" : "text-white/30"}`}>
                {progress >= 40 ? "✓" : "○"} Isolate affected replicas (Ops)
              </div>
              <div className={`flex items-center gap-2 ${progress >= 70 ? "text-[#10b981]" : "text-white/30"}`}>
                {progress >= 70 ? "✓" : "○"}
                {progress > 40 && progress < 70 && <span className="w-2.5 h-2.5 border border-purple-500 border-t-transparent rounded-full animate-spin inline-block" />}
                Inject pool patching payload (CTO)
              </div>
              <div className={`flex items-center gap-2 ${progress >= 100 ? "text-[#10b981]" : "text-white/30"}`}>
                {progress >= 100 ? "✓" : "○"}
                {progress > 70 && progress < 100 && <span className="w-2.5 h-2.5 border border-purple-500 border-t-transparent rounded-full animate-spin inline-block" />}
                Recycle gateway auth pods (DevOps)
              </div>
            </div>
          </div>

          {/* Incident Telemetry Logs */}
          <div className="glass-panel p-5 flex flex-col justify-between min-h-[240px]">
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none mb-3">
                Incident Room Log Output
              </h3>
            </div>

            <div className="flex-1 bg-black/25 border border-white/5 rounded-lg p-3 font-mono text-[9.5px] flex flex-col gap-2 h-[130px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center gap-1.5 text-white/20 select-none">
                  <Terminal size={18} />
                  <span>Log feed idle. Simulate outage to start.</span>
                </div>
              ) : (
                logs.map((log, i) => (
                  <p key={i} className="leading-normal">
                    <span className="text-white/30 mr-1.5">[{log.time}]</span>
                    <span className={getLogColor(log.type)}>{log.msg}</span>
                  </p>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
