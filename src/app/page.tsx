"use client";

import React, { useState } from "react";
import type { TabId } from "@/lib/types";
import { ThemeProvider } from "@/lib/theme";
import ParticleSpace from "@/components/ParticleSpace";
import VoiceCTOOrb from "@/components/VoiceCTOOrb";
import ActivityStream from "@/components/ActivityStream";
import LandingScreen from "@/components/LandingScreen";
import CommandBar from "@/components/CommandBar";
import Sidebar from "@/components/Sidebar";
import WorkspaceContent from "@/components/WorkspaceContent";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<TabId>("gitlab");
  const [boardroomTrigger, setBoardroomTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLaunch = () => {
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
    setBoardroomTrigger((prev) => prev + 1);
  };

  return (
    <ThemeProvider>
      <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        <ParticleSpace />

        {/* Background glow layers */}
        <div className="glow-bubble bubble-purple" />
        <div className="glow-bubble bubble-blue" />

        {/* Cinematic Landing Screen */}
        {view === "landing" && <LandingScreen onLaunch={handleLaunch} />}

        {/* Command Control Dashboard */}
        {view === "dashboard" && (
          <div className="h-screen w-screen grid grid-rows-[65px_1fr_120px] select-none">
            <CommandBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onNavigate={setActiveTab} />

            <div className="row-start-2 grid grid-cols-[200px_1fr] h-full overflow-hidden">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} searchQuery={searchQuery} />
              <ErrorBoundary>
                <WorkspaceContent
                  activeTab={activeTab}
                  boardroomTrigger={boardroomTrigger}
                  onSimulate={handleSimulateUniverse}
                  onTabChange={setActiveTab}
                />
              </ErrorBoundary>
            </div>

            <ActivityStream isLive={activeTab === "dashboard"} />

            <VoiceCTOOrb
              setActiveTab={setActiveTab}
              triggerBoardroom={() => setBoardroomTrigger((prev) => prev + 1)}
            />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
