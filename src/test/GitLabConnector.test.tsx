import { describe, it, expect } from "vitest";

// Status badge color logic extracted from GitLabConnector
const getStatusBadge = (status: string): string => {
  switch (status.toLowerCase()) {
    case "success":
      return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400";
    case "failed":
      return "bg-red-500/10 border-red-500/25 text-red-400";
    case "running":
    case "pending":
      return "bg-amber-500/10 border-amber-500/25 text-amber-400 animate-pulse";
    default:
      return "bg-slate-500/10 border-slate-500/25 text-slate-400";
  }
};

describe("GitLabConnector - getStatusBadge", () => {
  it("returns emerald badge for success", () => {
    const badge = getStatusBadge("success");
    expect(badge).toContain("emerald");
    expect(badge).not.toContain("red");
  });

  it("returns red badge for failed", () => {
    const badge = getStatusBadge("failed");
    expect(badge).toContain("red");
  });

  it("returns amber badge with pulse for running", () => {
    const badge = getStatusBadge("running");
    expect(badge).toContain("amber");
    expect(badge).toContain("animate-pulse");
  });

  it("returns amber badge with pulse for pending", () => {
    const badge = getStatusBadge("pending");
    expect(badge).toContain("amber");
    expect(badge).toContain("animate-pulse");
  });

  it("returns slate badge for unknown statuses", () => {
    const badge = getStatusBadge("canceled");
    expect(badge).toContain("slate");
  });

  it("is case-insensitive", () => {
    expect(getStatusBadge("SUCCESS")).toContain("emerald");
    expect(getStatusBadge("FAILED")).toContain("red");
  });
});
