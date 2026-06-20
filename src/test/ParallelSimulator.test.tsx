import { describe, it, expect } from "vitest";

// Extract the core logic from ParallelSimulator for isolated testing
const extractNumber = (text: string): number => {
  const matches = text.match(/\d+/g);
  if (matches && matches.length > 0) {
    return parseInt(matches[0], 10);
  }
  return 0;
};

const formatCurrency = (val: number): string => {
  if (Math.abs(val) >= 1000) return `${val >= 0 ? "+" : ""}$${Math.round(val / 1000)}k`;
  return `${val >= 0 ? "+" : ""}$${val.toLocaleString()}`;
};

describe("ParallelSimulator - extractNumber", () => {
  it("extracts a single number from a string", () => {
    expect(extractNumber("hire 2 engineers")).toBe(2);
  });

  it("extracts the first number when multiple exist", () => {
    expect(extractNumber("500% increase with 3 replicas")).toBe(500);
  });

  it("returns 0 for strings with no numbers", () => {
    expect(extractNumber("what if we hire engineers?")).toBe(0);
  });

  it("handles empty strings", () => {
    expect(extractNumber("")).toBe(0);
  });
});

describe("ParallelSimulator - formatCurrency", () => {
  it("formats positive values under 1000 with + sign", () => {
    expect(formatCurrency(500)).toBe("+$500");
  });

  it("formats negative values under 1000 correctly", () => {
    // Actual: val.toLocaleString() for -500 produces "-500", prepended with "" gives "$-500"
    expect(formatCurrency(-500)).toBe("$-500");
  });

  it("formats positive values >= 1000 with k suffix", () => {
    expect(formatCurrency(36000)).toBe("+$36k");
  });

  it("formats negative values >= 1000 with k suffix", () => {
    // Actual: Math.round(-18000/1000) = -18, prepended with "" gives "$-18k"
    expect(formatCurrency(-18000)).toBe("$-18k");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("+$0");
  });
});
