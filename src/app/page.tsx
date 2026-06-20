"use client";

import React, { useState } from "react";
import ParticleSpace from "@/components/ParticleSpace";
import VoiceCTOOrb from "@/components/VoiceCTOOrb";
import ActivityStream from "@/components/ActivityStream";
import DashboardModule from "@/components/DashboardModule";
import DigitalTwinModule from "@/components/DigitalTwinModule";
import ParallelSimulator from "@/components/ParallelSimulator";
import BoardroomModule from "@/components/BoardroomModule";
import ReleasePredictor from "@/components/ReleasePredictor";
import HackerArenaModule from "@/components/HackerArenaModule";
import IncidentCommander from "@/components/IncidentCommander";
import TimeMachine from "@/components/TimeMachine";
import SelfHealingPipeline from "@/components/SelfHealingPipeline";
import GitLabConnector from "@/components/GitLabConnector";

import { 
  LayoutDashboard, 
  Share2, 
  GitBranch, 
  ShieldAlert, 
  Users, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Search,
  RefreshCw,
  Link2
} from "lucide-react";



type TabId = "dashboard" | "digitaltwin" | "parallel" | "boardroom" | "predictor" | "hacker" | "incidents" | "timemachine" | "pipeline" | "gitlab";

export default function Home() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<TabId>("gitlab");
  const [boardroomTrigger, setBoardroomTrigger] = useState(0);

  const handleLaunch = () => {
    // Spacer launch animation sequence
    const landing = document.getElementById("landing-screen");
    if (landing) {
      landing.classList.add("opacity-0", "scale-105");
      setTimeout(() => {
        setView("dashboard");
      }, 700);
    } else {
      setView("dashboard");
    }
  };

  const handleSimulateUniverse = () => {
    // Reset/Trigger debate sequence in Boardroom tab
    setBoardroomTrigger(prev => prev + 1);
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-[#050816]">
      {/* Dynamic Background Particle Space */}
      <ParticleSpace />
      
      {/* Background glow layers */}
      <div className="glow-bubble bubble-purple" />
      <div className="glow-bubble bubble-blue" />

      {/* 1. CINEMATIC LANDING SCREEN */}
      {view === "landing" && (
        <div 
          id="landing-screen"
          className="absolute inset-0 z-50 flex items-center justify-center bg-radial from-[#0b1220]/95 to-[#050816]/99 transition-all duration-[750ms] ease-out"
        >
          <div className="absolute w-[85%] h-[85%] border border-[#00f0ff]/5 rounded-2xl pointer-events-none after:content-[''] after:absolute after:top-[-5px] after:left-1/2 after:-translate-x-1/2 after:w-[130px] after:h-2.5 after:bg-[#00f0ff]/30 after:[clip-path:polygon(0_0,100%_0,80%_100%,20%_100%)]" />
          
          <div className="text-center max-w-[750px] px-6 z-10 flex flex-col items-center">
            <span className="font-mono text-[9px] font-bold text-[#00f0ff] tracking-[0.25em] mb-4 uppercase text-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              SECURE BOOT // SYSTEM OPERATIONAL
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6 select-none bg-gradient-to-r from-white via-white to-purple-400 bg-clip-text text-transparent filter drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              ORBIT<span className="bg-gradient-to-r from-[#00f0ff] to-[#0072ff] bg-clip-text text-transparent">CTO</span>X
            </h1>
            <h2 className="text-lg md:text-xl font-medium text-slate-200 mb-6 max-w-[620px] leading-snug">
              The Autonomous Operating System For Software Companies
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-10 max-w-[560px]">
              Manage projects, predict risks, orchestrate AI agents, secure deployments, and run your entire engineering organization from one command center.
            </p>
            
            <div className="flex gap-4 mb-12">
              <button 
                onClick={handleLaunch}
                className="font-sans text-xs md:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-[#0072ff] rounded-full px-8 py-3.5 cursor-pointer shadow-[0_4px_30px_rgba(0,240,255,0.4)] hover:shadow-[0_6px_36px_rgba(0,240,255,0.6)] hover:-translate-y-0.5 transition flex items-center gap-2.5 active:translate-y-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                Launch Mission Control
              </button>
              <button 
                onClick={handleLaunch}
                className="font-sans text-xs md:text-sm font-semibold text-white bg-white/3 border border-white/10 rounded-full px-8 py-3.5 cursor-pointer hover:bg-white/8 hover:border-white/20 transition"
              >
                Watch Live Demo
              </button>
            </div>
            
            <div className="flex gap-10 border-t border-white/5 pt-8 w-full justify-center">
              <div className="font-mono text-[9px]"><span className="text-white/40">AGENTS:</span> <span className="font-bold text-purple-400">ACTIVE (7/7)</span></div>
              <div className="font-mono text-[9px]"><span className="text-white/40">HEALTH:</span> <span className="font-bold text-[#10b981] pulse-emerald">98.4% NOMINAL</span></div>
              <div className="font-mono text-[9px]"><span className="text-white/40">SYS-LOG:</span> <span className="font-bold text-[#00f0ff]">READY</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 2. COMMAND CONTROL APP DASHBOARD VIEW */}
      {view === "dashboard" && (
        <div className="h-screen w-screen grid grid-rows-[65px_1fr_120px] select-none">
          
          {/* TOP COMMAND BAR */}
          <header className="row-start-1 bg-[#050816]/65 border-b border-white/5 px-6 flex items-center justify-between backdrop-blur-[25px] relative z-20">
            <div className="flex items-center">
              <span className="font-sans font-black text-[17px] tracking-tight bg-gradient-to-r from-[#00f0ff] to-[#a855f7] bg-clip-text text-transparent filter drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]">
                ORBIT CTO X
              </span>
              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[#00f0ff] ml-3.5 tracking-wider uppercase">
                COMMAND CENTER
              </span>
            </div>

            {/* Global Search */}
            <div className="hidden md:flex items-center gap-2 bg-black/35 border border-white/5 rounded-lg px-3 py-1.5 w-[300px] text-white/40">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Query codebase, agents, or pipeline logs..."
                className="bg-transparent border-none outline-none text-[11px] text-white w-full placeholder-white/25"
              />
            </div>

            {/* Top Indicator badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] pulse-emerald" />
                <div className="text-[10px]">
                  <span className="text-white/40 block font-semibold leading-none mb-0.5">SYSTEM HEALTH</span>
                  <span className="font-bold text-[#10b981]">98.4% NOMINAL</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] pulse-cyan" />
                <div className="text-[10px]">
                  <span className="text-white/40 block font-semibold leading-none mb-0.5">GITLAB ORBIT</span>
                  <span className="font-bold text-[#00f0ff]">CONNECTED</span>
                </div>
              </div>
            </div>

            {/* Bio info */}
            <div className="flex items-center gap-2.5 pl-6 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a855f7] to-[#0072ff] flex items-center justify-center font-bold text-sm shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                X
              </div>
              <div className="text-[10px]">
                <span className="font-bold block">CTO Command</span>
                <span className="text-white/40 block">Executive Level</span>
              </div>
            </div>
          </header>

          <div className="row-start-2 grid grid-cols-[200px_1fr] h-full overflow-hidden">
            {/* LEFT SIDEBAR NAVIGATION */}
            <aside className="col-start-1 border-r border-white/5 bg-[#050816]/35 backdrop-blur-[15px] p-5">
              <nav className="flex flex-col gap-1">
                
                <button 
                  onClick={() => setActiveTab("gitlab")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "gitlab" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <Link2 size={14} />
                  <span>GitLab Integrator</span>
                </button>

                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "dashboard" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <LayoutDashboard size={14} />
                  <span>Mission Control</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("digitaltwin")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "digitaltwin" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <Share2 size={14} />
                  <span>Digital Twin</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("parallel")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "parallel" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <GitBranch size={14} />
                  <span>Parallel Universe</span>
                </button>

                <button 
                  onClick={() => setActiveTab("boardroom")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "boardroom" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <Users size={14} />
                  <span>AI Boardroom</span>
                </button>

                <button 
                  onClick={() => setActiveTab("predictor")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "predictor" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <Activity size={14} />
                  <span>Doom Predictor</span>
                </button>

                <button 
                  onClick={() => setActiveTab("pipeline")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "pipeline" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <RefreshCw size={14} />
                  <span>Self-Healing CI</span>
                </button>


                <button 
                  onClick={() => setActiveTab("hacker")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "hacker" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <ShieldCheck size={14} />
                  <span>Security Arena</span>
                </button>

                <button 
                  onClick={() => setActiveTab("incidents")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "incidents" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <ShieldAlert size={14} />
                  <span>Incidents</span>
                </button>

                <button 
                  onClick={() => setActiveTab("timemachine")}
                  className={`w-full font-medium text-xs rounded-lg px-3.5 py-2.5 flex items-center gap-3 transition ${
                    activeTab === "timemachine" 
                      ? "bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                      : "text-white/50 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  <Clock size={14} />
                  <span>Time Machine</span>
                </button>

              </nav>
            </aside>

            {/* MAIN WORKSPACE CONTENT WINDOW */}
            <div className="col-start-2 h-full overflow-y-auto p-6 relative">
              {activeTab === "dashboard" && <DashboardModule setActiveTab={setActiveTab} />}
              {activeTab === "digitaltwin" && <DigitalTwinModule />}
              {activeTab === "parallel" && <ParallelSimulator onSimulate={handleSimulateUniverse} />}
              {activeTab === "boardroom" && <BoardroomModule triggerSignal={boardroomTrigger} />}
              {activeTab === "predictor" && <ReleasePredictor />}
              {activeTab === "pipeline" && <SelfHealingPipeline />}
              {activeTab === "hacker" && <HackerArenaModule />}
              {activeTab === "incidents" && <IncidentCommander />}
              {activeTab === "timemachine" && <TimeMachine />}
              {activeTab === "gitlab" && <GitLabConnector />}
            </div>


          </div>

          {/* BOTTOM AGENT ACTIVITY STREAM */}
          <ActivityStream isLive={activeTab === "dashboard"} />

          {/* persistent Voice CTO floating orb */}
          <VoiceCTOOrb 
            setActiveTab={setActiveTab} 
            triggerBoardroom={() => setBoardroomTrigger(prev => prev + 1)}
          />

        </div>
      )}
    </div>
  );
}
