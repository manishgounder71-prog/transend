import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "@/lib/rag/embed";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const a = [1, 2, 3];
    expect(cosineSimilarity(a, a)).toBeCloseTo(1, 10);
  });

  it("returns -1 for opposite vectors", () => {
    const a = [1, 0];
    const b = [-1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 10);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = [1, 0];
    const b = [0, 1];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0, 10);
  });

  it("returns a value between 0 and 1 for similar vectors", () => {
    const a = [1, 2, 3, 4, 5];
    const b = [1, 2, 3, 4, 6]; // slightly different
    const sim = cosineSimilarity(a, b);
    expect(sim).toBeGreaterThan(0.9);
    expect(sim).toBeLessThan(1);
  });

  it("returns 0 for vectors of different lengths", () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });

  it("returns 0 for zero vectors", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  it("handles negative values correctly", () => {
    const a = [-1, -2, -3];
    const b = [1, 2, 3];
    const sim = cosineSimilarity(a, b);
    expect(sim).toBeCloseTo(-1, 5); // opposite direction
  });

  it("is commutative (a·b == b·a)", () => {
    const a = [4, 7, 2, 9];
    const b = [1, 5, 8, 3];
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 10);
  });
});
