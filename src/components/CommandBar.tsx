"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Command, Keyboard, Monitor, GitBranch, Shield, Users, Gauge, Clock, Swords, BookOpen, Cpu, Trophy } from "lucide-react";
import type { TabId } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";
import AudioSettings from "@/components/AudioSettings";

interface CommandBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate?: (tab: TabId) => void;
}

const QUICK_JUMP_ITEMS: { id: TabId; label: string; icon: React.ElementType; shortcut: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: Monitor, shortcut: "⌘1" },
  { id: "boardroom", label: "Boardroom", icon: Users, shortcut: "⌘2" },
  { id: "pipeline", label: "Pipeline", icon: GitBranch, shortcut: "⌘3" },
  { id: "incidents", label: "Incidents", icon: Shield, shortcut: "⌘4" },
  { id: "hacker", label: "Hacker Arena", icon: Swords, shortcut: "⌘5" },
  { id: "predictor", label: "Release Predictor", icon: Gauge, shortcut: "⌘6" },
  { id: "parallel", label: "Parallel Simulator", icon: Clock, shortcut: "⌘7" },
  { id: "digitaltwin", label: "Digital Twin", icon: Cpu, shortcut: "⌘8" },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen, shortcut: "⌘9" },
  { id: "achievements", label: "Achievements", icon: Trophy, shortcut: "⌘0" },
];

export default function CommandBar({ searchQuery, onSearchChange, onNavigate }: CommandBarProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Toggle command palette with ⌘K (or Ctrl+K on Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      // Quick nav shortcuts: ⌘1-⌘0
      const match = e.key.match(/^[0-9]$/);
      if ((e.metaKey || e.ctrlKey) && match && onNavigate) {
        e.preventDefault();
        const idx = parseInt(match[0]);
        const item = QUICK_JUMP_ITEMS[idx === 0 ? 9 : idx - 1];
        if (item) {
          onNavigate(item.id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNavigate]);

  // Focus input when palette opens
  useEffect(() => {
    if (commandPaletteOpen && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [commandPaletteOpen]);

  // Close on click outside
  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setCommandPaletteOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCommandPaletteOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [commandPaletteOpen]);

  const filteredCommands = QUICK_JUMP_ITEMS.filter(
    (item) => !commandSearch || item.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  const handleCommandSelect = (id: TabId) => {
    onNavigate?.(id);
    setCommandPaletteOpen(false);
    setCommandSearch("");
  };

  return (
    <>
      <header className="row-start-1 bg-[#050816]/65 border-b border-white/5 px-6 flex items-center justify-between backdrop-blur-[25px] relative z-20">
        <div className="flex items-center gap-3">
          <span className="font-sans font-black text-[17px] tracking-tight bg-gradient-to-r from-[#00f0ff] to-[#a855f7] bg-clip-text text-transparent filter drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]">
            ORBIT CTO X
          </span>
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[#00f0ff] tracking-wider uppercase">
            COMMAND CENTER
          </span>
          {/* Quick-jump hint */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-1.5 text-[9px] font-mono text-white/20 hover:text-white/50 transition-colors cursor-pointer border border-white/5 hover:border-white/10 rounded px-2 py-0.5"
          >
            <Command size={10} />
            <span>Quick Jump</span>
            <kbd className="text-[7px] px-1 py-px rounded bg-white/5 border border-white/10 ml-1">⌘K</kbd>
          </button>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex items-center gap-2 bg-black/35 border border-white/5 rounded-lg px-3 py-1.5 w-[280px] text-white/40 transition-all focus-within:border-cyan-500/30 focus-within:shadow-[0_0_12px_rgba(0,240,255,0.08)]">
          <Search size={14} className="text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search modules, agents, or pipeline logs..."
            className="bg-transparent border-none outline-none text-[11px] text-white w-full placeholder-white/25"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="text-[9px] text-white/20 hover:text-white/50 cursor-pointer font-mono"
            >
              Esc
            </button>
          )}
        </div>

        {/* Status indicators with animated glow */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span className="absolute w-3 h-3 rounded-full bg-[#10b981]/30 animate-ping" />
            </span>
            <div className="text-[10px]">
              <span className="text-white/40 block font-semibold leading-none mb-0.5">SYSTEM HEALTH</span>
              <span className="font-bold bg-gradient-to-r from-[#10b981] to-emerald-300 bg-clip-text text-transparent">98.4% NOMINAL</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="relative flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
              <span className="absolute w-3 h-3 rounded-full bg-[#00f0ff]/30 animate-ping" />
            </span>
            <div className="text-[10px]">
              <span className="text-white/40 block font-semibold leading-none mb-0.5">GITLAB SYNC</span>
              <span className="font-bold text-[#00f0ff]">CONNECTED</span>
            </div>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Audio settings */}
          <AudioSettings />

          {/* Keyboard shortcut hint */}
          <div className="hidden lg:flex items-center gap-1 text-[8px] font-mono text-white/15 border-l border-white/5 pl-4">
            <Keyboard size={9} className="text-white/20" />
            <span>⌘K palette</span>
            <span className="text-white/10 mx-1">·</span>
            <span>⌘1-9 nav</span>
          </div>
        </div>

        {/* Profile */}
        <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a855f7] to-[#0072ff] flex items-center justify-center font-bold text-sm shadow-[0_0_8px_rgba(168,85,247,0.4)] hover:shadow-[0_0_16px_rgba(168,85,247,0.6)] transition-shadow">
            X
          </div>
          <div className="text-[10px]">
            <span className="font-bold block">CTO Command</span>
            <span className="text-white/40 block">Executive Level</span>
          </div>
        </div>
      </header>

      {/* Command Palette Overlay */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm">
          <div
            ref={paletteRef}
            className="w-full max-w-lg bg-[#0a0e1a] border border-white/10 rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <Search size={15} className="text-white/30 flex-shrink-0" />
              <input
                ref={commandInputRef}
                type="text"
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                placeholder="Type a module name or command..."
                className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder-white/25"
              />
              <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/30 flex-shrink-0">
                Esc
              </kbd>
            </div>

            <div className="max-h-[300px] overflow-y-auto py-2">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-white/20 font-mono">
                  No modules match &quot;{commandSearch}&quot;
                </div>
              ) : (
                filteredCommands.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleCommandSelect(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all">
                        <Icon size={13} className="text-white/50 group-hover:text-[#00f0ff]" />
                      </div>
                      <span className="flex-1 text-[12.5px] font-medium text-white/80 group-hover:text-white">
                        {item.label}
                      </span>
                      <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/25 group-hover:text-white/50">
                        {item.shortcut}
                      </kbd>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[8px] font-mono text-white/20">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>⌘ Esc</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
