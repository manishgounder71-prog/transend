"use client";

import React, { useEffect, useRef, useCallback } from "react";
import type { TwinNode, FilterType } from "./digitalTwinData";
import { getNodeColor } from "./digitalTwinData";

interface DigitalTwinCanvasProps {
  nodes: TwinNode[];
  selectedNode: TwinNode | null;
  setSelectedNode: (node: TwinNode | null) => void;
  hoveredNode: TwinNode | null;
  setHoveredNode: (node: TwinNode | null) => void;
  filterType: FilterType;
  angleYRef: React.MutableRefObject<number>;
  angleXRef: React.MutableRefObject<number>;
  isDraggingRef: React.MutableRefObject<boolean>;
  startMouseRef: React.MutableRefObject<{ x: number; y: number }>;
  dragDistanceRef: React.MutableRefObject<number>;
}

const FOV = 300;

// Particle trail types
interface Particle {
  x: number;
  y: number;
  progress: number;
  speed: number;
  size: number;
  alpha: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
}

export default function DigitalTwinCanvas({
  nodes,
  selectedNode,
  setSelectedNode,
  hoveredNode,
  setHoveredNode,
  filterType,
  angleYRef,
  angleXRef,
  isDraggingRef,
  startMouseRef,
  dragDistanceRef,
}: DigitalTwinCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pulsePhaseRef = useRef(0);

  const getNodeAtPosition = useCallback((clientX: number, clientY: number): TwinNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const visibleNodes = nodes.filter((n) => filterType === "ALL" || n.type === filterType || n.type === "ROOT");
    for (const node of visibleNodes) {
      if (node.x2d && node.y2d && node.radius) {
        const dist = Math.hypot(px - node.x2d, py - node.y2d);
        if (dist < node.radius + 4) return node;
      }
    }
    return null;
  }, [nodes, filterType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let lastTime = 0;

    const resize = () => {
      const wrapper = canvas.parentElement;
      if (wrapper) {
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
      }
    };

    const draw = (time: number) => {
      const dt = lastTime ? (time - lastTime) / 1000 : 0.016;
      lastTime = time;
      pulsePhaseRef.current += dt * 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Auto-rotate
      if (!isDraggingRef.current) {
        angleYRef.current += 0.003;
      }

      const cosY = Math.cos(angleYRef.current);
      const sinY = Math.sin(angleYRef.current);
      const cosX = Math.cos(angleXRef.current);
      const sinX = Math.sin(angleXRef.current);

      // Project nodes
      nodes.forEach((node) => {
        const x1 = node.x3d * cosY - node.z3d * sinY;
        const z1 = node.x3d * sinY + node.z3d * cosY;
        const y1 = node.y3d * cosX - z1 * sinX;
        const z2 = node.y3d * sinX + z1 * cosX;
        const scale = FOV / (FOV + z2);
        node.x2d = centerX + x1 * scale;
        node.y2d = centerY + y1 * scale;
        node.radius = Math.max(4, 8 * scale);
        node.depthZ = z2;
      });

      const visibleNodes = nodes.filter((n) => filterType === "ALL" || n.type === filterType || n.type === "ROOT");

      // --- Draw connection lines with glow ---
      visibleNodes.forEach((node) => {
        if (!node.linkTo) return;
        const parent = visibleNodes.find((p) => p.id === node.linkTo);
        if (!parent || !parent.x2d || !parent.y2d || !node.x2d || !node.y2d) return;

        const isCritical = node.status === "CRITICAL" || parent.status === "CRITICAL";
        const isRisk = node.status === "RISK" || parent.status === "RISK";

        // Glow line underneath
        ctx.beginPath();
        ctx.moveTo(node.x2d, node.y2d);
        ctx.lineTo(parent.x2d, parent.y2d);
        ctx.strokeStyle = isCritical
          ? "rgba(239, 68, 68, 0.15)"
          : isRisk
            ? "rgba(245, 158, 11, 0.15)"
            : "rgba(0, 240, 255, 0.08)";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Main line
        ctx.beginPath();
        ctx.moveTo(node.x2d, node.y2d);
        ctx.lineTo(parent.x2d, parent.y2d);
        if (isCritical) {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
          ctx.setLineDash([3, 3]);
        } else if (isRisk) {
          ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
          ctx.setLineDash([4, 4]);
        } else {
          const pulse = 0.2 + 0.15 * Math.sin(pulsePhaseRef.current + (node.x3d || 0) * 0.1);
          ctx.strokeStyle = `rgba(0, 240, 255, ${pulse})`;
          ctx.setLineDash([]);
        }
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // --- Particle trails ---
        if (!isCritical && !isRisk && Math.random() < 0.02) {
          const color = getNodeColor(node);
          particlesRef.current.push({
            x: node.x2d,
            y: node.y2d,
            progress: 0,
            speed: 0.015 + Math.random() * 0.01,
            size: 1 + Math.random() * 1.5,
            alpha: 0.6 + Math.random() * 0.4,
            from: { x: node.x2d, y: node.y2d },
            to: { x: parent.x2d, y: parent.y2d },
            color,
          });
        }
      });

      // Update and draw particles
      ctx.save();
      particlesRef.current = particlesRef.current.filter((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) return false;
        p.x = p.from.x + (p.to.x - p.from.x) * p.progress;
        p.y = p.from.y + (p.to.y - p.from.y) * p.progress;
        const fadeAlpha = p.alpha * (1 - p.progress);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = fadeAlpha;
        ctx.fill();
        // Glow around particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = fadeAlpha * 0.2;
        ctx.fill();
        return true;
      });
      ctx.restore();

      // Draw nodes (sorted by depth)
      const sortedNodes = [...visibleNodes].sort((a, b) => (b.depthZ || 0) - (a.depthZ || 0));

      sortedNodes.forEach((node) => {
        if (!node.x2d || !node.y2d || !node.radius) return;

        const color = getNodeColor(node);
        const pulsePhase = pulsePhaseRef.current + (node.x3d || 0) * 0.3;

        // Hover glow
        const isHovered = hoveredNode?.id === node.id;
        if (isHovered) {
          const glowRadius = node.radius + 8 + 2 * Math.sin(pulsePhase);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, glowRadius, 0, Math.PI * 2);
          ctx.globalAlpha = 0.2;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Pulse glow (all nodes breathe)
        if (node.status === "NOMINAL" || node.status === "RISK") {
          const breatheRadius = node.radius + 4 + 1.5 * Math.sin(pulsePhase);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, breatheRadius, 0, Math.PI * 2);
          ctx.globalAlpha = 0.08;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Critical nodes pulse quickly
        if (node.status === "CRITICAL") {
          const alertPulse = node.radius + 4 + 4 * Math.sin(pulsePhaseRef.current * 4);
          ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, alertPulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outer ring glow
        if (isHovered || node.status === "CRITICAL") {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.3 + 0.2 * Math.sin(pulsePhase);
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, node.radius + 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Selection ring
        const isSelected = selectedNode?.id === node.id;
        if (isSelected) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, node.radius + 5, 0, Math.PI * 2);
          ctx.stroke();
          // Secondary glow ring
          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, node.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Node body (filled center)
        ctx.fillStyle = "#050816";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner dot for AGENT/ROOT/CRITICAL
        if (node.type === "AGENT" || node.type === "ROOT" || node.status === "CRITICAL") {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, node.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node label
        const depthScale = FOV / (FOV + (node.depthZ || 0));
        ctx.fillStyle = isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.85)";
        ctx.font = `bold ${Math.max(8, 10 * depthScale)}px var(--font-sans)`;
        ctx.textAlign = "center";
        ctx.fillText(node.name, node.x2d, node.y2d - node.radius - 6);
      });

      animFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    animFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameId);
    };
  }, [hoveredNode, selectedNode, filterType, nodes, angleYRef, angleXRef, isDraggingRef]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - startMouseRef.current.x;
      const dy = e.clientY - startMouseRef.current.y;
      dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
      angleYRef.current += dx * 0.005;
      angleXRef.current += dy * 0.005;
      startMouseRef.current = { x: e.clientX, y: e.clientY };
    } else {
      const found = getNodeAtPosition(e.clientX, e.clientY);
      setHoveredNode(found);
    }
  };

  const handleMouseUp = () => { isDraggingRef.current = false; };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragDistanceRef.current > 8) { dragDistanceRef.current = 0; return; }
    dragDistanceRef.current = 0;
    const clicked = getNodeAtPosition(e.clientX, e.clientY);
    setSelectedNode(clicked);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    isDraggingRef.current = true;
    startMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    dragDistanceRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startMouseRef.current.x;
    const dy = e.touches[0].clientY - startMouseRef.current.y;
    dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
    angleYRef.current += dx * 0.005;
    angleXRef.current += dy * 0.005;
    startMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    if (dragDistanceRef.current <= 8) {
      const touch = e.changedTouches[0];
      if (touch) {
        const tapped = getNodeAtPosition(touch.clientX, touch.clientY);
        setSelectedNode(tapped || selectedNode);
      }
    }
    dragDistanceRef.current = 0;
  };

  return (
    <div className="flex-1 bg-black/25 border border-white/5 rounded-lg relative overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-4 font-mono text-[9px] text-white/35 pointer-events-none select-none">
        <span>← Drag to Rotate →</span>
        <span>• Hover to Inspect •</span>
      </div>
    </div>
  );
}
