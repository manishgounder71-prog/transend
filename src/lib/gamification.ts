// ── Gamification Engine ─────────────────────────────────────
// Achievement badges, XP levels, weekly health trends,
// and event-driven unlock system. Persisted to localStorage.

// ── Types ───────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
  category: "mastery" | "exploration" | "response" | "simulation";
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number; // timestamp
  newlyUnlocked: boolean; // flag for animation
}

export interface LevelDef {
  title: string;
  minXp: number;
  color: string;
  icon: string;
}

export type GameEventType =
  | "pipeline:healed"
  | "pipeline:simulated"
  | "incident:resolved"
  | "boardroom:debated"
  | "hacker:battled"
  | "parallel:simulated"
  | "risk:assessed"
  | "voice:commanded"
  | "module:visited";

export interface GameState {
  totalXp: number;
  levelIndex: number;
  unlockedAchievements: UnlockedAchievement[];
  stats: Record<string, number>;
  healthHistory: number[]; // 7-day rolling health scores
  lastVisit: number;
}

// ── Achievement Definitions ─────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  // ── Mastery ──
  {
    id: "healer",
    name: "The Healer",
    description: "Auto-heal the pipeline for the first time",
    emoji: "🔧",
    xpReward: 50,
    category: "mastery",
  },
  {
    id: "healer_veteran",
    name: "The Mechanic",
    description: "Auto-heal the pipeline 5 times",
    emoji: "⚙️",
    xpReward: 100,
    category: "mastery",
  },
  {
    id: "incident_slayer",
    name: "First Responder",
    description: "Resolve your first incident",
    emoji: "🚨",
    xpReward: 50,
    category: "mastery",
  },
  {
    id: "incident_veteran",
    name: "Incident Commander",
    description: "Resolve 5 incidents",
    emoji: "🎖️",
    xpReward: 100,
    category: "mastery",
  },
  {
    id: "security_sentinel",
    name: "Cyber Sentinel",
    description: "Win your first security battle",
    emoji: "🛡️",
    xpReward: 50,
    category: "mastery",
  },
  {
    id: "security_champion",
    name: "Arena Champion",
    description: "Win 5 security battles",
    emoji: "🏆",
    xpReward: 100,
    category: "mastery",
  },
  {
    id: "debate_starter",
    name: "Executive Presence",
    description: "Convene your first boardroom debate",
    emoji: "🎯",
    xpReward: 30,
    category: "mastery",
  },
  {
    id: "debate_veteran",
    name: "Boardroom Veteran",
    description: "Convene 10 boardroom debates",
    emoji: "👑",
    xpReward: 100,
    category: "mastery",
  },
  // ── Simulation ──
  {
    id: "first_sim",
    name: "What-If Wizard",
    description: "Run your first parallel simulation",
    emoji: "🔮",
    xpReward: 30,
    category: "simulation",
  },
  {
    id: "sim_veteran",
    name: "Quantum Analyst",
    description: "Run 15 parallel simulations",
    emoji: "⚡",
    xpReward: 100,
    category: "simulation",
  },
  {
    id: "risk_master",
    name: "Doom Seer",
    description: "Run 10 risk assessments",
    emoji: "🔭",
    xpReward: 75,
    category: "simulation",
  },
  // ── Exploration ──
  {
    id: "explorer",
    name: "The Explorer",
    description: "Visit every module at least once",
    emoji: "🗺️",
    xpReward: 100,
    category: "exploration",
  },
  {
    id: "voice_pioneer",
    name: "Voice Commander",
    description: "Issue 20 voice/text commands",
    emoji: "🎙️",
    xpReward: 50,
    category: "exploration",
  },
  // ── Response ──
  {
    id: "perfect_health",
    name: "Zen Master",
    description: "Achieve a 100 health score",
    emoji: "🧘",
    xpReward: 150,
    category: "response",
  },
  {
    id: "upgrade",
    name: "System Upgraded",
    description: "Reach Level 5 (Visionary CTO)",
    emoji: "🌟",
    xpReward: 200,
    category: "response",
  },
];

// ── Level Definitions ──────────────────────────────────────

export const LEVELS: LevelDef[] = [
  { title: "Junior CTO", minXp: 0, color: "#64748b", icon: "🌱" },
  { title: "Senior CTO", minXp: 100, color: "#00f0ff", icon: "⚡" },
  { title: "Lead CTO", minXp: 300, color: "#a855f7", icon: "🔥" },
  { title: "Chief CTO", minXp: 600, color: "#10b981", icon: "💎" },
  { title: "Visionary CTO", minXp: 1000, color: "#f59e0b", icon: "🌟" },
];

// ── XP Rewards per Event ───────────────────────────────────

export const EVENT_XP: Record<GameEventType, number> = {
  "pipeline:healed": 25,
  "pipeline:simulated": 10,
  "incident:resolved": 25,
  "boardroom:debated": 15,
  "hacker:battled": 20,
  "parallel:simulated": 15,
  "risk:assessed": 10,
  "voice:commanded": 5,
  "module:visited": 2,
};

// ── Default State ──────────────────────────────────────────

const STORAGE_KEY = "orbit_gamification_state";

function defaultState(): GameState {
  return {
    totalXp: 0,
    levelIndex: 0,
    unlockedAchievements: [],
    stats: {},
    healthHistory: Array.from({ length: 7 }, (_, i) => Math.floor(85 + Math.random() * 10)),
    lastVisit: Date.now(),
  };
}

// ── Persistence ────────────────────────────────────────────

let state: GameState = defaultState();

export function loadState(): GameState {
  if (typeof window === "undefined") return state;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      state = {
        ...defaultState(),
        ...parsed,
        healthHistory: parsed.healthHistory ?? defaultState().healthHistory,
      };
    }
  } catch {
    state = defaultState();
  }
  return state;
}

function saveState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage might be full
  }
}

// ── Module-level state load on import ──────────────────────

loadState();

// ── XP & Level Helpers ─────────────────────────────────────

export function getLevel(totalXp: number): { index: number; title: string; color: string; icon: string; progress: number; nextLevelXp: number } {
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].minXp) {
      idx = i;
      break;
    }
  }

  const current = LEVELS[idx];
  const next = LEVELS[Math.min(idx + 1, LEVELS.length - 1)];
  const currentMin = current.minXp;
  const nextMin = next.minXp;
  const range = nextMin - currentMin;
  const progress = range > 0 ? Math.min(1, (totalXp - currentMin) / range) : 1;

  return {
    index: idx,
    title: current.title,
    color: current.color,
    icon: current.icon,
    progress,
    nextLevelXp: nextMin,
  };
}

// ── Event Bus ──────────────────────────────────────────────

type GameEventCallback = (event: GameEventType) => void;
const listeners = new Set<GameEventCallback>();

export function onGameEvent(cb: GameEventCallback): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// ── Check & Unlock Achievements ────────────────────────────

function checkAchievements(): UnlockedAchievement[] {
  const newlyUnlocked: UnlockedAchievement[] = [];
  const unlockedIds = new Set(state.unlockedAchievements.map((u) => u.id));

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;

    let earned = false;

    switch (achievement.id) {
      case "healer":
        earned = (state.stats["pipeline:healed"] ?? 0) >= 1;
        break;
      case "healer_veteran":
        earned = (state.stats["pipeline:healed"] ?? 0) >= 5;
        break;
      case "incident_slayer":
        earned = (state.stats["incident:resolved"] ?? 0) >= 1;
        break;
      case "incident_veteran":
        earned = (state.stats["incident:resolved"] ?? 0) >= 5;
        break;
      case "security_sentinel":
        earned = (state.stats["hacker:battled"] ?? 0) >= 1;
        break;
      case "security_champion":
        earned = (state.stats["hacker:battled"] ?? 0) >= 5;
        break;
      case "debate_starter":
        earned = (state.stats["boardroom:debated"] ?? 0) >= 1;
        break;
      case "debate_veteran":
        earned = (state.stats["boardroom:debated"] ?? 0) >= 10;
        break;
      case "first_sim":
        earned = (state.stats["parallel:simulated"] ?? 0) >= 1;
        break;
      case "sim_veteran":
        earned = (state.stats["parallel:simulated"] ?? 0) >= 15;
        break;
      case "risk_master":
        earned = (state.stats["risk:assessed"] ?? 0) >= 10;
        break;
      case "explorer": {
        const requiredTabs = ["dashboard", "digitaltwin", "parallel", "boardroom", "predictor", "pipeline", "hacker", "incidents", "timemachine", "gitlab", "knowledge"];
        const visited = new Set(Object.keys(state.stats).filter((k) => k.startsWith("module:")));
        earned = requiredTabs.every((tab) => visited.has(`module:${tab}`));
        break;
      }
      case "voice_pioneer":
        earned = (state.stats["voice:commanded"] ?? 0) >= 20;
        break;
      case "perfect_health": {
        // Achieved when any health history entry is 100
        earned = state.healthHistory.some((h) => h >= 100);
        break;
      }
      case "upgrade":
        earned = getLevel(state.totalXp).index >= 4;
        break;
    }

    if (earned) {
      const ua: UnlockedAchievement = { id: achievement.id, unlockedAt: Date.now(), newlyUnlocked: true };
      state.unlockedAchievements.push(ua);
      state.totalXp += achievement.xpReward;
      newlyUnlocked.push(ua);
    }
  }

  return newlyUnlocked;
}

// ── Dispatch Event ─────────────────────────────────────────

export function dispatchGameEvent(event: GameEventType): { newlyUnlocked: UnlockedAchievement[]; totalXp: number; levelChanged: boolean } {
  // Track stat
  state.stats[event] = (state.stats[event] ?? 0) + 1;
  state.totalXp += EVENT_XP[event] ?? 0;

  const oldLevel = getLevel(state.totalXp - (EVENT_XP[event] ?? 0)).index;
  const newlyUnlocked = checkAchievements();
  const newLevel = getLevel(state.totalXp).index;
  const levelChanged = newLevel > oldLevel;

  saveState();

  // Notify listeners async
  setTimeout(() => {
    for (const cb of listeners) cb(event);
  }, 0);

  return { newlyUnlocked, totalXp: state.totalXp, levelChanged };
}

// ── Health History ──────────────────────────────────────────

export function recordHealthSnapshot(score: number): void {
  state.healthHistory.push(score);
  if (state.healthHistory.length > 14) {
    state.healthHistory = state.healthHistory.slice(-14);
  }
  checkAchievements();
  saveState();
}

// ── State Getters ──────────────────────────────────────────

export function getCurrentState(): GameState {
  return { ...state };
}

export function getUnlockedAchievements(): Achievement[] {
  const unlockedIds = new Set(state.unlockedAchievements.map((u) => u.id));
  return ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id));
}

export function getNewlyUnlockedAchievements(): Achievement[] {
  const ids = state.unlockedAchievements
    .filter((u) => u.newlyUnlocked)
    .map((u) => u.id);
  return ACHIEVEMENTS.filter((a) => ids.includes(a.id));
}

export function clearNewlyUnlockedFlags(): void {
  state.unlockedAchievements = state.unlockedAchievements.map((u) => ({ ...u, newlyUnlocked: false }));
  saveState();
}

// ── Reset (for testing) ────────────────────────────────────

export function resetGameState(): void {
  state = defaultState();
  saveState();
}
