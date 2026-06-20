import { describe, it, expect } from "vitest";

// Core risk calculation logic extracted from ReleasePredictor
const calculateRiskMetrics = (commitsCount: number) => {
  const calculatedRisk = Math.min(95, 20 + commitsCount * 10);
  const calculatedIncidentProb = Math.min(90, 10 + commitsCount * 8);
  const calculatedRollback = Math.min(60, 2 + commitsCount * 5);
  const calculatedConfidence = Math.max(30, 99 - commitsCount * 5);

  return {
    deploymentRisk: calculatedRisk,
    incidentProbability: calculatedIncidentProb,
    rollbackRisk: calculatedRollback,
    confidence: calculatedConfidence,
  };
};

const getMeterType = (val: number): "danger" | "warning" | "success" => {
  if (val > 70) return "danger";
  if (val > 40) return "warning";
  return "success";
};

describe("ReleasePredictor - risk calculation", () => {
  it("calculates low risk for few commits", () => {
    const result = calculateRiskMetrics(1);
    expect(result.deploymentRisk).toBe(30);
    expect(result.incidentProbability).toBe(18);
    expect(result.rollbackRisk).toBe(7);
    expect(result.confidence).toBe(94);
  });

  it("calculates high risk for many commits", () => {
    const result = calculateRiskMetrics(10);
    expect(result.deploymentRisk).toBe(95); // capped
    expect(result.incidentProbability).toBe(90); // capped
    expect(result.rollbackRisk).toBe(52);
    expect(result.confidence).toBe(49);
  });

  it("caps confidence at a minimum of 30", () => {
    const result = calculateRiskMetrics(20);
    expect(result.confidence).toBe(30); // capped
  });
});

describe("ReleasePredictor - meter type", () => {
  it("returns danger for values > 70", () => {
    expect(getMeterType(95)).toBe("danger");
    expect(getMeterType(71)).toBe("danger");
  });

  it("returns warning for values between 40 and 70", () => {
    expect(getMeterType(64)).toBe("warning");
    expect(getMeterType(41)).toBe("warning");
  });

  it("returns success for values <= 40", () => {
    expect(getMeterType(40)).toBe("success");
    expect(getMeterType(12)).toBe("success");
  });
});
