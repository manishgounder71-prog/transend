"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link2, RefreshCw, Terminal } from "lucide-react";
import type { ProjectInfo, PipelineInfo } from "./gitlab/gitlabTypes";
import GitLabConnectionForm from "./gitlab/GitLabConnectionForm";
import GitLabProjectSummary from "./gitlab/GitLabProjectSummary";
import GitLabPipelineList from "./gitlab/GitLabPipelineList";
import GitLabTestConsole from "./gitlab/GitLabTestConsole";
import { useWebSocket } from "@/hooks/useWebSocket";

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
  const [activePipelineStatus, setActivePipelineStatus] = useState("");

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const verifyConnectionRef = useRef<(tokVal: string, projVal: string, urlVal: string) => Promise<void>>(null!);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { isConnected: isWsConnected, subscribe } = useWebSocket();

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTestLogs((prev) => [...prev, `[${time}] ${msg}`]);
  }, []);

  // Load pipelines
  const loadPipelines = useCallback(
    async (tokVal?: string, projVal?: string, urlVal?: string) => {
      const tok = tokVal ?? token;
      const proj = projVal ?? projectId;
      const url = urlVal ?? gitlabUrl;
      if (!tok || !proj) return;
      setIsLoadingPipelines(true);

      try {
        const response = await fetch("/api/gitlab/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "pipelines", token: tok, projectId: proj, gitlabUrl: url }),
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
    },
    [token, projectId, gitlabUrl],
  );

  // Connection verifier
  const verifyConnection = useCallback(
    async (tokVal: string, projVal: string, urlVal: string) => {
      setIsVerifying(true);
      setVerifyError("");
      setProject(null);
      setTestLogs([]);

      try {
        const response = await fetch("/api/gitlab/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify", token: tokVal, projectId: projVal, gitlabUrl: urlVal }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to establish handshake connection.");
        setProject({
          status: "connected",
          projectName: data.projectName,
          description: data.description,
          webUrl: data.webUrl,
          starCount: data.starCount,
          owner: data.owner,
          path: data.path,
        });
        fetch("/api/config/gitlab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: projVal, token: tokVal, gitlabUrl: urlVal, branch }),
        }).catch(() => {});
        addLog(`HANDSHAKE NOMINAL // Authenticated with GitLab project: "${data.projectName}"`);
        addLog(`Connection Owner: @${data.owner.replace(" ", "")} // Repository URL: ${data.webUrl}`);
        loadPipelines(tokVal, projVal, urlVal);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        setVerifyError(message);
        addLog(`HANDSHAKE FAILURE // ${message}`);
      } finally {
        setIsVerifying(false);
      }
    },
    [branch, addLog, loadPipelines],
  );

  // Sync ref with latest verifyConnection after each render
  useEffect(() => {
    verifyConnectionRef.current = verifyConnection;
  });

  // Subscribe to WebSocket pipeline:status events
  useEffect(() => {
    if (!isWsConnected) return;

    const unsubStatus = subscribe("pipeline:status", (payload) => {
      setActivePipelineStatus(payload.status);
      if (payload.log) addLog(payload.log);
    });

    const unsubComplete = subscribe("pipeline:complete", (payload) => {
      setActivePipelineStatus(payload.status);
      if (payload.status === "success") {
        addLog(`SUCCESS // Pipeline completed successfully! Tests passed.`);
      } else if (payload.status === "failed") {
        addLog(`FAILURE // Integration specs failed. Pipeline aborted.`);
      }
      setIsRunningTest(false);
      loadPipelines();
    });

    return () => {
      unsubStatus();
      unsubComplete();
    };
  }, [isWsConnected, subscribe, addLog, loadPipelines]);

  // Restore connection from database on mount
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const res = await fetch("/api/config/gitlab");
        const data = await res.json();
        if (data.config && data.config.projectId) {
          setProjectId(data.config.projectId);
          setToken(data.config.token || "");
          setGitlabUrl(data.config.gitlabUrl || "https://gitlab.com/api/v4");
          setBranch(data.config.branch || "main");
          if (data.config.token) {
            verifyConnectionRef.current(data.config.token, data.config.projectId, data.config.gitlabUrl || "https://gitlab.com/api/v4");
          }
        }
      } catch {
        const savedToken = localStorage.getItem("orbit_gitlab_token") || "";
        const savedProjectId = localStorage.getItem("orbit_gitlab_project_id") || "";
        const savedUrl = localStorage.getItem("orbit_gitlab_url") || "https://gitlab.com/api/v4";
        const savedBranch = localStorage.getItem("orbit_gitlab_branch") || "main";
        if (savedToken && savedProjectId) {
          setToken(savedToken);
          setProjectId(savedProjectId);
          setGitlabUrl(savedUrl);
          setBranch(savedBranch);
          verifyConnectionRef.current(savedToken, savedProjectId, savedUrl);
        }
      } finally {
        setIsRestoring(false);
      }
    };
    restore();
  }, []);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [testLogs]);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
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
    fetch("/api/config/gitlab", { method: "DELETE" }).catch(() => {});
    setProject(null);
    setPipelines([]);
    setTestLogs([]);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    setIsRunningTest(false);
  };

  // Trigger CI Pipeline — falls back to polling if WebSocket is unavailable
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
        body: JSON.stringify({ action: "trigger", token, projectId, gitlabUrl, ref: branch }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || "Failed to trigger build.");

      const pipId = data.pipelineId;
      setActivePipelineId(pipId);
      setActivePipelineStatus(data.status);

      addLog(`CI TRIGGERED SUCCESS // Pipeline ID: #${pipId}`);
      addLog(`Commit SHA: [${data.sha}] // Branch reference: ${data.ref}`);
      addLog(`Status: ${data.status.toUpperCase()} // Initializing telemetry tracker...`);

      // If WebSocket is not connected, fall back to polling
      if (!isWsConnected) {
        startPollingStatus(pipId);
      } else {
        addLog(`Telemetry via WebSocket active — awaiting pipeline updates...`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addLog(`TRIGGER CRASH // Error: ${message}`);
      setIsRunningTest(false);
    }
  };

  // Fallback HTTP polling (used when WebSocket is unavailable)
  const startPollingStatus = (pipId: number) => {
    clearInterval(pollingIntervalRef.current!);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/gitlab/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", token, projectId, gitlabUrl, pipelineId: pipId }),
        });

        const data = await response.json();
        if (response.ok) {
          setActivePipelineStatus(data.status);
          addLog(`Telemetry update: pipeline status is "${data.status.toUpperCase()}" (Duration: ${data.duration}s)`);

          if (data.status === "success" || data.status === "failed" || data.status === "canceled" || data.status === "skipped") {
            const msg = data.status === "success" ? "Pipeline completed successfully!" : `Pipeline ${data.status}.`;
            addLog(`${data.status.toUpperCase()} // ${msg}`);
            clearInterval(pollingIntervalRef.current!);
            setIsRunningTest(false);
            loadPipelines();
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addLog(`TELEMETRY ERROR // Connection jitter: ${message}`);
      }
    }, 3500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-[485px] overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* LEFT PANEL: CONNECTION SETTINGS / SUMMARY */}
      <div className="glass-panel p-5 flex flex-col justify-between h-full overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center select-none">
            <div className="flex items-center gap-2">
              <Link2 size={14} className="text-[#00f0ff]" />
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">GitLab Project Connector</h3>
            </div>
            <div className="flex items-center gap-2">
              {project && (
                <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 uppercase tracking-wide">
                  Active
                </span>
              )}
              <span
                className={`font-mono text-[7px] font-bold px-1 py-0.5 rounded uppercase tracking-wide ${
                  isWsConnected
                    ? "bg-cyan-500/10 border border-cyan-500/20 text-[#00f0ff]"
                    : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                }`}
              >
                {isWsConnected ? "WS LIVE" : "WS OFF"}
              </span>
            </div>
          </div>

          {isRestoring ? (
            <div className="flex-1 flex items-center justify-center text-xs text-white/30 font-mono gap-2">
              <span className="w-2 h-2 border border-white/30 border-t-white rounded-full animate-spin" />
              Restoring connection...
            </div>
          ) : !project ? (
            <GitLabConnectionForm
              token={token}
              setToken={setToken}
              projectId={projectId}
              setProjectId={setProjectId}
              gitlabUrl={gitlabUrl}
              setGitlabUrl={setGitlabUrl}
              branch={branch}
              setBranch={setBranch}
              isVerifying={isVerifying}
              verifyError={verifyError}
              onSubmit={handleConnectSubmit}
            />
          ) : (
            <GitLabProjectSummary project={project} />
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
        <div className="flex-1 flex flex-col gap-4 overflow-hidden mb-4">
          <div className="border-b border-white/10 pb-2 flex justify-between items-center select-none">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Remote CI/CD Pipeline Feed</h3>
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
            <div className="flex-1 flex flex-col justify-center items-center gap-2 text-white/20 select-none text-center">
              <Terminal size={26} className="animate-pulse" />
              <p className="text-xs max-w-[340px] leading-relaxed">
                Connect your GitLab project ID and access token in the left panel to fetch and audit active pipeline check integrations.
              </p>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-5 overflow-hidden">
              <GitLabPipelineList
                pipelines={pipelines}
                isLoadingPipelines={isLoadingPipelines}
              />
              <GitLabTestConsole
                testLogs={testLogs}
                terminalEndRef={terminalEndRef}
                isRunningTest={isRunningTest}
                activePipelineId={activePipelineId}
                activePipelineStatus={activePipelineStatus}
                onTrigger={triggerRemotePipeline}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
