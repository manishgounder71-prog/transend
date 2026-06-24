"use client";

import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { Play, Shield, ShieldCheck, Sword, Zap, Skull, Target, Timer, Star, Flame } from "lucide-react";
import { dispatchGameEvent } from "@/lib/gamification";
import { AudioEngine } from "@/lib/audio";
import type { CyberLog, Difficulty } from "./hackerArena/hackerArenaData";
import {
  BATTLE_POOLS,
  DIFFICULTY_CONFIG,
  getSeverityColor,
  getScoreStyle,
  pickRounds,
} from "./hackerArena/hackerArenaData";

export default function HackerArenaModule() {
  const [logs, setLogs] = useState<CyberLog[]>([
    { time: new Date().toLocaleTimeString(), threat: "Intrusion system active. Scanning threat vectors...", shield: "Blue Team shield active. Scanning replication config maps...", level: "INFO" }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [securityScore, setSecurityScore] = useState(98);
  const [threatSeverity, setThreatSeverity] = useState("NOMINAL");
  const [progress, setProgress] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [challengeActive, setChallengeActive] = useState(false);

  const redRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (redRef.current) redRef.current.scrollTop = redRef.current.scrollHeight;
    if (blueRef.current) blueRef.current.scrollTop = blueRef.current.scrollHeight;
  }, [logs]);

  // Timer countdown
  useEffect(() => {
    if (!challengeActive || timeRemaining <= 0) return;
    const t = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setChallengeActive(false);
          setIsSimulating(false);
          if (totalPoints > highScore) setHighScore(totalPoints);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [challengeActive, timeRemaining, totalPoints, highScore]);

  const startCyberWar = useCallback(() => {
    if (isSimulating) return;
    AudioEngine.unlock();
    AudioEngine.playDataTx(); // Battle initiation sound
    setIsSimulating(true);
    setChallengeActive(true);
    setLogs([]);
    setProgress(0);
    setStreak(0);
    setComboMultiplier(1);

    const config = DIFFICULTY_CONFIG[difficulty];
    const battleRounds = pickRounds(difficulty);
    setTimeRemaining(config.rounds * 3 + 5); // 3 sec per round + 5 sec buffer
    setTotalPoints(0);

    let prevMultiplier = 1;
    let step = 0;
    const interval = setInterval(() => {
      if (step < battleRounds.length) {
        const item = battleRounds[step];
        const time = new Date().toLocaleTimeString();
        
        setLogs(prev => [
          ...prev, 
          { time, threat: item.threat, shield: item.shield, level: item.level as "INFO" | "WARN" | "CRITICAL" | "RESOLVED" }
        ]);
        
        setSecurityScore(item.score);
        setThreatSeverity(item.severity);
        setProgress(Math.floor(((step + 1) / battleRounds.length) * 100));

        // Audio cues per round
        if (item.level === "CRITICAL" || item.severity === "HIGH" || item.severity === "CRITICAL") {
          AudioEngine.playThreatAlarm();
        } else if (item.level === "RESOLVED") {
          AudioEngine.playShieldBlock();
        }

        // Streak & score
        setStreak(prev => prev + 1);
        const newStreak = step + 1;
        const streakMult = Math.min(3, 1 + Math.floor(newStreak / 2));
        setComboMultiplier(streakMult);
        setTotalPoints(prev => prev + Math.round(item.score * streakMult * config.scoreBase / 100));

        // Combo audio cue when multiplier increases
        if (streakMult > prevMultiplier) {
          AudioEngine.playComboStreak(streakMult);
          prevMultiplier = streakMult;
        }
        
        step++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setChallengeActive(false);
        setTimeRemaining(0);
        dispatchGameEvent("hacker:battled");
        // Victory sound
        AudioEngine.playVictory();
        // Save high score
        setHighScore(prev => Math.max(prev, totalPoints));
      }
    }, config.interval);
  }, [isSimulating, difficulty, totalPoints]);


  return (
    <div className="flex flex-col gap-6 h-[530px] overflow-hidden justify-between animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* Simulation Command Center */}
      <div className="glass-panel p-5 select-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sword size={18} className="text-[#ef4444]" />
              {isSimulating && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ef4444] rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                AI Hacker Arena
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">
                Live cyber attack red-teaming vs Blue Team autonomous containment.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Difficulty selector */}
            <div className="flex items-center gap-1 bg-black/30 border border-white/5 rounded-lg px-2 py-1">
              {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => !isSimulating && setDifficulty(key)}
                  disabled={isSimulating}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer disabled:opacity-50 ${
                    difficulty === key
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/30 hover:text-white/60 border border-transparent"
                  }`}
                >
                  {key === "nightmare" ? <Skull size={10} className="inline mr-0.5" /> : null}
                  {cfg.label}
                </button>
              ))}
            </div>

            {/* Streak indicator */}
            {isSimulating && comboMultiplier > 1 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold font-mono animate-pulse">
                <Flame size={12} />
                <span>x{comboMultiplier} Streak</span>
              </div>
            )}

            {/* Security Score */}
            <div className={`flex items-center gap-2 border px-3 py-1 rounded text-xs font-mono font-bold ${getScoreStyle(securityScore)}`}>
              <ShieldCheck size={14} />
              <span>SCORE: {securityScore}</span>
            </div>
            
            {/* Threat Severity */}
            <div className="flex items-center gap-1.5 border border-white/5 bg-black/45 px-3 py-1 rounded text-xs font-mono">
              <span className="text-white/40 font-semibold">SEV:</span>
              <span className={`font-bold ${getSeverityColor(threatSeverity)}`}>{threatSeverity}</span>
            </div>

            {/* Timer */}
            {challengeActive && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono font-bold ${
                timeRemaining < 10 ? "text-[#ef4444] bg-red-500/10 border border-red-500/20 animate-pulse" : "text-[#00f0ff] bg-cyan-500/10 border border-cyan-500/20"
              }`}>
                <Timer size={11} />
                <span>{timeRemaining}s</span>
              </div>
            )}

            {/* Total points */}
            {isSimulating && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-mono font-bold">
                <Star size={11} />
                <span>{totalPoints} pts</span>
              </div>
            )}

            <button
              disabled={isSimulating}
              onClick={startCyberWar}
              className="font-sans text-[10px] font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-cyan-400 hover:from-[#00f0ff]/80 hover:to-cyan-400/80 transition rounded px-4 py-1.5 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-[0.98] shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
            >
              {isSimulating ? (
                <>
                  <Zap size={10} className="animate-pulse" />
                  Engaged...
                </>
              ) : (
                <>
                  <Play size={10} fill="currentColor" />
                  {difficulty === "nightmare" ? "Deploy Nightmare" : "Engage Battle"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {isSimulating && (
          <div className="mt-4">
            <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1 select-none">
              <span className="flex items-center gap-1">
                <Zap size={9} className="text-[#f59e0b]" />
                SIMULATING {difficulty.toUpperCase()} SCENARIO...
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Flame size={9} /> x{comboMultiplier}</span>
                <span>{progress}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-black/45 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-[#10b981] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* High score */}
        {highScore > 0 && !isSimulating && (
          <div className="mt-3 flex items-center gap-2 text-[9px] font-mono text-amber-400/60">
            <Target size={10} />
            <span>High Score: {highScore} pts</span>
          </div>
        )}
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
        
        {/* Red Team Attack Monitor */}
        <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3 select-none">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sword size={14} className="text-[#ef4444]" />
                {isSimulating && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
                )}
              </div>
              <h3 className="text-xs font-bold text-[#ef4444] tracking-wide uppercase">
                🔴 Red Team (Attack Vector)
              </h3>
            </div>
            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider select-none ${
              isSimulating 
                ? "bg-red-500/15 border border-red-500/30 text-[#ef4444] animate-pulse" 
                : "bg-white/5 border border-white/10 text-white/30"
            }`}>
              {isSimulating ? `${difficulty.toUpperCase()} IN PROGRESS` : "STANDBY"}
            </span>
          </div>
          
          <div 
            ref={redRef}
            className="flex-1 bg-black/35 border border-white/5 rounded-lg p-4 overflow-y-auto flex flex-col gap-2 font-mono text-[10.5px] text-red-400 select-text"
          >
            {logs.map((log, i) => (
              <p key={i} className="leading-relaxed hover:bg-red-500/5 rounded px-1 transition-colors">
                <span className="text-white/20 mr-1.5">[{log.time}]</span>
                <span className={log.level === "CRITICAL" ? "text-red-300 font-bold" : ""}>
                  [THREAT] {log.threat}
                </span>
              </p>
            ))}
            {logs.length === 0 && (
              <div className="text-white/20 text-center py-8 italic">Awaiting attack sequence...</div>
            )}
          </div>
        </div>

        {/* Blue Team Defense Shield */}
        <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3 select-none">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Shield size={14} className="text-[#10b981]" />
                {isSimulating && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                )}
              </div>
              <h3 className="text-xs font-bold text-[#10b981] tracking-wide uppercase">
                🔵 Blue Team (Shield Containment)
              </h3>
            </div>
            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider select-none ${
              isSimulating 
                ? "bg-emerald-500/15 border border-emerald-500/30 text-[#10b981] animate-pulse" 
                : "bg-white/5 border border-white/10 text-white/30"
            }`}>
              {isSimulating ? "SHIELD ACTIVE" : "NOMINAL"}
            </span>
          </div>

          <div 
            ref={blueRef}
            className="flex-1 bg-black/35 border border-white/5 rounded-lg p-4 overflow-y-auto flex flex-col gap-2 font-mono text-[10.5px] text-[#10b981] select-text"
          >
            {logs.map((log, i) => (
              <p key={i} className="leading-relaxed hover:bg-emerald-500/5 rounded px-1 transition-colors">
                <span className="text-white/20 mr-1.5">[{log.time}]</span>
                <span className={log.level === "CRITICAL" ? "text-red-400 font-bold" : log.level === "WARN" ? "text-amber-400 font-bold" : log.level === "RESOLVED" ? "text-emerald-400 font-medium" : "text-[#00f0ff]"}>
                  [SHIELD] {log.shield}
                </span>
              </p>
            ))}
            {logs.length === 0 && (
              <div className="text-white/20 text-center py-8 italic">Shield systems nominal...</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
