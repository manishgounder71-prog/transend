"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  TrendingUp,
  Zap,
  Medal,
  Target,
  Star,
  Award,
  Shield,
  Activity,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  type Achievement,
  type UnlockedAchievement,
  type GameEventType,
  ACHIEVEMENTS,
  LEVELS,
  getLevel,
  getCurrentState,
  getUnlockedAchievements,
  getNewlyUnlockedAchievements,
  clearNewlyUnlockedFlags,
  onGameEvent,
} from "@/lib/gamification";
import { AudioEngine } from "@/lib/audio";

// ── Mini SVG Bar Chart for Health Trends ───────────────────

function HealthTrendChart({ data }: { data: number[] }) {
  if (data.length === 0) return null;

  const w = 220;
  const h = 60;
  const pad = 2;
  const barW = Math.max(4, Math.floor((w - data.length * pad) / data.length));
  const maxVal = Math.max(...data, 100);

  return (
    <svg width={w} height={h} className="overflow-visible">
      {data.map((val, i) => {
        const barH = (val / maxVal) * (h - 8);
        const x = i * (barW + pad);
        const y = h - 4 - barH;
        const isHigh = val >= 95;
        const isMid = val >= 85;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={2}
              fill={isHigh ? "#10b981" : isMid ? "#00f0ff" : "#f59e0b"}
              opacity={0.8}
              className="transition-all duration-500"
            >
              <title>{val.toFixed(0)}%</title>
            </rect>
            {/* Glow top */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.min(3, barH)}
              rx={1}
              fill={isHigh ? "#10b981" : isMid ? "#00f0ff" : "#f59e0b"}
              opacity={0.4}
              filter="url(#bar-glow)"
            />
          </g>
        );
      })}

      {/* Gradient definition for bar glow */}
      <defs>
        <filter id="bar-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// ── Achievement Badge Component ────────────────────────────

function AchievementBadge({
  achievement,
  unlocked,
  isNew,
}: {
  achievement: Achievement;
  unlocked: boolean;
  isNew: boolean;
}) {
  const categoryColors: Record<string, string> = {
    mastery: "border-purple-500/30 bg-purple-500/5",
    exploration: "border-cyan-500/30 bg-cyan-500/5",
    simulation: "border-blue-500/30 bg-blue-500/5",
    response: "border-emerald-500/30 bg-emerald-500/5",
  };

  return (
    <div
      className={`relative rounded-lg border p-3 transition-all duration-300 ${
        unlocked
          ? `${categoryColors[achievement.category]} opacity-100`
          : "border-white/5 bg-white/[0.01] opacity-35 grayscale"
      } ${isNew ? "animate-in zoom-in-95 fade-in duration-500" : ""}`}
    >
      {/* New badge indicator */}
      {isNew && (
        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#00f0ff] rounded-full animate-ping" />
      )}

      <div className="flex items-start gap-2.5">
        <span className="text-lg leading-none mt-0.5">{achievement.emoji}</span>
        <div className="min-w-0 flex-1">
          <span
            className={`text-[10.5px] font-bold block leading-tight ${
              unlocked ? "text-white" : "text-white/40"
            }`}
          >
            {achievement.name}
          </span>
          <span className="text-[8.5px] text-white/30 block mt-0.5 leading-tight">
            {achievement.description}
          </span>
          {unlocked && (
            <span className="text-[8px] font-mono text-[#00f0ff] block mt-1 font-bold">
              +{achievement.xpReward} XP
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── New Achievement Toast ──────────────────────────────────

function NewAchievementToast({
  achievements,
  onDismiss,
}: {
  achievements: Achievement[];
  onDismiss: () => void;
}) {
  if (achievements.length === 0) return null;

  return (
    <div className="fixed bottom-[270px] right-6 z-[100] flex flex-col gap-2 max-w-[300px]">
      {achievements.map((a) => (
        <div
          key={a.id}
          className="glass-panel p-3 border-[#00f0ff]/30 bg-[#050816]/90 animate-in slide-in-from-right-5 fade-in duration-500"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{a.emoji}</span>
            <div>
              <span className="text-[9px] font-bold text-[#00f0ff] uppercase block tracking-wider">
                Achievement Unlocked!
              </span>
              <span className="text-[11px] font-bold text-white block">{a.name}</span>
              <span className="text-[9px] text-white/50">+{a.xpReward} XP</span>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={onDismiss}
        className="text-[9px] text-white/30 hover:text-white/60 transition self-end font-mono"
      >
        Dismiss all
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function GamificationPanel() {
  const [state, setState] = useState(() => getCurrentState());
  const [unlocked, setUnlocked] = useState<Achievement[]>(() => getUnlockedAchievements());
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>(() => getNewlyUnlockedAchievements());
  const [showToast, setShowToast] = useState(newlyUnlocked.length > 0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setState(getCurrentState());
    setUnlocked(getUnlockedAchievements());
    const freshNew = getNewlyUnlockedAchievements();
    if (freshNew.length > 0) {
      setNewlyUnlocked(freshNew);
      setShowToast(true);
    }
  }, []);

  // Listen for game events to refresh display
  useEffect(() => {
    const unsub = onGameEvent(() => {
      const freshNew = getNewlyUnlockedAchievements();
      if (freshNew.length > 0) {
        AudioEngine.unlock();
        AudioEngine.playAchievement();
      }
      refresh();
    });
    return unsub;
  }, [refresh]);

  const level = getLevel(state.totalXp);
  const unlockedIds = new Set(unlocked.map((a) => a.id));

  // Filter achievements
  const filteredAchievements = activeFilter
    ? ACHIEVEMENTS.filter((a) => a.category === activeFilter)
    : ACHIEVEMENTS;

  // Category counts
  const categoryCounts = {
    mastery: ACHIEVEMENTS.filter((a) => a.category === "mastery").length,
    exploration: ACHIEVEMENTS.filter((a) => a.category === "exploration").length,
    simulation: ACHIEVEMENTS.filter((a) => a.category === "simulation").length,
    response: ACHIEVEMENTS.filter((a) => a.category === "response").length,
  };

  const categoryUnlocked = {
    mastery: ACHIEVEMENTS.filter((a) => a.category === "mastery" && unlockedIds.has(a.id)).length,
    exploration: ACHIEVEMENTS.filter((a) => a.category === "exploration" && unlockedIds.has(a.id)).length,
    simulation: ACHIEVEMENTS.filter((a) => a.category === "simulation" && unlockedIds.has(a.id)).length,
    response: ACHIEVEMENTS.filter((a) => a.category === "response" && unlockedIds.has(a.id)).length,
  };

  const dismissToast = () => {
    setShowToast(false);
    clearNewlyUnlockedFlags();
    setNewlyUnlocked([]);
  };

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlocked.length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* New achievement toast notification */}
      {showToast && newlyUnlocked.length > 0 && (
        <NewAchievementToast achievements={newlyUnlocked} onDismiss={dismissToast} />
      )}

      {/* Top: Level Card + Health Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Level Card */}
        <div className="glass-panel p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none flex items-center gap-2">
                <Trophy size={14} className="text-[#f59e0b]" />
                CTO Rank & Progression
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">Earn XP by using modules and completing actions.</p>
            </div>

            {/* Level badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold font-mono"
              style={{ borderColor: level.color + "40", color: level.color, backgroundColor: level.color + "10" }}
            >
              <span className="text-sm">{level.icon}</span>
              <span>{level.title}</span>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-1">
            <div className="flex justify-between text-[10px] font-mono mb-1.5">
              <span className="text-white/50">XP: {state.totalXp}</span>
              <span className="text-white/30">Next: {level.nextLevelXp} XP</span>
            </div>
            <div className="h-2.5 bg-black/45 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${level.progress * 100}%`,
                  background: `linear-gradient(90deg, ${level.color}66, ${level.color})`,
                  boxShadow: `0 0 8px ${level.color}40`,
                }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-white/20 mt-1">
              {LEVELS.map((l, i) => (
                <span
                  key={i}
                  className={i <= level.index ? "text-[#00f0ff]/40 font-bold" : ""}
                >
                  {l.icon}
                </span>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-1">
            <div className="bg-black/25 border border-white/5 rounded-lg p-2.5 text-center">
              <span className="text-[16px] font-black text-[#00f0ff] block">{state.totalXp}</span>
              <span className="text-[7.5px] text-white/30 uppercase font-bold block">Total XP</span>
            </div>
            <div className="bg-black/25 border border-white/5 rounded-lg p-2.5 text-center">
              <span className="text-[16px] font-black text-[#a855f7] block">
                {unlockedCount}/{totalAchievements}
              </span>
              <span className="text-[7.5px] text-white/30 uppercase font-bold block">Badges</span>
            </div>
            <div className="bg-black/25 border border-white/5 rounded-lg p-2.5 text-center">
              <span className="text-[16px] font-black text-[#10b981] block">{level.title.split(" ")[0]}</span>
              <span className="text-[7.5px] text-white/30 uppercase font-bold block">Rank</span>
            </div>
          </div>
        </div>

        {/* Weekly Health Trends */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none flex items-center gap-2">
                <Activity size={14} className="text-[#10b981]" />
                Health Trends
              </h3>
              <p className="text-[9px] text-white/30 font-mono mt-0.5">14-day rolling score</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#10b981]">
              <TrendingUp size={12} />
              <span>
                {state.healthHistory.length > 1
                  ? (state.healthHistory[state.healthHistory.length - 1] - state.healthHistory[0]).toFixed(0)
                  : 0}
                %
              </span>
            </div>
          </div>

          <div className="flex justify-center py-2">
            <HealthTrendChart data={state.healthHistory} />
          </div>

          <div className="flex justify-between text-[8px] font-mono text-white/20">
            <span>T-14</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Achievement Stats Bar */}
      <div className="glass-panel p-3 flex flex-wrap items-center gap-3">
        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
          <Medal size={12} />
          Progress
        </span>
        {(["mastery", "exploration", "simulation", "response"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
            className={`text-[9px] font-mono px-2 py-1 rounded border transition ${
              activeFilter === cat
                ? "bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]"
                : "border-white/5 text-white/30 hover:border-white/10 hover:text-white/50"
            }`}
          >
            {cat}: {categoryUnlocked[cat]}/{categoryCounts[cat]}
          </button>
        ))}
        {activeFilter && (
          <button
            onClick={() => setActiveFilter(null)}
            className="text-[9px] font-mono text-white/20 hover:text-white/50 transition ml-auto"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Achievement Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockedIds.has(achievement.id)}
            isNew={newlyUnlocked.some((n) => n.id === achievement.id)}
          />
        ))}
      </div>

      {/* Empty state if filter yields no results */}
      {filteredAchievements.length === 0 && (
        <div className="glass-panel py-8 flex flex-col items-center justify-center text-center gap-2 text-white/30">
          <Target size={28} className="opacity-50" />
          <p className="text-xs font-medium">No achievements in this category yet.</p>
        </div>
      )}
    </div>
  );
}
