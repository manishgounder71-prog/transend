import { describe, it, expect } from "vitest";
import { getStageColor } from "@/components/pipeline/pipelineData";

describe("pipelineData - getStageColor", () => {
  // ── idle state ──
  it("returns muted colors when pipeline is idle", () => {
    expect(getStageColor("idle", "build")).toBe("border-white/10 text-white/40");
    expect(getStageColor("idle", "test")).toBe("border-white/10 text-white/40");
    expect(getStageColor("idle", "security")).toBe("border-white/10 text-white/40");
    expect(getStageColor("idle", "deploy")).toBe("border-white/10 text-white/40");
  });

  // ── build stage ──
  it("build stage is green in all non-idle states", () => {
    const states: Array<"running_fail" | "failed" | "healing" | "healed"> = [
      "running_fail", "failed", "healing", "healed",
    ];
    for (const s of states) {
      const color = getStageColor(s, "build");
      expect(color).toContain("10b981");
    }
  });

  // ── test stage ──
  it("test stage is cyan pulsing during running_fail", () => {
    const color = getStageColor("running_fail", "test");
    expect(color).toContain("cyan-500");
    expect(color).toContain("animate-pulse");
  });

  it("test stage is red when failed", () => {
    const color = getStageColor("failed", "test");
    expect(color).toContain("ef4444");
  });

  it("test stage is purple pulsing during healing", () => {
    const color = getStageColor("healing", "test");
    expect(color).toContain("purple-500");
    expect(color).toContain("animate-pulse");
  });

  it("test stage is green when healed", () => {
    const color = getStageColor("healed", "test");
    expect(color).toContain("10b981");
  });

  // ── security stage ──
  it("security stage is purple pulsing during healing", () => {
    const color = getStageColor("healing", "security");
    expect(color).toContain("purple-500");
    expect(color).toContain("animate-pulse");
  });

  it("security stage is green when healed", () => {
    const color = getStageColor("healed", "security");
    expect(color).toContain("10b981");
  });

  it("security stage is muted in running_fail and failed", () => {
    expect(getStageColor("running_fail", "security")).toBe("border-white/10 text-white/40");
    expect(getStageColor("failed", "security")).toBe("border-white/10 text-white/40");
  });

  // ── deploy stage ──
  it("deploy stage is purple pulsing during healing", () => {
    const color = getStageColor("healing", "deploy");
    expect(color).toContain("purple-500");
    expect(color).toContain("animate-pulse");
  });

  it("deploy stage is green when healed", () => {
    const color = getStageColor("healed", "deploy");
    expect(color).toContain("10b981");
  });

  it("deploy stage is muted in running_fail and failed", () => {
    expect(getStageColor("running_fail", "deploy")).toBe("border-white/10 text-white/40");
    expect(getStageColor("failed", "deploy")).toBe("border-white/10 text-white/40");
  });

  // ── unknown stage ──
  it("returns muted colors for unknown stages", () => {
    expect(getStageColor("idle", "unknown")).toBe("border-white/10 text-white/40");
    expect(getStageColor("healed", "unknown")).toBe("border-white/10 text-white/40");
  });
});
