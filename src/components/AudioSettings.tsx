"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";
import { AudioEngine } from "@/lib/audio";

export default function AudioSettings() {
  const [settings, setSettings] = useState(() => AudioEngine.getSettings());
  const [open, setOpen] = useState(false);
  const [tempVolume, setTempVolume] = useState(settings.volume);

  useEffect(() => {
    const unsub = AudioEngine.onChange(() => {
      setSettings(AudioEngine.getSettings());
    });
    return unsub;
  }, []);

  const toggleMute = useCallback(() => {
    AudioEngine.updateSettings({ muted: !settings.muted });
    // Unlock audio context on user gesture
    AudioEngine.unlock();
  }, [settings.muted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setTempVolume(v);
    AudioEngine.updateSettings({ volume: v, muted: v === 0 });
  }, []);

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => {
          setOpen(!open);
          setTempVolume(settings.volume);
        }}
        className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10"
        aria-label={settings.muted ? "Unmute audio" : "Mute audio"}
        title={settings.muted ? "Audio muted" : `Volume: ${Math.round(settings.volume * 100)}%`}
      >
        {settings.muted ? (
          <VolumeX size={15} className="text-red-400/60" />
        ) : (
          <Volume2 size={15} />
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Popover */}
          <div className="absolute top-full mt-2 right-0 z-50 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-xl px-4 py-3 shadow-lg w-[220px]">
            <div className="flex items-center gap-2 mb-2.5">
              <Music size={13} className="text-[var(--color-cyan)]" />
              <span className="text-[11px] font-bold text-[var(--text-primary)]">Sound Effects</span>
              <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded ${
                settings.muted
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                {settings.muted ? "Muted" : `${Math.round(settings.volume * 100)}%`}
              </span>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={toggleMute}
                className="p-1 rounded hover:bg-white/5 transition cursor-pointer"
              >
                {settings.muted ? (
                  <VolumeX size={13} className="text-red-400/60" />
                ) : (
                  <Volume2 size={13} className="text-[var(--color-cyan)]" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={tempVolume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 appearance-none rounded-full bg-[var(--border-glass)] accent-[var(--color-cyan)] cursor-pointer"
              />
            </div>

            {/* Sound cues legend */}
            <div className="border-t border-[var(--border-glass)] pt-2 space-y-1">
              <span className="text-[8px] font-mono text-[var(--text-tertiary)] block mb-1">Sound Cues:</span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {[
                  { label: "Gavel", action: "🔨 Debate" },
                  { label: "Alarm", action: "🚨 Threat" },
                  { label: "Shield", action: "🛡️ Defense" },
                  { label: "Chime", action: "🏆 Achievement" },
                  { label: "Combo", action: "🔥 Streak" },
                  { label: "Data Tx", action: "📡 Action" },
                ].map((cue) => (
                  <button
                    key={cue.label}
                    className="flex items-center gap-1.5 text-[8px] font-mono text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition cursor-pointer px-1 py-0.5 rounded hover:bg-[var(--hover-bg)]"
                    onClick={() => {
                      AudioEngine.unlock();
                      switch (cue.label) {
                        case "Gavel": AudioEngine.playGavel(); break;
                        case "Alarm": AudioEngine.playThreatAlarm(); break;
                        case "Shield": AudioEngine.playShieldBlock(); break;
                        case "Chime": AudioEngine.playAchievement(); break;
                        case "Combo": AudioEngine.playComboStreak(2); break;
                        case "Data Tx": AudioEngine.playDataTx(); break;
                      }
                    }}
                  >
                    <span>{cue.action}</span>
                    <span className="text-[var(--text-muted)]">Preview</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
