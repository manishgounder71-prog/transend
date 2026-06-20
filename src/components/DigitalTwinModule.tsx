"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface TwinNode {
  id: string;
  name: string;
  type: "ROOT" | "SERVICE" | "REPOSITORY" | "INFRASTRUCTURE" | "AGENT";
  status: "NOMINAL" | "RISK" | "CRITICAL";
  x3d: number;
  y3d: number;
  z3d: number;
  loc: string;
  pods: string;
  health: string;
  author: string;
  linkTo?: string;
  
  // Projected 2D parameters
  x2d?: number;
  y2d?: number;
  radius?: number;
  depthZ?: number;
}

export default function DigitalTwinModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<TwinNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TwinNode | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "SERVICE" | "REPOSITORY" | "INFRASTRUCTURE" | "AGENT">("ALL");
  const [nodes, setNodes] = useState<TwinNode[]>([
    { id: "root", name: "Orbit Engine Hub", type: "ROOT", status: "NOMINAL", x3d: 0, y3d: 0, z3d: 0, loc: "520k lines", pods: "12 Pods", health: "98.4%", author: "System Architect" },
    { id: "auth", name: "auth-service-v3", type: "SERVICE", status: "RISK", x3d: -80, y3d: -40, z3d: 40, loc: "45k lines", pods: "3 Pods", health: "78%", author: "Arianna Haradon", linkTo: "root" },
    { id: "gateway", name: "gateway-k8s-pod", type: "INFRASTRUCTURE", status: "CRITICAL", x3d: 60, y3d: 60, z3d: -60, loc: "YAML Configs", pods: "8 Pods", health: "64%", author: "DevOps Lead", linkTo: "root" },
    { id: "payments", name: "payment_gateway.py", type: "REPOSITORY", status: "NOMINAL", x3d: 90, y3d: -60, z3d: 20, loc: "18k lines", pods: "4 Pods", health: "92%", author: "Lee Tickett", linkTo: "root" },
    { id: "billing", name: "billing-sync-db", type: "INFRASTRUCTURE", status: "NOMINAL", x3d: -70, y3d: 70, z3d: -30, loc: "PostgreSQL Replica", pods: "1 Master", health: "95%", author: "Raimund Hook", linkTo: "root" },
    { id: "helpers", name: "clean_string_util", type: "REPOSITORY", status: "NOMINAL", x3d: 0, y3d: -95, z3d: -70, loc: "1.2k lines", pods: "Local Library", health: "100%", author: "Mattias Michaux", linkTo: "root" },
    { id: "orb_ciso", name: "ciso-security-agent", type: "AGENT", status: "NOMINAL", x3d: -110, y3d: 0, z3d: -40, loc: "Security Guardian", pods: "Agent Core", health: "100%", author: "System Shield", linkTo: "root" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const angleYRef = useRef(0);
  const angleXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const FOV = 300;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;

    const resize = () => {
      const wrapper = canvas.parentElement;
      if (wrapper) {
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Rotate Y automatically if not dragging
      if (!isDraggingRef.current) {
        angleYRef.current += 0.003;
      }

      const cosY = Math.cos(angleYRef.current);
      const sinY = Math.sin(angleYRef.current);
      const cosX = Math.cos(angleXRef.current);
      const sinX = Math.sin(angleXRef.current);

      // Project nodes coordinates (filter visible nodes)
      nodes.forEach(node => {
        // Y rotate
        const x1 = node.x3d * cosY - node.z3d * sinY;
        const z1 = node.x3d * sinY + node.z3d * cosY;

        // X rotate
        const y1 = node.y3d * cosX - z1 * sinX;
        const z2 = node.y3d * sinX + z1 * cosX;

        const scale = FOV / (FOV + z2);
        node.x2d = centerX + x1 * scale;
        node.y2d = centerY + y1 * scale;
        node.radius = Math.max(4, 8 * scale);
        node.depthZ = z2;
      });

      // Filter nodes based on active selection
      const visibleNodes = nodes.filter(n => filterType === "ALL" || n.type === filterType || n.type === "ROOT");

      // Connection lines
      ctx.lineWidth = 1;
      visibleNodes.forEach(node => {
        if (node.linkTo) {
          const parent = visibleNodes.find(p => p.id === node.linkTo);
          if (parent && parent.x2d && parent.y2d && node.x2d && node.y2d) {
            // Styling lines dynamically based on node health state
            if (node.status === "CRITICAL" || parent.status === "CRITICAL") {
              ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
              ctx.setLineDash([2, 2]);
            } else if (node.status === "RISK" || parent.status === "RISK") {
              ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
              ctx.setLineDash([4, 4]);
            } else {
              ctx.strokeStyle = "rgba(0, 240, 255, 0.18)";
              ctx.setLineDash([]);
            }
            ctx.beginPath();
            ctx.moveTo(node.x2d, node.y2d);
            ctx.lineTo(parent.x2d, parent.y2d);
            ctx.stroke();
          }
        }
      });
      ctx.setLineDash([]); // Reset line dash

      // Sort nodes by depth for Z buffering rendering
      const sortedNodes = [...visibleNodes].sort((a, b) => (b.depthZ || 0) - (a.depthZ || 0));

      // Draw nodes
      sortedNodes.forEach(node => {
        if (!node.x2d || !node.y2d || !node.radius) return;

        let color = "var(--color-blue)";
        if (node.status === "RISK") color = "var(--color-warning)";
        if (node.status === "CRITICAL") color = "var(--color-critical)";
        if (node.type === "AGENT") color = "var(--color-purple)";
        if (node.type === "ROOT") color = "var(--color-cyan)";

        // Hover circle ring
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        if (isHovered) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, node.radius + 6, 0, Math.PI * 2);
          ctx.globalAlpha = 0.15;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Selected outer ring
        const isSelected = selectedNode && selectedNode.id === node.id;
        if (isSelected) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, node.radius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Circle body
        ctx.fillStyle = "#050816";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Indicator core inside agent/root
        if (node.type === "AGENT" || node.type === "ROOT" || node.status === "CRITICAL") {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, node.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw text label
        const depthScale = FOV / (FOV + (node.depthZ || 0));
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = `${Math.max(8, 10 * depthScale)}px var(--font-sans)`;
        ctx.textAlign = "center";
        ctx.fillText(node.name, node.x2d, node.y2d - node.radius - 6);
      });

      animFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameId);
    };
  }, [hoveredNode, selectedNode, filterType, nodes]);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = e.clientX - startMouseRef.current.x;
      const dy = e.clientY - startMouseRef.current.y;
      angleYRef.current += dx * 0.005;
      angleXRef.current += dy * 0.005;
      startMouseRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Hover detection
      let found: TwinNode | null = null;
      const visibleNodes = nodes.filter(n => filterType === "ALL" || n.type === filterType || n.type === "ROOT");
      for (const node of visibleNodes) {
        if (node.x2d && node.y2d && node.radius) {
          const dist = Math.hypot(mouseX - node.x2d, mouseY - node.y2d);
          if (dist < node.radius + 4) {
            found = node;
            break;
          }
        }
      }
      setHoveredNode(found);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    startMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const visibleNodes = nodes.filter(n => filterType === "ALL" || n.type === filterType || n.type === "ROOT");
    for (const node of visibleNodes) {
      if (node.x2d && node.y2d && node.radius) {
        const dist = Math.hypot(mouseX - node.x2d, mouseY - node.y2d);
        if (dist < node.radius + 4) {
          setSelectedNode(node);
          return;
        }
      }
    }
  };

  // Node details text colors helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOMINAL": return "text-[#10b981]";
      case "RISK": return "text-[#f59e0b]";
      case "CRITICAL": return "text-[#ef4444]";
      default: return "text-white";
    }
  };

  // Interactive Operations
  const triggerRecycle = (nodeId: string) => {
    setIsProcessing(true);
    // Find node and update its status temporarily to simulate reload
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
          {/* Filters Row */}
          <div className="flex bg-black/45 border border-white/10 rounded-lg p-0.5 gap-0.5">
            {(["ALL", "SERVICE", "REPOSITORY", "INFRASTRUCTURE", "AGENT"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`font-mono text-[9px] font-bold px-2 py-1 rounded cursor-pointer transition ${
                  filterType === tab 
                    ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20" 
                    : "text-white/45 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab === "REPOSITORY" ? "REPOS" : tab === "INFRASTRUCTURE" ? "INFRA" : tab === "ALL" ? "ALL" : `${tab}S`}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 bg-black/25 border border-white/5 rounded-lg relative overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-4 font-mono text-[9px] text-white/35 pointer-events-none select-none">
            <span>← Drag to Rotate →</span>
            <span>• Zoom (Scroll) •</span>
            <span>• Hover to Inspect •</span>
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-y-auto justify-between">
        <div className="flex flex-col gap-4">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase truncate max-w-[180px]">
              {selectedNode ? selectedNode.name : "System Topology Map"}
            </h3>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/25 text-[#a855f7] uppercase tracking-wide">
              {selectedNode ? selectedNode.type : "ROOT"}
            </span>
          </div>

          {selectedNode ? (
            <div className="flex flex-col gap-4 text-xs">
              <p className="text-white/60 leading-relaxed">
                Real-time telemetry and SDLC structural mapping for <strong>{selectedNode.name}</strong>.
              </p>
              <div className="flex flex-col gap-2.5 font-mono">
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">Node Class:</span>
                  <span className="font-semibold text-[#00f0ff]">{selectedNode.type}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">Code Volume:</span>
                  <span className="font-semibold text-[#a855f7]">{selectedNode.loc}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">Deployment Status:</span>
                  <span className={`font-bold ${getStatusColor(selectedNode.status)}`}>
                    {selectedNode.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">Connected Pods:</span>
                  <span className="font-semibold text-[#00f0ff]">{selectedNode.pods}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">API Health:</span>
                  <span className="font-semibold text-[#10b981]">{selectedNode.health}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">Git Owner:</span>
                  <span className="font-semibold text-[#a855f7]">@{selectedNode.author.replace(" ", "")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-xs">
              <p className="text-white/40 leading-relaxed">
                Select any node in the digital twin graph to view real-time health data, ownership mapping, dependency paths, and associated AI agent processes.
              </p>
              <div className="flex flex-col gap-2.5 font-mono">
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">Total Repos:</span>
                  <span className="font-semibold text-[#00f0ff]">14</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">Microservices:</span>
                  <span className="font-semibold text-[#a855f7]">28</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">Active Pods:</span>
                  <span className="font-semibold text-[#10b981]">124</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/40">Debt Score:</span>
                  <span className="font-semibold text-[#f59e0b]">Medium</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Action deck inside details side panel */}
        {selectedNode && selectedNode.id !== "root" && (
          <div className="flex flex-col gap-2 border-t border-white/10 pt-4 mt-4">
            <button
              disabled={isProcessing}
              onClick={() => triggerRecycle(selectedNode.id)}
              className="w-full flex items-center justify-center gap-2 font-sans font-bold text-[10px] text-slate-950 bg-[#00f0ff] hover:bg-[#00f0ff]/80 transition rounded py-2 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed"
            >
              <RefreshCw size={11} className={isProcessing ? "animate-spin" : ""} />
              Recycle Kubernetes Pods
            </button>
            <button
              disabled={isProcessing}
              onClick={() => triggerChaosMonkey(selectedNode.id)}
              className={`w-full flex items-center justify-center gap-2 font-sans font-bold text-[10px] border transition rounded py-2 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed ${
                selectedNode.status === "CRITICAL"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              }`}
            >
              <AlertTriangle size={11} />
              {selectedNode.status === "CRITICAL" ? "Resolve Outage State" : "Simulate Outage Event"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
