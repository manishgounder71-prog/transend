"use client";

import React from "react";
import { AlertTriangle, RefreshCw, ShieldCheck, Key, FolderOpen } from "lucide-react";

interface GitLabConnectionFormProps {
  token: string;
  setToken: (val: string) => void;
  projectId: string;
  setProjectId: (val: string) => void;
  gitlabUrl: string;
  setGitlabUrl: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  isVerifying: boolean;
  verifyError: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function GitLabConnectionForm({
  token,
  setToken,
  projectId,
  setProjectId,
  gitlabUrl,
  setGitlabUrl,
  branch,
  setBranch,
  isVerifying,
  verifyError,
  onSubmit,
}: GitLabConnectionFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5 mt-2">
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
  );
}
