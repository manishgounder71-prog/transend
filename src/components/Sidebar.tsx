"use client";

import React from "react";
import {
  LayoutDashboard,
  Share2,
  GitBranch,
  ShieldAlert,
  Users,
  ShieldCheck,
  Activity,
  Clock,
  RefreshCw,
  Link2,
  BookOpen,
  Trophy,
} from "lucide-react";
import type { TabId } from "@/lib/types";
import GoogleSearchGrounding from "@/components/KnowledgeBaseStatus";
import OrbitStatusBadge from "@/components/orbit/OrbitStatusBadge";
import { dispatchGameEvent } from "@/lib/gamification";

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  searchQuery?: string;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: "gitlab", label: "GitLab Integrator", icon: Link2 },
  { id: "dashboard", label: "Mission Control", icon: LayoutDashboard },
  { id: "digitaltwin", label: "Digital Twin", icon: Share2 },
  { id: "parallel", label: "Parallel Universe", icon: GitBranch },
  { id: "boardroom", label: "AI Boardroom", icon: Users },
  { id: "predictor", label: "Doom Predictor", icon: Activity },
  { id: "pipeline", label: "Self-Healing CI", icon: RefreshCw },
  { id: "hacker", label: "Security Arena", icon: ShieldCheck },
  { id: "incidents", label: "Incidents", icon: ShieldAlert },
  { id: "timemachine", label: "Time Machine", icon: Clock },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

export default function Sidebar({ activeTab, onTabChange, searchQuery = "" }: SidebarProps) {
  const filtered = searchQuery.trim()
    ? navItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navItems;

  return (
    <aside className="col-start-1 border-r border-white/5 bg-[#050816]/35 backdrop-blur-[15px] p-5 overflow-y-auto overflow-x-hidden">
      <nav className="flex flex-col gap-1">
        {filtered.length === 0 && searchQuery.trim() && (
          <div className="text-[10px] text-white/30 font-mono text-center py-4 select-none">
            No modules match &quot;{searchQuery}&quot;
          </div>
        )}
        {filtered.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                dispatchGameEvent(`module:${item.id}` as any);
              }}
              className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                isActive
                  ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                  : "text-white/50 hover:bg-white/2 hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto space-y-2">
        <OrbitStatusBadge />
        <GoogleSearchGrounding />
      </div>
    </aside>
  );
}
