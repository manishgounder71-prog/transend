import { Users, Calendar, AlertOctagon, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface UniverseBranch {
  name: string;
  probability: string;
  revenue: string;
  incidents: string;
  velocity: string;
  vulnerabilities: string;
  theme: "cyan" | "purple" | "warning";
  narrative?: string;
}

export interface AISimulationResult {
  branches: UniverseBranch[];
  scenarioAnalysis: string;
  metricsSummary: {
    bestCaseProbability: number;
    worstCaseProbability: number;
    expectedRevenueImpact: string;
    primaryRisk: string;
  };
}

export interface TemplateItem {
  text: string;
  icon: LucideIcon;
}

export const templates: TemplateItem[] = [
  { text: "What if we hire 2 senior engineers?", icon: Users },
  { text: "What if we delay release by 2 weeks?", icon: Calendar },
  { text: "What if auth-service goes down for 1 hour?", icon: AlertOctagon },
  { text: "What if traffic spikes to 500% of normal?", icon: TrendingUp },
];

/** Extract the first number found in a string. */
export function extractNumber(text: string): number {
  const matches = text.match(/\d+/g);
  if (matches && matches.length > 0) {
    return parseInt(matches[0], 10);
  }
  return 0;
}

/** Format a number as a currency string (e.g. +$84k). */
export function formatCurrency(val: number): string {
  if (Math.abs(val) >= 1000) return `${val >= 0 ? "+" : ""}$${Math.round(val / 1000)}k`;
  return `${val >= 0 ? "+" : ""}$${val.toLocaleString()}`;
}

/** Get the Tailwind border-color class for a branch theme. */
export function getBorderColor(theme: string): string {
  if (theme === "cyan") return "before:bg-[#00f0ff]";
  if (theme === "purple") return "before:bg-[#a855f7]";
  return "before:bg-[#f59e0b]";
}

/** Get the Tailwind text-color class for a branch theme. */
export function getProbColor(theme: string): string {
  if (theme === "cyan") return "text-[#00f0ff]";
  if (theme === "purple") return "text-[#a855f7]";
  return "text-[#f59e0b]";
}
