"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { type PipelineState } from "./pipelineData";

interface PipelineDAGProps {
  pipelineState: PipelineState;
}

// ── Stage Definitions ──────────────────────────────────────

interface StageDef {
  id: string;
  label: string;
  description: string;
}

const STAGES: StageDef[] = [
  { id: "build", label: "Stage: Build", description: "Webpack packaging" },
  { id: "test", label: "Stage: Jest Test Suite", description: "Integration testing specs" },
  { id: "security", label: "Stage: Security Audit", description: "Container CVE checklist" },
  { id: "deploy", label: "Stage: Deploy Production", description: "Kubernetes pods recycle" },
];

type StageStatus = "idle" | "running" | "success" | "failed" | "healing";

function getStageStatus(state: PipelineState, stageId: string): StageStatus {
  switch (state) {
    case "idle":
      return "idle";
    case "running_fail":
      if (stageId === "build") return "success";
      if (stageId === "test") return "running";
      return "idle";
    case "failed":
      if (stageId === "build") return "success";
      if (stageId === "test") return "failed";
      return "idle";
    case "healing":
      return "healing";
    case "healed":
      return "success";
    default:
      return "idle";
  }
}

// ── Status Colour Palette ──────────────────────────────────

const COLORS: Record<StageStatus, { fill: string; stroke: string; text: string; glow: string }> = {
  idle: {
    fill: "rgba(255,255,255,0.02)",
    stroke: "rgba(255,255,255,0.08)",
    text: "rgba(255,255,255,0.35)",
    glow: "none",
  },
  running: {
    fill: "rgba(0,240,255,0.06)",
    stroke: "#00f0ff",
    text: "#00f0ff",
    glow: "0 0 14px rgba(0,240,255,0.3)",
  },
  success: {
    fill: "rgba(16,185,129,0.06)",
    stroke: "#10b981",
    text: "#10b981",
    glow: "0 0 14px rgba(16,185,129,0.25)",
  },
  failed: {
    fill: "rgba(239,68,68,0.06)",
    stroke: "#ef4444",
    text: "#ef4444",
    glow: "0 0 14px rgba(239,68,68,0.3)",
  },
  healing: {
    fill: "rgba(168,85,247,0.06)",
    stroke: "#a855f7",
    text: "#a855f7",
    glow: "0 0 14px rgba(168,85,247,0.25)",
  },
};

// ── Edge status → colour helper ────────────────────────────

function getEdgeColor(sourceStatus: StageStatus, targetStatus: StageStatus): string {
  if (sourceStatus === "success" && targetStatus !== "idle" && targetStatus !== "failed") return "#10b981";
  if (sourceStatus === "success" && targetStatus === "failed") return "#ef4444";
  if (sourceStatus === "success" && (targetStatus === "running" || targetStatus === "healing")) return "#00f0ff";
  return "rgba(255,255,255,0.06)";
}

// ── Layout Constants ───────────────────────────────────────

const NODE_W = 200;
const NODE_H = 56;
const NODE_GAP = 28;
const TOP_PAD = 8;
const BOT_PAD = 8;

// ── D3 Tick function: animate dash offset ──────────────────

function tickDash(path: d3.Selection<SVGPathElement, unknown, null, undefined>) {
  const totalLength = path.node()?.getTotalLength() ?? 300;
  path
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(1800)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .on("end", () => {
      (path as unknown as d3.Selection<SVGPathElement, unknown, null, undefined>).call(tickDash);
    });
}

// ── Component ──────────────────────────────────────────────

export default function PipelineDAG({ pipelineState }: PipelineDAGProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const width = el.clientWidth || 340;
    const totalHeight = STAGES.length * NODE_H + (STAGES.length - 1) * NODE_GAP + TOP_PAD + BOT_PAD;
    el.style.height = `${totalHeight}px`;

    const svg = d3.select(el);

    // Clear & set viewBox to enable responsive scaling
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${totalHeight}`);

    // ── Defs: gradient glow filters & arrow marker ──────────
    const defs = svg.append("defs");

    // Glow filter for active nodes
    const filter = defs.append("filter").attr("id", "node-glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Arrow marker
    defs
      .append("marker")
      .attr("id", "dag-arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 16)
      .attr("refY", 5)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "rgba(255,255,255,0.15)");

    // ── Compute node positions ──────────────────────────────
    const nodes = STAGES.map((s, i) => ({
      ...s,
      x: width / 2,
      y: TOP_PAD + i * (NODE_H + NODE_GAP),
    }));

    const startX = width / 2;

    // ── Draw edges (behind nodes) ───────────────────────────
    for (let i = 0; i < nodes.length - 1; i++) {
      const src = nodes[i];
      const tgt = nodes[i + 1];
      const srcStatus = getStageStatus(pipelineState, src.id);
      const tgtStatus = getStageStatus(pipelineState, tgt.id);

      const edgeColor = getEdgeColor(srcStatus, tgtStatus);
      const eWidth = edgeColor !== "rgba(255,255,255,0.06)" ? 2 : 1.2;
      const isActive = srcStatus === "success" && (tgtStatus === "running" || tgtStatus === "healing");

      const sy = src.y + NODE_H / 2;
      const ty = tgt.y - NODE_H / 2;

      const path = svg
        .append("path")
        .attr("d", `M ${startX} ${sy} L ${startX} ${ty}`)
        .attr("stroke", edgeColor)
        .attr("stroke-width", eWidth)
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        .attr("marker-end", isActive || srcStatus === "success" ? "url(#dag-arrow)" : "none");

      // Animated dashes for in-flight edges
      if (isActive) {
        path
          .attr("stroke-dasharray", "6,5")
          .call(tickDash);
      }

      // Glow pulse on active edge behind it
      if (isActive) {
        svg
          .append("path")
          .attr("d", `M ${startX} ${sy} L ${startX} ${ty}`)
          .attr("stroke", "#00f0ff")
          .attr("stroke-width", 6)
          .attr("fill", "none")
          .attr("opacity", 0.08)
          .attr("stroke-linecap", "round");
      }
    }

    // ── Draw nodes ──────────────────────────────────────────
    nodes.forEach((node) => {
      const status = getStageStatus(pipelineState, node.id);
      const c = COLORS[status];
      const lx = node.x - NODE_W / 2;
      const ly = node.y - NODE_H / 2;

      const group = svg.append("g").attr("class", "dag-node");

      // Outer glow ring for active nodes
      if (status === "running" || status === "healing" || status === "failed") {
        group
          .append("rect")
          .attr("x", lx - 3)
          .attr("y", ly - 3)
          .attr("width", NODE_W + 6)
          .attr("height", NODE_H + 6)
          .attr("rx", 12)
          .attr("ry", 12)
          .attr("fill", "none")
          .attr("stroke", c.stroke)
          .attr("stroke-width", 1)
          .attr("opacity", 0.2)
          .attr("filter", "url(#node-glow)");
      }

      // Node body
      const body = group
        .append("rect")
        .attr("x", lx)
        .attr("y", ly)
        .attr("width", NODE_W)
        .attr("height", NODE_H)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", c.fill)
        .attr("stroke", c.stroke)
        .attr("stroke-width", 1.5);

      if (c.glow !== "none") {
        body.attr("filter", "url(#node-glow)");
      }

      // Status dot indicator (left side)
      group
        .append("circle")
        .attr("cx", lx + 18)
        .attr("cy", node.y)
        .attr("r", 5)
        .attr("fill", status === "idle" ? "rgba(255,255,255,0.12)" : c.stroke);

      // Spinning loader for running/healing
      if (status === "running") {
        const loader = group
          .append("circle")
          .attr("cx", lx + 18)
          .attr("cy", node.y)
          .attr("r", 8)
          .attr("fill", "none")
          .attr("stroke", "#00f0ff")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "10,15")
          .attr("opacity", 0.6);

        const circumference = 2 * Math.PI * 8;
        loader
          .attr("stroke-dasharray", `${circumference * 0.3}, ${circumference * 0.7}`)
          .transition()
          .duration(1200)
          .ease(d3.easeLinear)
          .attrTween("stroke-dashoffset", () => (t: number) => String(d3.interpolate(0, circumference)(t)))
          .on("end", function repeat() {
            d3.select(this)
              .transition()
              .duration(1200)
              .ease(d3.easeLinear)
              .attrTween("stroke-dashoffset", () => (t: number) => String(d3.interpolate(0, circumference)(t)))
              .on("end", repeat);
          });
      }

      // Stage label
      group
        .append("text")
        .attr("x", lx + 32)
        .attr("y", node.y - 4)
        .attr("fill", c.text)
        .attr("font-size", "11.5px")
        .attr("font-weight", "700")
        .attr("font-family", "Outfit, sans-serif")
        .attr("dominant-baseline", "auto")
        .text(node.label);

      // Description
      group
        .append("text")
        .attr("x", lx + 32)
        .attr("y", node.y + 14)
        .attr("fill", status === "idle" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.45)")
        .attr("font-size", "9px")
        .attr("font-family", "'JetBrains Mono', monospace")
        .text(node.description);
    });
  }, [pipelineState]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-auto overflow-visible"
    />
  );
}
