import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ParallelSimulatorAnalysis from "@/components/parallel/ParallelSimulatorAnalysis";
import type { AISimulationResult } from "@/components/parallel/parallelData";

const mockMetrics: AISimulationResult["metricsSummary"] = {
  bestCaseProbability: 72,
  worstCaseProbability: 8,
  expectedRevenueImpact: "+$84k",
  primaryRisk: "Database thread pool exhaustion",
};

describe("ParallelSimulatorAnalysis", () => {
  it("renders the strategic assessment heading", () => {
    render(<ParallelSimulatorAnalysis scenarioAnalysis="Test analysis" metricsSummary={null} />);
    expect(screen.getByText("Strategic Assessment")).toBeTruthy();
  });

  it("renders the scenario analysis text", () => {
    render(<ParallelSimulatorAnalysis scenarioAnalysis="This is a key insight for the team." metricsSummary={null} />);
    expect(screen.getByText("This is a key insight for the team.")).toBeTruthy();
  });

  it("renders metrics grid when metricsSummary is provided", () => {
    render(<ParallelSimulatorAnalysis scenarioAnalysis="Analysis with data" metricsSummary={mockMetrics} />);
    expect(screen.getByText("Best Case")).toBeTruthy();
    expect(screen.getByText("Worst Case")).toBeTruthy();
    expect(screen.getByText("Revenue Impact")).toBeTruthy();
    expect(screen.getByText("Primary Risk")).toBeTruthy();
  });

  it("renders correct metric values", () => {
    render(<ParallelSimulatorAnalysis scenarioAnalysis="test" metricsSummary={mockMetrics} />);
    expect(screen.getByText("72%")).toBeTruthy();
    expect(screen.getByText("8%")).toBeTruthy();
    expect(screen.getByText("+$84k")).toBeTruthy();
    expect(screen.getByText("Database thread pool exhaustion")).toBeTruthy();
  });

  it("does not render metrics grid when metricsSummary is null", () => {
    render(<ParallelSimulatorAnalysis scenarioAnalysis="No data" metricsSummary={null} />);
    expect(screen.queryByText("Best Case")).toBeNull();
    expect(screen.queryByText("Worst Case")).toBeNull();
    expect(screen.queryByText("72%")).toBeNull();
  });
});
