import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ParallelSimulatorBranch from "@/components/parallel/ParallelSimulatorBranch";
import type { UniverseBranch } from "@/components/parallel/parallelData";

const cyanBranch: UniverseBranch = {
  name: "Universe A: Test Branch",
  probability: "85% PROBABILITY",
  revenue: "+$80k (Boosted)",
  incidents: "5% (Low Risk)",
  velocity: "+12% (Optimal)",
  vulnerabilities: "0 (All Patched)",
  theme: "cyan",
  narrative: "Best-case execution with minimal disruption.",
};

const branchWithoutNarrative: UniverseBranch = {
  name: "Universe B: Silent Branch",
  probability: "15% PROBABILITY",
  revenue: "-$10k (Loss)",
  incidents: "40% (Moderate)",
  velocity: "-5% (Slow)",
  vulnerabilities: "2 (Medium CVE)",
  theme: "purple",
};

describe("ParallelSimulatorBranch", () => {
  it("renders the branch name", () => {
    render(<ParallelSimulatorBranch branch={cyanBranch} index={0} />);
    expect(screen.getByText("Universe A: Test Branch")).toBeTruthy();
  });

  it("renders the probability", () => {
    render(<ParallelSimulatorBranch branch={cyanBranch} index={0} />);
    expect(screen.getByText("85% PROBABILITY")).toBeTruthy();
  });

  it("renders all 4 metric labels", () => {
    render(<ParallelSimulatorBranch branch={cyanBranch} index={0} />);
    expect(screen.getByText("Revenue:")).toBeTruthy();
    expect(screen.getByText("Incidents:")).toBeTruthy();
    expect(screen.getByText("Velocity:")).toBeTruthy();
    expect(screen.getByText("Vulnerabilities:")).toBeTruthy();
  });

  it("renders all 4 metric values", () => {
    render(<ParallelSimulatorBranch branch={cyanBranch} index={0} />);
    expect(screen.getByText("+$80k (Boosted)")).toBeTruthy();
    expect(screen.getByText("5% (Low Risk)")).toBeTruthy();
    expect(screen.getByText("+12% (Optimal)")).toBeTruthy();
    expect(screen.getByText("0 (All Patched)")).toBeTruthy();
  });

  it("renders the narrative when provided", () => {
    render(<ParallelSimulatorBranch branch={cyanBranch} index={0} />);
    expect(screen.getByText("Best-case execution with minimal disruption.")).toBeTruthy();
  });

  it("does not render narrative when absent", () => {
    render(<ParallelSimulatorBranch branch={branchWithoutNarrative} index={1} />);
    expect(screen.queryByText("Best-case execution")).toBeNull();
    expect(screen.getByText("Universe B: Silent Branch")).toBeTruthy();
  });

  it("applies animation delay based on index", () => {
    const { container } = render(<ParallelSimulatorBranch branch={cyanBranch} index={2} />);
    const card = container.firstChild as HTMLElement;
    expect(card.style.animationDelay).toBe("300ms");
  });
});
