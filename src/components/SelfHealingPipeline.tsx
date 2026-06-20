"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, AlertTriangle, CheckCircle, Terminal, Cpu, FileText } from "lucide-react";

interface LogLine {
  text: string;
  type: "info" | "error" | "agent" | "success";
  time: string;
}

export default function SelfHealingPipeline() {
  type PipelineState = "idle" | "running_fail" | "failed" | "healing" | "healed";
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [visibleDiff, setVisibleDiff] = useState(false);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, type: "info" | "error" | "agent" | "success") => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { text, type, time }]);
  };

  const startSimulation = () => {
    setPipelineState("running_fail");
    setLogs([]);
    setVisibleDiff(false);

    // Timeline of simulation
    setTimeout(() => {
      addLog("Pipeline triggered by commit check-in v1.12.80", "info");
    }, 100);

    setTimeout(() => {
      addLog("Stage [Build]: Compiling NestJS packages...", "info");
    }, 800);

    setTimeout(() => {
      addLog("Stage [Build]: Compilation completed successfully. Zero compiler errors.", "success");
      addLog("Stage [Test]: Initiating Jest integration test suite...", "info");
    }, 1800);

    setTimeout(() => {
      addLog("FAIL // src/tests/auth-service/connection.spec.ts", "error");
      addLog("  ✕ Authenticate profile query - timeout 10000ms", "error");
      addLog("  ✕ Connection pool exhausted. PrismaClientInitializationError: Could not retrieve connection from pool. Active: 10, Limit: 10.", "error");
    }, 2800);

    setTimeout(() => {
      addLog("FATAL: Test suite failed. Exit code 1.", "error");
      addLog("Pipeline status: FAILED // GitLab Alert dispatched.", "error");
      setPipelineState("failed");
    }, 3500);
  };

  const triggerHealing = () => {
    setPipelineState("healing");
    addLog("CTO-X Autonomous Agent intercepting pipeline crash...", "agent");

    setTimeout(() => {
      addLog("Agent [Log Analyzer]: Extracting trace reports and error indices...", "agent");
    }, 1000);

    setTimeout(() => {
      addLog("Agent [Diagnostic]: Identified issue: connection_limit parameters inside auth-service Database URL is throttled at 10. Heavy webhook concurrency requires at least 45 connections.", "agent");
    }, 2200);

    setTimeout(() => {
      addLog("Agent [Fixer]: Generating code patches in prisma/schema.prisma...", "agent");
      setVisibleDiff(true);
    }, 3400);

    setTimeout(() => {
      addLog("Agent [Fixer]: Creating automated GitLab Merge Request !4022 'fix/db-pool-starvation-autogen'...", "agent");
    }, 4500);

    setTimeout(() => {
      addLog("Agent [Runner]: Re-triggering pipeline with MR patch !4022...", "agent");
    }, 5500);

    setTimeout(() => {
      addLog("Stage [Build]: Compiling dependencies with patched settings...", "info");
    }, 6500);

    setTimeout(() => {
      addLog("Stage [Test]: Running Jest integration tests (Patched configuration)...", "info");
    }, 7500);

    setTimeout(() => {
      addLog("Stage [Test]: Integration tests passed. 42/42 specs nominal.", "success");
      addLog("Stage [Security Audit]: Checking for vulnerabilities... Passed.", "success");
    }, 8500);

    setTimeout(() => {
      addLog("Stage [Deploy]: Releasing to Kubernetes gateway-k8s cluster...", "info");
    }, 9500);

    setTimeout(() => {
      addLog("Stage [Deploy]: Rolling update completed. 8 replicas healthy.", "success");
      addLog("Autonomous self-healing lifecycle completed. System is nominal.", "success");
      setPipelineState("healed");
    }, 10500);
  };

  const resetPipeline = () => {
    setPipelineState("idle");
    setLogs([]);
    setVisibleDiff(false);
  };

  const getStageColor = (stage: string) => {
    if (pipelineState === "idle") return "border-white/10 text-white/40";

    switch (stage) {
      case "build":
        if (pipelineState === "running_fail" || pipelineState === "failed" || pipelineState === "healing" || pipelineState === "healed") {
          return "border-[#10b981] text-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.2)]";
        }
        return "border-white/10 text-white/40";
      case "test":
        if (pipelineState === "running_fail") return "border-cyan-500 text-cyan-400 animate-pulse";
        if (pipelineState === "failed") return "border-[#ef4444] text-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.2)]";
        if (pipelineState === "healing") return "border-purple-500 text-purple-400 animate-pulse";
        if (pipelineState === "healed") return "border-[#10b981] text-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.2)]";
        return "border-white/10 text-white/40";
      case "security":
        if (pipelineState === "healing") return "border-purple-500 text-purple-400 animate-pulse";
        if (pipelineState === "healed") return "border-[#10b981] text-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.2)]";
        return "border-white/10 text-white/40";
      case "deploy":
        if (pipelineState === "healing") return "border-purple-500 text-purple-400 animate-pulse";
        if (pipelineState === "healed") return "border-[#10b981] text-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.2)]";
        return "border-white/10 text-white/40";
      default:
        return "border-white/10 text-white/40";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 h-[485px] animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* Left side: Terminal Log console */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[#00f0ff]" />
            <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
              Self-Healing Console Output
            </h3>
          </div>
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-[#00f0ff] uppercase tracking-wide">
            {pipelineState === "idle" && "READY"}
            {pipelineState === "running_fail" && "EXECUTING TESTS"}
            {pipelineState === "failed" && "CRITICAL FAILURE"}
            {pipelineState === "healing" && "REPAIRING CORES"}
            {pipelineState === "healed" && "DEPLOYED NOMINAL"}
          </span>
        </div>

        {/* Live logs terminal box */}
        <div 
          ref={logTerminalRef}
          className="flex-1 bg-black/45 border border-white/5 rounded-lg p-4 font-mono text-[10.5px] overflow-y-auto flex flex-col gap-1.5 select-text"
        >
          {logs.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center gap-2 text-white/30">
              <Cpu size={24} className="animate-pulse" />
              <span>Pipeline idle. Initiate simulation run parameters.</span>
            </div>
          ) : (
            logs.map((log, i) => (
              <p key={i} className="leading-relaxed">
                <span className="text-white/20 mr-1.5">[{log.time}]</span>
                <span className={`mr-1.5 font-bold uppercase ${
                  log.type === "error" ? "text-red-400" :
                  log.type === "success" ? "text-emerald-400" :
                  log.type === "agent" ? "text-purple-400" : "text-sky-400"
                }`}>
                  [{log.type}]
                </span>
                <span className={
                  log.type === "error" ? "text-red-300" :
                  log.type === "success" ? "text-emerald-200" :
                  log.type === "agent" ? "text-purple-200 font-medium" : "text-slate-300"
                }>
                  {log.text}
                </span>
              </p>
            ))
          )}
        </div>

        {/* Action Panel triggers */}
        <div className="flex gap-3 mt-4 border-t border-white/5 pt-3">
          {pipelineState === "idle" && (
            <button
              onClick={startSimulation}
              className="flex-1 font-sans text-[11px] font-bold text-slate-950 bg-[#ef4444] hover:bg-[#ef4444]/90 rounded py-2 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.3)] transition flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              <Play size={12} fill="currentColor" />
              Simulate CI/CD Failure
            </button>
          )}

          {pipelineState === "failed" && (
            <button
              onClick={triggerHealing}
              className="flex-1 font-sans text-[11px] font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] hover:shadow-[0_0_16px_rgba(168,85,247,0.4)] rounded py-2 cursor-pointer transition flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              <Cpu size={12} />
              Engage Auto-Healing Agent
            </button>
          )}

          {(pipelineState === "healing" || pipelineState === "running_fail") && (
            <button
              disabled
              className="flex-1 font-sans text-[11px] font-semibold text-white/50 bg-white/5 border border-white/10 rounded py-2 cursor-not-allowed flex justify-center items-center gap-2"
            >
              <span className="w-3 h-3 border border-white/30 border-t-transparent rounded-full animate-spin" />
              Autonomous Running...
            </button>
          )}

          {pipelineState === "healed" && (
            <button
              onClick={resetPipeline}
              className="flex-1 font-sans text-[11px] font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded py-2 cursor-pointer transition flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              <RotateCcw size={12} />
              Reset Console
            </button>
          )}
        </div>
      </div>

      {/* Right side: Pipeline Visual Graph and Code Diff */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
        <div>
          <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none mb-1">
            Pipeline Flow Topology
          </h3>
          <p className="text-[10px] text-white/40">
            Real-time status tracking of deployment branches.
          </p>
        </div>

        {/* Vertical Pipeline flowchart */}
        <div className="flex-1 flex flex-col justify-center gap-3 relative py-4 max-w-[280px] mx-auto w-full">
          {/* Connector Line behind nodes */}
          <div className="absolute top-8 bottom-8 left-[19px] w-0.5 bg-white/5 z-0" />

          {/* Node 1: Code Build */}
          <div className="flex items-center gap-4 z-10">
            <div className={`w-9 h-9 rounded-full border-2 bg-black/60 flex items-center justify-center transition-all duration-300 ${getStageColor("build")}`}>
              {pipelineState === "idle" ? <span className="text-[10px] font-bold">1</span> : <CheckCircle size={14} className="stroke-[2.5]" />}
            </div>
            <div>
              <span className="text-[11.5px] font-bold block text-white">Stage: Build</span>
              <span className="text-[9px] text-white/40 block">Webpack packaging</span>
            </div>
          </div>

          {/* Node 2: Testing */}
          <div className="flex items-center gap-4 z-10">
            <div className={`w-9 h-9 rounded-full border-2 bg-black/60 flex items-center justify-center transition-all duration-300 ${getStageColor("test")}`}>
              {pipelineState === "failed" ? <AlertTriangle size={14} className="stroke-[2.5]" /> :
               (pipelineState === "healed" || pipelineState === "healing") ? <CheckCircle size={14} className="stroke-[2.5]" /> :
               <span className="text-[10px] font-bold">2</span>}
            </div>
            <div>
              <span className="text-[11.5px] font-bold block text-white">Stage: Jest Test Suite</span>
              <span className="text-[9px] text-white/40 block">Integration testing specs</span>
            </div>
          </div>

          {/* Node 3: Security checks */}
          <div className="flex items-center gap-4 z-10">
            <div className={`w-9 h-9 rounded-full border-2 bg-black/60 flex items-center justify-center transition-all duration-300 ${getStageColor("security")}`}>
              {pipelineState === "healed" ? <CheckCircle size={14} className="stroke-[2.5]" /> : <span className="text-[10px] font-bold">3</span>}
            </div>
            <div>
              <span className="text-[11.5px] font-bold block text-white">Stage: Security Audit</span>
              <span className="text-[9px] text-white/40 block">Container CVE checklist</span>
            </div>
          </div>

          {/* Node 4: Deployment */}
          <div className="flex items-center gap-4 z-10">
            <div className={`w-9 h-9 rounded-full border-2 bg-black/60 flex items-center justify-center transition-all duration-300 ${getStageColor("deploy")}`}>
              {pipelineState === "healed" ? <CheckCircle size={14} className="stroke-[2.5]" /> : <span className="text-[10px] font-bold">4</span>}
            </div>
            <div>
              <span className="text-[11.5px] font-bold block text-white">Stage: Deploy Production</span>
              <span className="text-[9px] text-white/40 block">Kubernetes pods recycle</span>
            </div>
          </div>
        </div>

        {/* Patch Code Diff display */}
        {visibleDiff && (
          <div className="bg-black/40 border border-purple-500/25 rounded-lg p-3 font-mono text-[9px] leading-relaxed animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold border-b border-white/5 pb-1 mb-1.5">
              <FileText size={10} />
              <span>AUTO FIX // prisma/schema.prisma</span>
            </div>
            <p className="text-red-400 line-through">- database_url = &quot;postgresql://db:5432/main?connection_limit=10&quot;</p>
            <p className="text-emerald-400 font-bold">+ database_url = &quot;postgresql://db:5432/main?connection_limit=50&amp;pool_timeout=30&quot;</p>
          </div>
        )}
      </div>

    </div>
  );
}
