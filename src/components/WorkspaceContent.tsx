"use client";

import React, { type Dispatch, type SetStateAction } from "react";
import type { TabId } from "@/lib/types";
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
import KnowledgeBaseSearch from "@/components/KnowledgeBaseSearch";
import GamificationPanel from "@/components/GamificationPanel";

interface WorkspaceContentProps {
  activeTab: TabId;
  boardroomTrigger: number;
  onSimulate: () => void;
  onTabChange: Dispatch<SetStateAction<TabId>>;
}

export default function WorkspaceContent({
  activeTab,
  boardroomTrigger,
  onSimulate,
  onTabChange,
}: WorkspaceContentProps) {
  return (
    <div className="col-start-2 h-full overflow-y-auto p-6 relative">
      {activeTab === "dashboard" && <DashboardModule setActiveTab={onTabChange} />}
      {activeTab === "digitaltwin" && <DigitalTwinModule />}
      {activeTab === "parallel" && <ParallelSimulator onSimulate={onSimulate} />}
      {activeTab === "boardroom" && <BoardroomModule triggerSignal={boardroomTrigger} />}
      {activeTab === "predictor" && <ReleasePredictor />}
      {activeTab === "pipeline" && <SelfHealingPipeline />}
      {activeTab === "hacker" && <HackerArenaModule />}
      {activeTab === "incidents" && <IncidentCommander />}
      {activeTab === "timemachine" && <TimeMachine />}
      {activeTab === "gitlab" && <GitLabConnector />}
      {activeTab === "knowledge" && <KnowledgeBaseSearch />}
      {activeTab === "achievements" && <GamificationPanel />}
    </div>
  );
}
