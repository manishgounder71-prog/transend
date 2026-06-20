"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link2, ShieldCheck, RefreshCw, Play, AlertTriangle, Terminal, Cpu, ExternalLink, Key, FolderOpen } from "lucide-react";

interface PipelineInfo {
  id: number;
  status: string;
  ref: string;
  sha: string;
  commitMessage: string;
  webUrl: string;
  createdAt: string;
}

interface ProjectInfo {
  status: "connected" | "offline";
  projectName: string;
  description: string;
  webUrl: string;
  starCount: number;
  owner: string;
  path: string;
}

export default function GitLabConnector() {
  // Connection states
  const [token, setToken] = useState("");
  const [projectId, setProjectId] = useState("");
  const [gitlabUrl, setGitlabUrl] = useState("https://gitlab.com/api/v4");
  const [branch, setBranch] = useState("main");
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [project, setProject] = useState<ProjectInfo | null>(null);

  // Pipeline states
  const [pipelines, setPipelines] = useState<PipelineInfo[]>([]);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
  
  // Test Runner states
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<number | null>(null);
  const [activePipelineStatus, setActivePipelineStatus] = useState<string>("");

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, `[${time}] ${msg}`]);
  }, []);

  // Load pipelines
  const loadPipelines = useCallback(async (tokVal?: string, projVal?: string, urlVal?: string) => {
    const tok = tokVal ?? token;
    const proj = projVal ?? projectId;
    const url = urlVal ?? gitlabUrl;
    if (!tok || !proj) return;
    setIsLoadingPipelines(true);

    try {
      const response = await fetch("/api/gitlab/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pipelines", token: tok, projectId: proj, gitlabUrl: url })
      });
      const data = await response.json();
      if (response.ok && data.pipelines) {
        setPipelines(data.pipelines);
      }
    } catch (err) {
      console.error("Failed to load GitLab pipelines:", err);
    } finally {
      setIsLoadingPipelines(false);
    }
  }, [token, projectId, gitlabUrl]);

  // Connection verifier
  const verifyConnection = useCallback(async (tokVal: string, projVal: string, urlVal: string) => {
    setIsVerifying(true);
    setVerifyError("");
    setProject(null);
    setTestLogs([]);

    try {
      const response = await fetch("/api/gitlab/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token: tokVal, projectId: projVal, gitlabUrl: urlVal })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to establish handshake connection.");
      setProject({ status: "connected", projectName: data.projectName, description: data.description, webUrl: data.webUrl, starCount: data.starCount, owner: data.owner, path: data.path });
      localStorage.setItem("orbit_gitlab_token", tokVal);
      localStorage.setItem("orbit_gitlab_project_id", projVal);
      localStorage.setItem("orbit_gitlab_url", urlVal);
      localStorage.setItem("orbit_gitlab_branch", branch);
      addLog(`HANDSHAKE NOMINAL // Authenticated with GitLab project: \"${data.projectName}\"`);
      addLog(`Connection Owner: @${data.owner.replace(" ", "")} // Repository URL: ${data.webUrl}`);
      loadPipelines(tokVal, projVal, urlVal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setVerifyError(message);
      addLog(`HANDSHAKE FAILURE // ${message}`);
    } finally {
      setIsVerifying(false);
    }
  }, [branch, addLog, loadPipelines]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("orbit_gitlab_token") || "";
      const savedProjectId = localStorage.getItem("orbit_gitlab_project_id") || "";
      const savedUrl = localStorage.getItem("orbit_gitlab_url") || "https://gitlab.com/api/v4";
      const savedBranch = localStorage.getItem("orbit_gitlab_branch") || "main";
      setToken(savedToken);
      setProjectId(savedProjectId);
      setGitlabUrl(savedUrl);
      setBranch(savedBranch);
      if (savedToken && savedProjectId) {
        verifyConnection(savedToken, savedProjectId, savedUrl);
      }
    }
  }, [verifyConnection]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [testLogs]);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !projectId) {
      setVerifyError("Please fill out both Project ID and Access Token fields.");
      return;
    }
    verifyConnection(token, projectId, gitlabUrl);
  };

  const disconnectProject = () => {
    localStorage.removeItem("orbit_gitlab_token");
    localStorage.removeItem("orbit_gitlab_project_id");
    setProject(null);
    setPipelines([]);
    setTestLogs([]);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setIsRunningTest(false);
  };

  // Trigger CI Pipeline
  const triggerRemotePipeline = async () => {
    if (!project || !token || !projectId) return;

    setIsRunningTest(true);
    setTestLogs([]);
    addLog(`INIT Remote CI/CD Test run targeting branch: "${branch}"...`);
    addLog(`Dispatching API trigger query package...`);

    try {
      const response = await fetch("/api/gitlab/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger",
          token,
          projectId,
          gitlabUrl,
          ref: branch
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to trigger build.");
      }

      const pipId = data.pipelineId;
      setActivePipelineId(pipId);
      setActivePipelineStatus(data.status);
      
      addLog(`CI TRIGGERED SUCCESS // Pipeline ID: #${pipId}`);
      addLog(`Commit SHA: [${data.sha}] // Branch reference: ${data.ref}`);
      addLog(`Status: ${data.status.toUpperCase()} // Initializing telemetry tracker...`);

      // Start status polling
      startPollingStatus(pipId);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addLog(`TRIGGER CRASH // Error: ${message}`);
      setIsRunningTest(false);
    }
  };

  // Poll Pipeline Status
  const startPollingStatus = (pipId: number) => {
    clearInterval(pollIntervalRef.current!);
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/gitlab/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "status",
            token,
            projectId,
            gitlabUrl,
            pipelineId: pipId
          })
        });

        const data = await response.json();
        if (response.ok) {
          setActivePipelineStatus(data.status);
          addLog(`Telemetry update: pipeline status is "${data.status.toUpperCase()}" (Duration: ${data.duration}s)`);

          if (data.status === "success") {
            addLog(`SUCCESS // Pipeline completed successfully! Tests passed.`);
            clearInterval(pollIntervalRef.current!);
            setIsRunningTest(false);
            loadPipelines(); // Reload pipeline feed
          } else if (data.status === "failed") {
            addLog(`FAILURE // Integration specs failed. Pipeline aborted.`);
            clearInterval(pollIntervalRef.current!);
            setIsRunningTest(false);
            loadPipelines();
          } else if (data.status === "canceled" || data.status === "skipped") {
            addLog(`ABORT // Pipeline status reported: ${data.status.toUpperCase()}`);
            clearInterval(pollIntervalRef.current!);
            setIsRunningTest(false);
            loadPipelines();
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addLog(`TELEMETRY ERROR // Connection jitter: ${message}`);
      }
    }, 3500); // Poll status every 3.5 seconds
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400";
      case "failed":
        return "bg-red-500/10 border-red-500/25 text-red-400";
      case "running":
      case "pending":
        return "bg-amber-500/10 border-amber-500/25 text-amber-400 animate-pulse";
      default:
        return "bg-slate-500/10 border-slate-500/25 text-slate-400";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-[485px] overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* LEFT PANEL: CONNECTION SETTINGS / SUMMARY */}
      <div className="glass-panel p-5 flex flex-col justify-between h-full overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center select-none">
            <div className="flex items-center gap-2">
              <Link2 size={14} className="text-[#00f0ff]" />
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                GitLab Project Connector
              </h3>
            </div>
            {project && (
              <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 uppercase tracking-wide">
                Active
              </span>
            )}
          </div>

          {!project ? (
            /* CONNECTION FORM */
            <form onSubmit={handleConnectSubmit} className="flex flex-col gap-3.5 mt-2">
              <p className="text-[10px] text-white/50 leading-relaxed leading-normal">
                Input your credentials to synchronize and trigger remote tests on any custom repository branch directly from Orbit.
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-1.5 uppercase select-none">
                  <FolderOpen size={10} />
                  <span>GitLab Project ID</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50401822"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="bg-black/35 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00f0ff]/40 transition font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-1.5 uppercase select-none">
                  <Key size={10} />
                  <span>Private Access Token</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="bg-black/35 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00f0ff]/40 transition font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 font-mono uppercase select-none">GitLab Base URL</label>
                <input
                  type="text"
                  placeholder="https://gitlab.com/api/v4"
                  value={gitlabUrl}
                  onChange={(e) => setGitlabUrl(e.target.value)}
                  className="bg-black/35 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00f0ff]/40 transition font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 font-mono uppercase select-none">Target Branch</label>
                <input
                  type="text"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-black/35 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00f0ff]/40 transition font-mono"
                />
              </div>

              {verifyError && (
                <div className="text-[10px] text-red-400 font-mono flex items-start gap-1.5 bg-red-500/5 border border-red-500/10 p-2.5 rounded">
                  <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                  <span>{verifyError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full font-sans text-[10px] font-bold text-slate-950 bg-[#00f0ff] hover:bg-[#00f0ff]/80 transition rounded py-2 cursor-pointer disabled:bg-white/5 disabled:text-white/35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={11} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={11} />
                    Establish Connection
                  </>
                )}
              </button>
            </form>
          ) : (
            /* DETAILS SUMMARY SCREEN */
            <div className="flex flex-col gap-3.5 mt-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 bg-emerald-500/[0.02] border border-emerald-500/20 rounded-lg flex items-start gap-2.5 text-xs text-[#10b981]">
                <ShieldCheck size={16} className="flex-shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <span className="font-bold uppercase text-[9.5px] tracking-wide text-emerald-400 font-mono">CONNECTION NOMINAL</span>
                  <p className="text-[10.5px] leading-relaxed text-emerald-200/80 mt-0.5">Orbit is actively proxying payloads for your GitLab project.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 font-mono text-[10.5px]">
                <div className="flex flex-col border-b border-white/[0.04] pb-1.5">
                  <span className="text-white/40 text-[8px] leading-none mb-1">PROJECT NAME</span>
                  <span className="font-semibold text-[#00f0ff] flex items-center gap-1">
                    {project.projectName}
                    <a href={project.webUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#00f0ff]">
                      <ExternalLink size={10} />
                    </a>
                  </span>
                </div>
                <div className="flex flex-col border-b border-white/[0.04] pb-1.5">
                  <span className="text-white/40 text-[8px] leading-none mb-1">NAMESPACE OWNER</span>
                  <span className="font-semibold text-[#a855f7]">@{project.owner.replace(" ", "")}</span>
                </div>
                <div className="flex flex-col border-b border-white/[0.04] pb-1.5">
                  <span className="text-white/40 text-[8px] leading-none mb-1">STAR COUNT</span>
                  <span className="font-semibold text-slate-200">{project.starCount} ★</span>
                </div>
                <div className="flex flex-col border-b border-white/[0.04] pb-1.5">
                  <span className="text-white/40 text-[8px] leading-none mb-1">REPOSITORY PATH</span>
                  <span className="font-semibold text-slate-200 select-all truncate">{project.path}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {project && (
          <button
            onClick={disconnectProject}
            className="w-full font-sans text-[10px] font-bold text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded py-2 cursor-pointer transition select-none mt-4 text-center active:scale-[0.98]"
          >
            Disconnect Project
          </button>
        )}
      </div>

      {/* RIGHT PANEL: LIVE CI PIPELINES & REMOTE TEST RUNNER */}
      <div className="glass-panel p-5 flex flex-col justify-between h-full overflow-hidden">
        
        {/* PIPELINE STREAM DECK */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden mb-4">
          <div className="border-b border-white/10 pb-2 flex justify-between items-center select-none">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Remote CI/CD Pipeline Feed
            </h3>
            {project && (
              <button 
                onClick={() => loadPipelines()} 
                disabled={isLoadingPipelines}
                className="text-[9px] font-bold text-[#00f0ff] hover:underline disabled:text-white/20 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={10} className={isLoadingPipelines ? "animate-spin" : ""} />
                Sync Logs
              </button>
            )}
          </div>

          {!project ? (
            /* OFFLINE PLACEHOLDER */
            <div className="flex-1 flex flex-col justify-center items-center gap-2 text-white/20 select-none text-center">
              <Terminal size={26} className="animate-pulse" />
              <p className="text-xs max-w-[340px] leading-relaxed">
                Connect your GitLab project ID and access token in the left panel to fetch and audit active pipeline check integrations.
              </p>
            </div>
          ) : (
            /* ACTIVE DATA PANEL */
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-5 overflow-hidden">
              
              {/* Pipeline List Scrollbox */}
              <div className="overflow-y-auto flex flex-col gap-2.5 pr-1.5">
                {isLoadingPipelines && pipelines.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-white/30 font-mono">
                    <RefreshCw size={12} className="animate-spin mr-1.5" />
                    Querying API data lake...
                  </div>
                ) : pipelines.length === 0 ? (
                  <div className="h-full flex flex-center items-center text-xs text-white/30 font-mono text-center">
                    No recent pipelines found on this project.
                  </div>
                ) : (
                  pipelines.map((pipe) => (
                    <a 
                      key={pipe.id}
                      href={pipe.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-black/25 border border-white/5 hover:border-white/15 rounded-lg flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-[11px] font-bold text-white truncate max-w-[220px]">
                          {pipe.commitMessage}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[9px] text-white/40">
                          <span>Branch: <strong className="text-[#00f0ff]">{pipe.ref}</strong></span>
                          <span>•</span>
                          <span>SHA: [{pipe.sha}]</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className={`font-mono text-[8px] font-bold border rounded px-1.5 py-0.5 tracking-wide uppercase ${getStatusBadge(pipe.status)}`}>
                          {pipe.status}
                        </span>
                        <ExternalLink size={10} className="text-white/20" />
                      </div>
                    </a>
                  ))
                )}
              </div>

              {/* Build Log Terminal & trigger */}
              <div className="glass-panel p-4 flex flex-col justify-between overflow-hidden bg-black/45 border border-white/5 rounded-lg h-full">
                <div className="flex justify-between items-center border-b border-white/[0.04] pb-1.5 mb-2 select-none">
                  <span className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-1.5">
                    <Terminal size={11} className="text-[#00f0ff]" />
                    Remote Test Console
                  </span>
                  {activePipelineStatus && (
                    <span className="font-mono text-[8.5px] uppercase font-bold text-white/60">
                      ID: #{activePipelineId}
                    </span>
                  )}
                </div>

                {/* Log Terminal Screen */}
                <div className="flex-1 bg-black/60 rounded border border-white/5 p-3 overflow-y-auto font-mono text-[9.5px] flex flex-col gap-1 pr-1.5 scrollbar-thin select-text min-h-[140px]">
                  {testLogs.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center text-white/20 select-none">
                      <Cpu size={18} className="mb-1" />
                      <span>Remote pipeline idle. Click run below to engage builds.</span>
                    </div>
                  ) : (
                    testLogs.map((log, index) => (
                      <p key={index} className="leading-relaxed text-slate-300">
                        {log}
                      </p>
                    ))
                  )}
                  <div ref={terminalEndRef} />
                </div>

                {/* Build run button */}
                <button
                  onClick={triggerRemotePipeline}
                  disabled={isRunningTest}
                  className="w-full font-sans text-[10px] font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] rounded py-2 cursor-pointer disabled:bg-white/5 disabled:text-white/35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-[0.98] select-none mt-3.5 font-bold"
                >
                  {isRunningTest ? (
                    <>
                      <span className="w-2.5 h-2.5 border border-slate-950 border-t-transparent rounded-full animate-spin inline-block" />
                      Running Remote Tests ({activePipelineStatus?.toUpperCase()})...
                    </>
                  ) : (
                    <>
                      <Play size={11} fill="currentColor" />
                      Trigger Remote CI Pipeline
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
