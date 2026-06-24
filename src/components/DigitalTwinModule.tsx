"use client";

import React, { useState, useRef } from "react";
import { type TwinNode, type FilterType, defaultNodes } from "./digitaltwin/digitalTwinData";
import DigitalTwinCanvas from "./digitaltwin/DigitalTwinCanvas";
import DigitalTwinFilterBar from "./digitaltwin/DigitalTwinFilterBar";
import DigitalTwinNodeDetails from "./digitaltwin/DigitalTwinNodeDetails";
import DigitalTwinActions from "./digitaltwin/DigitalTwinActions";

export default function DigitalTwinModule() {
  const [selectedNode, setSelectedNode] = useState<TwinNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TwinNode | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [nodes, setNodes] = useState<TwinNode[]>(defaultNodes);
  const [isProcessing, setIsProcessing] = useState(false);

  const angleYRef = useRef(0);
  const angleXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);

  // Interactive Operations
  const triggerRecycle = (nodeId: string) => {
    setIsProcessing(true);
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: "RISK", health: "Recycling..." } : n));
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, status: "RISK", health: "Recycling..." } : null);
    }

    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: "NOMINAL", health: "100%" } : n));
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(prev => prev ? { ...prev, status: "NOMINAL", health: "100%" } : null);
      }
      setIsProcessing(false);
    }, 2500);
  };

  const triggerChaosMonkey = (nodeId: string) => {
    setIsProcessing(true);
    const isCritical = nodes.find(n => n.id === nodeId)?.status === "CRITICAL";
    const targetStatus = isCritical ? "NOMINAL" : "CRITICAL";
    const targetHealth = isCritical ? "98%" : "0% OUTAGE";

    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: targetStatus, health: targetHealth } : n));
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, status: targetStatus, health: targetHealth } : null);
    }
    setIsProcessing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 h-[485px] animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* 3D Codebase Twin Visualizer */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3 border-b border-white/5 pb-2">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase select-none">
              3D Codebase & Deployment Twin
            </h3>
            <p className="text-[10px] text-white/40 mt-0.5">
              Interactive topology mapping repositories, services, deployments, and security vectors.
            </p>
          </div>
          <DigitalTwinFilterBar filterType={filterType} onFilterChange={setFilterType} />
        </div>

        <DigitalTwinCanvas
          nodes={nodes}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
          filterType={filterType}
          angleYRef={angleYRef}
          angleXRef={angleXRef}
          isDraggingRef={isDraggingRef}
          startMouseRef={startMouseRef}
          dragDistanceRef={dragDistanceRef}
        />
      </div>

      {/* Details Side Panel */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-y-auto justify-between">
        <DigitalTwinNodeDetails selectedNode={selectedNode} />

        <DigitalTwinActions
          selectedNode={selectedNode}
          isProcessing={isProcessing}
          onRecycle={triggerRecycle}
          onChaosMonkey={triggerChaosMonkey}
        />
      </div>

    </div>
  );
}
