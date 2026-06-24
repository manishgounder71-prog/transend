"use client";

import React, { useState, useEffect, useRef } from "react";

interface LandingScreenProps {
  onLaunch: () => void;
}

const TYPING_WORDS = ["Predict Risks", "Orchestrate Agents", "Secure Deployments", "Analyze Incidents", "Ship Confidently"];

export default function LandingScreen({ onLaunch }: LandingScreenProps) {
  const [typingIdx, setTypingIdx] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [typingDir, setTypingDir] = useState<"forward" | "backward">("forward");
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speed: number; delay: number }>>([]);

  // Generate floating particles
  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.3 + 0.1,
        delay: Math.random() * 5,
      })),
    );
  }, []);

  // Typing animation
  useEffect(() => {
    const word = TYPING_WORDS[typingIdx];
    const timeout = setTimeout(
      () => {
        if (typingDir === "forward") {
          if (typingText.length < word.length) {
            setTypingText(word.slice(0, typingText.length + 1));
          } else {
            setTimeout(() => setTypingDir("backward"), 1500);
          }
        } else {
          if (typingText.length > 0) {
            setTypingText(word.slice(0, typingText.length - 1));
          } else {
            setTypingIdx((prev) => (prev + 1) % TYPING_WORDS.length);
            setTypingDir("forward");
          }
        }
      },
      typingDir === "forward" ? 70 : 30,
    );
    return () => clearTimeout(timeout);
  }, [typingText, typingIdx, typingDir]);

  return (
    <div
      id="landing-screen"
      className="absolute inset-0 z-50 flex items-center justify-center bg-radial from-[#0b1220]/95 to-[#050816]/99 transition-all duration-[750ms] ease-out overflow-hidden"
    >
      {/* Floating Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: i % 3 === 0 ? "#00f0ff" : i % 3 === 1 ? "#a855f7" : "#0072ff",
            opacity: 0.15 + Math.random() * 0.2,
            animation: `float-particle ${5 + p.speed * 5}s ${p.delay}s infinite alternate ease-in-out`,
            boxShadow: `0 0 ${p.size * 3}px ${i % 3 === 0 ? "rgba(0,240,255,0.15)" : i % 3 === 1 ? "rgba(168,85,247,0.15)" : "rgba(0,114,255,0.15)"}`,
          }}
        />
      ))}

      {/* Orbital Ring Decoration */}
      <div className="absolute w-[85%] h-[85%] border border-[#00f0ff]/5 rounded-2xl pointer-events-none">
        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[130px] h-2.5 bg-[#00f0ff]/30" style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }} />
        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[90px] h-1.5 bg-[#a855f7]/20" style={{ clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0% 100%)" }} />
      </div>

      {/* Scanning line animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute w-full h-[1px] bg-white animate-scan-line" style={{ animation: "scan-line 4s linear infinite" }} />
      </div>

      <div className="text-center max-w-[750px] px-6 z-10 flex flex-col items-center">
        {/* Boot sequence badge */}
        <span className="font-mono text-[9px] font-bold text-[#00f0ff] tracking-[0.25em] mb-4 uppercase animate-pulse">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f0ff] mr-2 align-middle" />
          SECURE BOOT // SYSTEM OPERATIONAL
        </span>

        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6 select-none bg-gradient-to-r from-white via-white to-purple-400 bg-clip-text text-transparent">
          ORBIT<span className="bg-gradient-to-r from-[#00f0ff] to-[#0072ff] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">CTO</span>X
        </h1>

        {/* Subtitle with typing effect */}
        <h2 className="text-lg md:text-xl font-medium text-slate-200 mb-4 max-w-[620px] leading-snug">
          The Autonomous Operating System For Software Companies
        </h2>

        {/* Typing animation */}
        <div className="h-8 flex items-center justify-center mb-8">
          <span className="text-sm md:text-base text-[#00f0ff] font-mono">
            {typingText}
            <span className="inline-block w-[2px] h-4 bg-[#00f0ff] ml-0.5 animate-pulse align-middle" />
          </span>
        </div>

        {/* Feature tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["Mission Control", "AI Boardroom", "Digital Twin", "Doom Predictor"].map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-mono px-2 py-1 rounded-full border border-white/5 bg-white/[0.02] text-white/30"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-4 mb-12">
          <button
            onClick={onLaunch}
            className="group font-sans text-xs md:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-[#0072ff] rounded-full px-8 py-3.5 cursor-pointer shadow-[0_4px_30px_rgba(0,240,255,0.4)] hover:shadow-[0_6px_40px_rgba(0,240,255,0.7)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2.5 active:scale-95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
            Launch Mission Control
            <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          <button
            onClick={onLaunch}
            className="font-sans text-xs md:text-sm font-semibold text-white bg-white/3 border border-white/10 rounded-full px-8 py-3.5 cursor-pointer hover:bg-white/8 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
          >
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Watch Live Demo
            </span>
          </button>
        </div>

        {/* Status bar */}
        <div className="flex gap-8 border-t border-white/5 pt-8 w-full justify-center">
          {[
            { label: "AGENTS", value: "7/7 ACTIVE", color: "text-purple-400" },
            { label: "HEALTH", value: "98.4% NOMINAL", color: "text-[#10b981]" },
            { label: "UPTIME", value: "99.97%", color: "text-[#00f0ff]" },
            { label: "SYS-LOG", value: "READY", color: "text-[#00f0ff]" },
          ].map((stat) => (
            <div key={stat.label} className="font-mono text-[9px] text-center">
              <span className="text-white/20 block mb-0.5">{stat.label}</span>
              <span className={`font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
