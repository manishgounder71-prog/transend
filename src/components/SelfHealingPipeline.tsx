"use client";

import React, { useState, useEffect, useRef } from "react";
import { type LogLine, type PipelineState } from "./pipeline/pipelineData";
import SelfHealingPipelineConsole from "./pipeline/SelfHealingPipelineConsole";
import SelfHealingPipelineFlow from "./pipeline/SelfHealingPipelineFlow";
import { dispatchGameEvent } from "@/lib/gamification";

export default function SelfHealingPipeline() {
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [visibleDiff, setVisibleDiff] = useState(false);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, type: LogLine["type"]) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { text, type, time }]);
  };

  const startSimulation = () => {
    setPipelineState("running_fail");
    setLogs([]);
    setVisibleDiff(false);
    dispatchGameEvent("pipeline:simulated");

    setTimeout(() => addLog("Pipeline triggered by commit check-in v1.12.80", "info"), 100);
    setTimeout(() => addLog("Stage [Build]: Compiling NestJS packages...", "info"), 800);
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

    setTimeout(() => addLog("Agent [Log Analyzer]: Extracting trace reports and error indices...", "agent"), 1000);
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
    setTimeout(() => addLog("Stage [Build]: Compiling dependencies with patched settings...", "info"), 6500);
    setTimeout(() => addLog("Stage [Test]: Running Jest integration tests (Patched configuration)...", "info"), 7500);
    setTimeout(() => {
      addLog("Stage [Test]: Integration tests passed. 42/42 specs nominal.", "success");
      addLog("Stage [Security Audit]: Checking for vulnerabilities... Passed.", "success");
    }, 8500);
    setTimeout(() => addLog("Stage [Deploy]: Releasing to Kubernetes gateway-k8s cluster...", "info"), 9500);
    setTimeout(() => {
      addLog("Stage [Deploy]: Rolling update completed. 8 replicas healthy.", "success");
      addLog("Autonomous self-healing lifecycle completed. System is nominal.", "success");
      setPipelineState("healed");
      dispatchGameEvent("pipeline:healed");
    }, 10500);
  };

  const resetPipeline = () => {
    setPipelineState("idle");
    setLogs([]);
    setVisibleDiff(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 h-[485px] animate-in fade-in slide-in-from-bottom-3 duration-500">
      <SelfHealingPipelineConsole
        logs={logs}
        pipelineState={pipelineState}
        logTerminalRef={logTerminalRef}
        onStart={startSimulation}
        onHeal={triggerHealing}
        onReset={resetPipeline}
      />
      <SelfHealingPipelineFlow pipelineState={pipelineState} visibleDiff={visibleDiff} />
    </div>
  );
}
