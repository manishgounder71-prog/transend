// ── Web Audio API Sound Engine ─────────────────────────────
// Generates all sounds programmatically — no external audio files needed.

const STORAGE_KEY = "orbit_cto_audio";

interface AudioSettings {
  muted: boolean;
  volume: number; // 0.0 – 1.0
}

function loadSettings(): AudioSettings {
  if (typeof window === "undefined") return { muted: false, volume: 0.5 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { muted: false, volume: 0.5 };
}

function saveSettings(s: AudioSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// Singleton audio context (created on first user interaction)
let _ctx: AudioContext | null = null;
let _settings: AudioSettings = loadSettings();
const _listeners = new Set<() => void>();

function getCtx(): AudioContext | null {
  if (_settings.muted) return null;
  if (!_ctx) {
    try {
      const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        _ctx = new AudioContextClass();
      }
    } catch {
      return null;
    }
  }
  if (_ctx?.state === "suspended") _ctx?.resume();
  return _ctx;
}

function gain(ctx: AudioContext, vol: number = 1): GainNode {
  const g = ctx.createGain();
  g.gain.value = _settings.volume * Math.max(0, Math.min(1, vol));
  g.connect(ctx.destination);
  return g;
}

// ── Public API ─────────────────────────────────────────────

export const AudioEngine = {
  /** Get current settings */
  getSettings(): AudioSettings {
    return { ..._settings };
  },

  /** Update settings (mute on/off, volume level) */
  updateSettings(update: Partial<AudioSettings>) {
    _settings = { ..._settings, ...update };
    saveSettings(_settings);
    _listeners.forEach((cb) => cb());
  },

  /** Subscribe to settings changes */
  onChange(cb: () => void) {
    _listeners.add(cb);
    return () => { _listeners.delete(cb); };
  },

  /** ⚔️ Gavel knock — low thump for debate start (0.3s) */
  playGavel() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low thump
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    const g = gain(ctx, 0.6);
    g.gain.setValueAtTime(0.5, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.3);

    // Extra click for impact
    const click = ctx.createOscillator();
    click.type = "square";
    click.frequency.setValueAtTime(800, now);
    click.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    const cg = gain(ctx, 0.2);
    cg.gain.setValueAtTime(0.3, now);
    cg.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    click.connect(cg);
    click.start(now);
    click.stop(now + 0.1);
  },

  /** 🚨 Threat alarm — rising saw sweep for hacker attacks (0.5s) */
  playThreatAlarm() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    filter.Q.value = 5;

    const g = gain(ctx, 0.35);
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter);
    filter.connect(g);
    osc.start(now);
    osc.stop(now + 0.5);
  },

  /** 🛡️ Shield block — metallic ping for successful defense (0.2s) */
  playShieldBlock() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    const g = gain(ctx, 0.25);
    g.gain.setValueAtTime(0.4, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    // Ring modulation with noise for metallic texture
    const noise = ctx.createOscillator();
    noise.type = "square";
    noise.frequency.setValueAtTime(400, now);
    const ng = gain(ctx, 0.08);
    ng.gain.setValueAtTime(0.15, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(g);
    noise.connect(ng);
    osc.start(now);
    osc.stop(now + 0.2);
    noise.start(now);
    noise.stop(now + 0.1);
  },

  /** 🔥 Combo streak — ascending power-up tone (0.3s) */
  playComboStreak(level: number) {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const baseFreq = 300 + level * 100;

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + 0.15);

    const g = gain(ctx, 0.2);
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.3);
  },

  /** 🏆 Battle complete — ascending victory arpeggio (0.6s) */
  playVictory() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const g = gain(ctx, 0.3);
      g.gain.setValueAtTime(0, now + i * 0.12);
      g.gain.linearRampToValueAtTime(0.3, now + i * 0.12 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);

      // Add warmth with triangle
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.value = freq;
      const g2 = gain(ctx, 0.1);
      g2.gain.setValueAtTime(0, now + i * 0.12);
      g2.gain.linearRampToValueAtTime(0.1, now + i * 0.12 + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);

      osc.connect(g);
      osc2.connect(g2);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.5);
      osc2.start(now + i * 0.12);
      osc2.stop(now + i * 0.12 + 0.5);
    });
  },

  /** ✨ Achievement unlock — magical chime with sparkle (0.8s) */
  playAchievement() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Major triad arpeggio
    const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const g = gain(ctx, 0.25);
      g.gain.setValueAtTime(0, now + i * 0.08);
      g.gain.linearRampToValueAtTime(0.25, now + i * 0.08 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

      // Sparkle overtone
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq * 2;
      const g2 = gain(ctx, 0.06);
      g2.gain.setValueAtTime(0, now + i * 0.08);
      g2.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.03);
      g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

      osc.connect(g);
      osc2.connect(g2);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.7);
      osc2.start(now + i * 0.08);
      osc2.stop(now + i * 0.08 + 0.3);
    });
  },

  /** 📡 Data transmission — futuristic sweep for actions (0.15s) */
  playDataTx() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    const g = gain(ctx, 0.12);
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.15);
  },

  /** 🔊 Play sound on the first user gesture to unlock AudioContext */
  unlock() {
    if (!_ctx) {
      try {
        const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          _ctx = new AudioContextClass();
        }
      } catch { /* ignore */ }
    }
    if (_ctx?.state === "suspended") _ctx.resume();
  },
};

// Auto-save settings when window closes
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => saveSettings(_settings));
}
