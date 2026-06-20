"use client";

import React, { useEffect, useState, useRef } from "react";
import { Play, Shield, ShieldCheck, Sword } from "lucide-react";

interface CyberLog {
  time: string;
  threat: string;
  shield: string;
  level: "INFO" | "WARN" | "CRITICAL" | "RESOLVED";
}

const battleSteps = [
  {
    threat: "SQL injection payload sent to gateway /v1/auth/verify.",
    shield: "Intercepting payload... Ingress parameters sanitized. Attack aborted.",
    level: "RESOLVED",
    score: 94,
    severity: "LOW"
  },
  {
    threat: "Syn flood DDoS attack simulation launched: 50,000 requests/sec targeting gateway-k8s-pod.",
    shield: "Cloud firewall rate limits enabled. Dropping packets from malicious IP ranges.",
    level: "WARN",
    score: 82,
    severity: "HIGH"
  },
  {
    threat: "Brute force credential scan targeting GitLab environment variables file.",
    shield: "SSH access token disabled. Root access endpoints quarantined.",
    level: "RESOLVED",
    score: 91,
    severity: "LOW"
  },
  {
    threat: "Critical exploit payload discovered inside billing Helm charts manifests.",
    shield: "Isolating billing-sync-db container. Re-generating Helm values parameters.",
    level: "CRITICAL",
    score: 64,
    severity: "CRITICAL"
  },
  {
    threat: "Phishing credentials verification token leak found on public repositories.",
    shield: "Revoking leaked API keys. Generating fresh JWT cryptographic auth keys.",
    level: "RESOLVED",
    score: 98,
    severity: "NOMINAL"
  }
];

export default function HackerArenaModule() {
  const [logs, setLogs] = useState<CyberLog[]>([
    { time: new Date().toLocaleTimeString(), threat: "Intrusion system active. Scanning threat vectors...", shield: "Blue Team shield active. Scanning replication config maps...", level: "INFO" }
  ]);

  const [isSimulating, setIsSimulating] = useState(false);
  const [securityScore, setSecurityScore] = useState(98);
  const [threatSeverity, setThreatSeverity] = useState("NOMINAL");
  const [progress, setProgress] = useState(0);

  const redRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (redRef.current) redRef.current.scrollTop = redRef.current.scrollHeight;
    if (blueRef.current) blueRef.current.scrollTop = blueRef.current.scrollHeight;
  }, [logs]);

  const startCyberWar = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs([]);
    setProgress(0);
    setSecurityScore(98);
    setThreatSeverity("NOMINAL");

    let step = 0;
    const interval = setInterval(() => {
      if (step < battleSteps.length) {
        const item = battleSteps[step];
        const time = new Date().toLocaleTimeString();
        
        setLogs(prev => [
          ...prev, 
          { time, threat: item.threat, shield: item.shield, level: item.level as "INFO" | "WARN" | "CRITICAL" | "RESOLVED" }
        ]);
        
        setSecurityScore(item.score);
        setThreatSeverity(item.severity);
        setProgress(Math.floor(((step + 1) / battleSteps.length) * 100));
        
        step++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 3000);
  };

  const getSeverityColor = (sev: string) => {
    if (sev === "CRITICAL" || sev === "HIGH") return "text-[#ef4444]";
    if (sev === "WARN") return "text-[#f59e0b]";
    return "text-[#10b981]";
  };

  const getScoreColor = (score: number) => {
    if (score < 70) return "text-[#ef4444] border-red-500/20 bg-red-500/5";
    if (score < 90) return "text-[#f59e0b] border-amber-500/20 bg-amber-500/5";
    return "text-[#10b981] border-emerald-500/20 bg-emerald-500/5";
  };

  return (
    <div className="flex flex-col gap-6 h-[485px] overflow-hidden justify-between animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* Simulation Command Center */}
      <div className="glass-panel p-5 select-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              AI Hacker Arena (Wargame Simulator)
            </h3>
            <p className="text-[10px] text-white/40 mt-0.5">
              Live cyber attack red-teaming vs Blue Team patching and incident containment.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Security Score */}
            <div className={`flex items-center gap-2 border px-3 py-1 rounded text-xs font-mono font-bold ${getScoreColor(securityScore)}`}>
              <ShieldCheck size={14} />
              <span>SECURITY SCORE: {securityScore}</span>
            </div>
            
            {/* Threat Severity */}
            <div className="flex items-center gap-1.5 border border-white/5 bg-black/45 px-3 py-1 rounded text-xs font-mono">
              <span className="text-white/40 font-semibold">SEVERITY:</span>
              <span className={`font-bold ${getSeverityColor(threatSeverity)}`}>{threatSeverity}</span>
            </div>

            <button
              disabled={isSimulating}
              onClick={startCyberWar}
              className="font-sans text-[10px] font-bold text-slate-950 bg-[#00f0ff] hover:bg-[#00f0ff]/80 transition rounded px-4 py-1.5 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Play size={10} fill="currentColor" />
              Engage Battle
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {isSimulating && (
          <div className="mt-4">
            <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1 select-none">
              <span>SIMULATING SECURE VECTOR CHECKS...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-black/45 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-[#10b981] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
        
        {/* Red Team Attack Monitor */}
        <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3 select-none">
            <div className="flex items-center gap-2">
              <Sword size={14} className="text-[#ef4444]" />
              <h3 className="text-xs font-bold text-[#ef4444] tracking-wide uppercase">
                🔴 Red Team (Vector Attack Injection)
              </h3>
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-[#ef4444] uppercase tracking-wider select-none">
              {isSimulating ? "ATTACK FLOOD" : "STANDBY"}
            </span>
          </div>
          
          <div 
            ref={redRef}
            className="flex-1 bg-black/35 border border-white/5 rounded-lg p-4 overflow-y-auto flex flex-col gap-2 font-mono text-[10.5px] text-red-400 select-text"
          >
            {logs.map((log, i) => (
              <p key={i} className="leading-relaxed">
                <span className="text-white/20 mr-1.5">[{log.time}]</span>
                <span>[THREAT] {log.threat}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Blue Team Defense Shield */}
        <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3 select-none">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-[#10b981]" />
              <h3 className="text-xs font-bold text-[#10b981] tracking-wide uppercase">
                🔵 Blue Team (Autonomous Shield Containment)
              </h3>
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-[#00f0ff] uppercase tracking-wider select-none">
              {isSimulating ? "SHIELD ENGAGED" : "NOMINAL"}
            </span>
          </div>

          <div 
            ref={blueRef}
            className="flex-1 bg-black/35 border border-white/5 rounded-lg p-4 overflow-y-auto flex flex-col gap-2 font-mono text-[10.5px] text-[#10b981] select-text"
          >
            {logs.map((log, i) => (
              <p key={i} className="leading-relaxed">
                <span className="text-white/20 mr-1.5">[{log.time}]</span>
                <span className={log.level === "CRITICAL" ? "text-red-400 font-bold" : log.level === "WARN" ? "text-amber-400 font-bold" : log.level === "RESOLVED" ? "text-emerald-400 font-medium" : "text-[#00f0ff]"}>
                  [SHIELD] {log.shield}
                </span>
              </p>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
