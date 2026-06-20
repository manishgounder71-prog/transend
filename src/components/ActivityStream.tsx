"use client";

import React, { useEffect, useState, useRef } from "react";

interface LogLine {
  time: string;
  sender: string;
  message: string;
  type: "info" | "success" | "warn" | "error" | "purple";
}

const mockActivityLogs = [
  { sender: "CISO", message: "Running automated static code analysis check on gateway config maps.", type: "success" },
  { sender: "CTO", message: "Refactoring database index layout on user_profile tables to optimize search speed.", type: "info" },
  { sender: "QA", message: "All E2E check validations passed on branch auth-service-v3. Staging deploy pending.", type: "warn" },
  { sender: "DEVOPS", message: "Kubernetes pod recycle sequence initiated for transaction db replica nodes.", type: "error" },
  { sender: "PRODUCT", message: "Updating product roadmap indices. Release confidence projected at 84%.", type: "purple" },
  { sender: "CEO", message: "Engineering metrics synchronized. Calculated corporate dev hours saved: 928 hours.", type: "success" },
  { sender: "CISO", message: "Port intrusion scan check completed in Security Arena. Threat severity: LOW.", type: "success" }
];

const initialLogs: LogLine[] = [
  { time: new Date().toLocaleTimeString(), sender: "INIT", message: "LAUNCH SEQUENCE ENGAGED // BOOT NOMINAL", type: "info" },
  { time: new Date().toLocaleTimeString(), sender: "INIT", message: "SYNCHRONIZING GITLAB ORBIT DATA LAKE...", type: "info" },
  { time: new Date().toLocaleTimeString(), sender: "INIT", message: "7 ACTIVE AI EXECUTIVE AGENTS ON STANDBY", type: "purple" },
  { time: new Date().toLocaleTimeString(), sender: "INIT", message: "COMMAND CENTER STATUS: FULLY OPERATIONAL", type: "info" }
];

export default function ActivityStream({ isLive }: { isLive: boolean }) {
  const [logs, setLogs] = useState<LogLine[]>(initialLogs);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetch("/api/gitlab/commits")
      .then(res => res.json())
      .then(data => {
        if (data && data.commits) {
          const commitLogs = data.commits.map((commit: { committed_date: string; short_id: string; author_name: string; title: string }) => ({
            time: new Date(commit.committed_date).toLocaleTimeString(),
            sender: "GITLAB",
            message: `New Commit [${commit.short_id}] by ${commit.author_name}: "${commit.title}"`,
            type: "success" as const
          }));
          setLogs(prev => [...prev, ...commitLogs]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch GitLab commits integration:", err);
      });
  }, []);

  useEffect(() => {
    if (!isLive) return;

    let index = 0;
    const interval = setInterval(() => {
      const selected = mockActivityLogs[index];
      const newLog: LogLine = {
        time: new Date().toLocaleTimeString(),
        sender: selected.sender,
        message: selected.message,
        type: selected.type as LogLine["type"]
      };
      
      setLogs(prev => {
        const updated = [...prev, newLog];
        if (updated.length > 50) updated.shift();
        return updated;
      });
      
      index = (index + 1) % mockActivityLogs.length;
    }, 5500);

    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getSenderColor = (type: string) => {
    switch (type) {
      case "info": return "text-[#00f0ff]";
      case "success": return "text-[#10b981]";
      case "warn": return "text-[#f59e0b]";
      case "error": return "text-[#ef4444]";
      case "purple": return "text-[#a855f7]";
      default: return "text-white";
    }
  };

  return (
    <footer className="h-[120px] bg-[#050816]/75 border-t border-white/5 px-6 py-2 flex flex-col gap-1.5 backdrop-blur-[20px] relative z-20">
      <div className="flex items-center gap-1.5 font-sans font-bold text-[10px] tracking-widest text-white/40 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] pulse-purple" />
        <span>AGENT ACTIVITY STREAM</span>
      </div>
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-[11px] flex flex-col gap-1 pr-4"
      >
        {logs.map((log, i) => (
          <p key={i} className="line-clamp-1 leading-normal select-text">
            <span className="text-white/30 mr-1.5">[{log.time}]</span>
            <span className={`font-bold mr-1.5 ${getSenderColor(log.type)}`}>[{log.sender}]</span>
            <span className="text-slate-300">{log.message}</span>
          </p>
        ))}
      </div>
    </footer>
  );
}
