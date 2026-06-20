import { describe, it, expect } from "vitest";

// Vote badge color logic extracted from BoardroomModule
const getVoteBadgeColor = (vote: string): string => {
  if (vote === "?" || !vote) return "bg-white/5 text-white/30 border-white/10";
  if (vote === "SHIP" || vote === "DEPLOY" || vote === "YES") return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  if (vote === "DELAY" || vote === "NO") return "bg-red-500/10 border-red-500/30 text-red-400";
  return "bg-amber-500/10 border-amber-500/30 text-amber-400";
};

describe("BoardroomModule - getVoteBadgeColor", () => {
  it("returns muted badge for unknown votes", () => {
    expect(getVoteBadgeColor("?")).toContain("white/30");
    expect(getVoteBadgeColor("")).toContain("white/30");
  });

  it("returns green badge for approve/deploy votes", () => {
    expect(getVoteBadgeColor("SHIP")).toContain("emerald");
    expect(getVoteBadgeColor("DEPLOY")).toContain("emerald");
    expect(getVoteBadgeColor("YES")).toContain("emerald");
  });

  it("returns red badge for delay/reject votes", () => {
    expect(getVoteBadgeColor("DELAY")).toContain("red");
    expect(getVoteBadgeColor("NO")).toContain("red");
  });

  it("returns amber badge for hold votes", () => {
    expect(getVoteBadgeColor("HOLD")).toContain("amber");
    expect(getVoteBadgeColor("APPROVE")).toContain("amber"); // custom votes
  });
});
