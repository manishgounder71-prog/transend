import { describe, it, expect } from "vitest";
import { extractNumber, formatCurrency, getBorderColor, getProbColor, templates } from "@/components/parallel/parallelData";

describe("parallelData - extractNumber", () => {
  it("extracts a single number", () => {
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

  it("extracts large numbers", () => {
    expect(extractNumber("traffic spikes to 5000%")).toBe(5000);
  });
});

describe("parallelData - formatCurrency", () => {
  it("formats positive values under 1000 with + sign", () => {
    expect(formatCurrency(500)).toBe("+$500");
  });

  it("formats negative values under 1000", () => {
    expect(formatCurrency(-500)).toBe("$-500");
  });

  it("formats positive values >= 1000 with k suffix", () => {
    expect(formatCurrency(36000)).toBe("+$36k");
  });

  it("formats negative values >= 1000 with k suffix", () => {
    expect(formatCurrency(-18000)).toBe("$-18k");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("+$0");
  });

  it("rounds to nearest thousand", () => {
    expect(formatCurrency(1999)).toBe("+$2k");
    expect(formatCurrency(1500)).toBe("+$2k");
  });
});

describe("parallelData - getBorderColor", () => {
  it("returns cyan class for cyan theme", () => {
    expect(getBorderColor("cyan")).toContain("00f0ff");
  });

  it("returns purple class for purple theme", () => {
    expect(getBorderColor("purple")).toContain("a855f7");
  });

  it("returns amber class for warning theme", () => {
    expect(getBorderColor("warning")).toContain("f59e0b");
  });

  it("defaults to amber for unknown themes", () => {
    expect(getBorderColor("unknown")).toContain("f59e0b");
  });
});

describe("parallelData - getProbColor", () => {
  it("returns cyan text class for cyan theme", () => {
    expect(getProbColor("cyan")).toContain("00f0ff");
  });

  it("returns purple text class for purple theme", () => {
    expect(getProbColor("purple")).toContain("a855f7");
  });

  it("returns amber text class for warning theme", () => {
    expect(getProbColor("warning")).toContain("f59e0b");
  });
});

describe("parallelData - templates", () => {
  it("exports exactly 4 template scenarios", () => {
    expect(templates).toHaveLength(4);
  });

  it("each template has text and icon", () => {
    for (const t of templates) {
      expect(t.text).toBeTruthy();
      expect(t.icon).toBeDefined();
    }
  });
});
