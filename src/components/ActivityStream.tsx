"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Search, ArrowDownToDot, AlertTriangle, AlertCircle, Info, ShieldCheck, Sparkles } from "lucide-react";

interface LogLine {
  time: string;
  sender: string;
  message: string;
  type: "info" | "success" | "warn" | "error" | "purple";
}

const initialLogs: LogLine[] = [
  { time: "", sender: "INIT", message: "LAUNCH SEQUENCE ENGAGED // BOOT NOMINAL", type: "info" },
  { time: "", sender: "INIT", message: "SYNCHRONIZING GITLAB ORBIT DATA LAKE...", type: "info" },
  { time: "", sender: "INIT", message: "7 ACTIVE AI EXECUTIVE AGENTS ON STANDBY", type: "purple" },
  { time: "", sender: "INIT", message: "COMMAND CENTER STATUS: FULLY OPERATIONAL", type: "info" },
];

const FILTER_TABS = [
  { id: "all", label: "All", icon: Info },
  { id: "info", label: "Info", icon: Info },
  { id: "success", label: "Success", icon: ShieldCheck },
  { id: "warn", label: "Warn", icon: AlertTriangle },
  { id: "error", label: "Error", icon: AlertCircle },
  { id: "purple", label: "Agent", icon: Sparkles },
] as const;

type FilterId = (typeof FILTER_TABS)[number]["id"];

export default function ActivityStream({ isLive }: { isLive: boolean }) {
  const [logs, setLogs] = useState<LogLine[]>(() =>
    initialLogs.map((l) => ({ ...l, time: new Date().toLocaleTimeString() })),
  );
  const [isLoadingCommits, setIsLoadingCommits] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isConnected, subscribe } = useWebSocket();

  // Fetch GitLab commits on mount (one-time)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/gitlab/commits")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data && data.commits) {
          const commitLogs = data.commits.map(
            (commit: { committed_date: string; short_id: string; author_name: string; title: string }) => ({
              time: new Date(commit.committed_date).toLocaleTimeString(),
              sender: "GITLAB",
              message: `New Commit [${commit.short_id}] by ${commit.author_name}: "${commit.title}"`,
              type: "success" as const,
            }),
          );
          setLogs((prev) => [...prev, ...commitLogs]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingCommits(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Subscribe to WebSocket activity:log events
  useEffect(() => {
    if (!isLive || !isConnected) return;

    const unsub = subscribe("activity:log", (payload) => {
      setLogs((prev) => {
        const newLog: LogLine = {
          time: payload.time || new Date().toLocaleTimeString(),
          sender: payload.sender,
          message: payload.message,
          type: payload.type,
        };
        const updated = [...prev, newLog];
        return updated.length > 100 ? updated.slice(-100) : updated;
      });
    });

    return unsub;
  }, [isLive, isConnected, subscribe]);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter + search logs
  const filteredLogs = useMemo(() => {
    let f = logs;
    if (activeFilter !== "all") {
      f = f.filter((l) => l.type === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter((l) => l.message.toLowerCase().includes(q) || l.sender.toLowerCase().includes(q));
    }
    return f;
  }, [logs, activeFilter, searchQuery]);

  const getSenderColor = (type: string) => {
    switch (type) {
      case "info":
        return "text-[#00f0ff]";
      case "success":
        return "text-[#10b981]";
      case "warn":
        return "text-[#f59e0b]";
      case "error":
        return "text-[#ef4444]";
      case "purple":
        return "text-[#a855f7]";
      default:
        return "text-white";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "info":
        return "bg-cyan-500/15 text-[#00f0ff] border-cyan-500/20";
      case "success":
        return "bg-emerald-500/15 text-[#10b981] border-emerald-500/20";
      case "warn":
        return "bg-amber-500/15 text-[#f59e0b] border-amber-500/20";
      case "error":
        return "bg-red-500/15 text-[#ef4444] border-red-500/20";
      case "purple":
        return "bg-purple-500/15 text-[#a855f7] border-purple-500/20";
      default:
        return "bg-white/5 text-white/40 border-white/10";
    }
  };

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: logs.length };
    for (const t of ["info", "success", "warn", "error", "purple"]) {
      counts[t] = logs.filter((l) => l.type === t).length;
    }
    return counts;
  }, [logs]);

  return (
    <footer className="h-[160px] bg-[#050816]/80 border-t border-white/5 px-4 py-2 flex flex-col gap-1 backdrop-blur-[20px] relative z-20">
      {/* Header row with filter tabs + controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-sans font-bold text-[10px] tracking-widest text-white/40 select-none">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-[#10b981] pulse-emerald" : "bg-[#f59e0b]"} transition-colors`}
          />
          <span>ACTIVITY STREAM</span>
          {isConnected ? (
            <span className="text-[8px] font-mono text-emerald-500/50 uppercase tracking-wider">LIVE</span>
          ) : (
            <span className="text-[8px] font-mono text-amber-500/50 uppercase tracking-wider">CONNECTING...</span>
          )}
          {/* Log count badge */}
          <span className="ml-1 text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">
            {filteredLogs.length}/{logs.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Filter tabs */}
          <div className="flex items-center gap-0.5">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              const count = typeCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/30"
                      : "text-white/30 hover:text-white/60 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon size={9} />
                  <span>{tab.label}</span>
                  <span className="text-[7px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="w-px h-4 bg-white/10 mx-1" />

          {/* Search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-0.5 rounded transition-all cursor-pointer ${
              showSearch ? "text-[#00f0ff]" : "text-white/30 hover:text-white/60"
            }`}
          >
            <Search size={12} />
          </button>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-0.5 rounded transition-all cursor-pointer ${
              autoScroll ? "text-[#10b981]" : "text-white/30 hover:text-white/60"
            }`}
            title={autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
          >
            <ArrowDownToDot size={12} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded px-2 py-1">
          <Search size={11} className="text-white/30 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter logs by message or sender..."
            className="bg-transparent border-none outline-none text-[10px] text-white w-full placeholder-white/20 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[9px] text-white/30 hover:text-white/60 cursor-pointer font-mono"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Logs container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-[11px] flex flex-col gap-0.5 pr-2 scrollbar-thin"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[10px] text-white/20 italic">
            {searchQuery ? `No logs match "${searchQuery}"` : "No logs in this category"}
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-1.5 leading-normal select-text group hover:bg-white/[0.02] rounded px-1 py-px transition-colors">
              <span className={`text-[7px] font-bold px-1 py-px rounded border ${getTypeBadge(log.type)} flex-shrink-0 uppercase`}>
                {log.type === "purple" ? "AGT" : log.type.toUpperCase().slice(0, 3)}
              </span>
              <span className="text-white/25 mr-0.5 flex-shrink-0 text-[9px]">[{log.time}]</span>
              <span className={`font-bold flex-shrink-0 text-[10px] ${getSenderColor(log.type)}`}>
                [{log.sender}]
              </span>
              <span className="text-slate-300 truncate min-w-0">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {isLoadingCommits && (
        <div className="absolute bottom-1 right-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 border border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-[8px] font-mono text-white/20">Syncing GitLab...</span>
        </div>
      )}
    </footer>
  );
}
