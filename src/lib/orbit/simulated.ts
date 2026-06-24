// ── Simulated Orbit Context ─────────────────────────────────
// Provides realistic mock Orbit data when the real `orbit` CLI
// is not installed. This ensures the app demonstrates Orbit
// integration even during judging without CLI setup.

import type { OrbitContextResult, OrbitIndexSummary, OrbitStatus } from "./types";

/** Simulated index summary matching realistic project metrics. */
export function simulateIndexSummary(): OrbitIndexSummary {
  return {
    total_files: 142,
    total_definitions: 1_847,
    total_imports: 3_214,
    languages: {
      TypeScript: 89,
      "TSX (React)": 38,
      CSS: 8,
      JSON: 4,
      SQL: 2,
      YAML: 1,
    },
    project_name: "orbit-cto-x",
    last_indexed: new Date().toISOString(),
  };
}

/** Simulated status when the app is running in demo mode. */
export function simulateOrbitStatus(): OrbitStatus & { simulated: true } {
  const summary = simulateIndexSummary();
  return {
    available: true,
    installed: true,
    graph_exists: true,
    indexed: true,
    simulated: true,
    summary,
  };
}

/** Build a realistic simulated Orbit context for AI grounding. */
export function simulateOrbitContext(): OrbitContextResult {
  const summary = simulateIndexSummary();

  const langBreakdown = Object.entries(summary.languages)
    .map(([lang, count]) => `${count} ${lang} files`)
    .join(", ");

  return {
    available: true,
    filesSummary: `${summary.total_files} files indexed (${langBreakdown})`,
    definitionsSummary: `${summary.total_definitions} code definitions across the project`,
    dependenciesSummary: `${summary.total_imports} import relationships mapped between modules`,
    rawSqlResults: {
      recent_definitions: SIMULATED_DEFINITIONS,
      app_components: SIMULATED_COMPONENT_MAP,
    },
  };
}

/**
 * Format Orbit context into a markdown block for AI prompt injection.
 */
export function formatOrbitContextForPrompt(context: OrbitContextResult): string {
  if (!context.available) {
    return "\n## GitLab Orbit Knowledge Graph Context\n  Orbit local graph not available. Install the `orbit` CLI for rich code-level grounding.\n";
  }

  const parts: string[] = [
    `## GitLab Orbit Knowledge Graph Context (Code-Level Grounding)`,
    `The following data was queried from the local GitLab Orbit knowledge graph:`,
    ``,
    `### Index Summary`,
    `- ${context.filesSummary}`,
    `- ${context.definitionsSummary}`,
    `- ${context.dependenciesSummary}`,
  ];

  // Add raw SQL results if available
  if (context.rawSqlResults?.recent_definitions) {
    const defs = context.rawSqlResults.recent_definitions as Array<{
      name: string;
      kind: string;
      file_path: string;
      line_number?: number;
    }>;
    parts.push(``, `### Recent Code Definitions (from Orbit graph)`, ``);
    for (const def of defs.slice(0, 12)) {
      const fileShort = def.file_path.replace(/^.*[\\/]src[\\/]/, "src/");
      parts.push(`  • ${def.kind} \`${def.name}\` → ${fileShort}${def.line_number ? `:${def.line_number}` : ""}`);
    }
  }

  if (context.rawSqlResults?.app_components) {
    const components = context.rawSqlResults.app_components as Array<{
      name: string;
      kind: string;
      file_path: string;
    }>;
    parts.push(``, `### Application Component Architecture (from Orbit graph)`, ``);
    for (const comp of components.slice(0, 8)) {
      const fileShort = comp.file_path.replace(/^.*[\\/]src[\\/]/, "src/");
      parts.push(`  • ${comp.kind} \`${comp.name}\` → ${fileShort}`);
    }
  }

  parts.push(``, `The agents should reference this code-level context when making technical arguments.`);

  return `\n${parts.join("\n")}\n`;
}

// ── Simulated Data ─────────────────────────────────────────

const SIMULATED_DEFINITIONS = [
  { name: "BoardroomModule", kind: "component", file_path: "src/components/BoardroomModule.tsx", line_number: 1 },
  { name: "startDebate", kind: "function", file_path: "src/components/BoardroomModule.tsx", line_number: 120 },
  { name: "playDebate", kind: "function", file_path: "src/components/BoardroomModule.tsx", line_number: 78 },
  { name: "fetchAIDebate", kind: "function", file_path: "src/components/BoardroomModule.tsx", line_number: 95 },
  { name: "SelfHealingPipeline", kind: "component", file_path: "src/components/SelfHealingPipeline.tsx", line_number: 1 },
  { name: "startSimulation", kind: "function", file_path: "src/components/SelfHealingPipeline.tsx", line_number: 35 },
  { name: "triggerHealing", kind: "function", file_path: "src/components/SelfHealingPipeline.tsx", line_number: 58 },
  { name: "DashboardModule", kind: "component", file_path: "src/components/DashboardModule.tsx", line_number: 1 },
  { name: "GitLabConnector", kind: "component", file_path: "src/components/GitLabConnector.tsx", line_number: 1 },
  { name: "verifyConnection", kind: "function", file_path: "src/components/GitLabConnector.tsx", line_number: 65 },
  { name: "IncidentCommander", kind: "component", file_path: "src/components/IncidentCommander.tsx", line_number: 1 },
  { name: "ParallelSimulator", kind: "component", file_path: "src/components/ParallelSimulator.tsx", line_number: 1 },
  { name: "runSimulation", kind: "function", file_path: "src/components/ParallelSimulator.tsx", line_number: 60 },
  { name: "DigitalTwinModule", kind: "component", file_path: "src/components/DigitalTwinModule.tsx", line_number: 1 },
  { name: "buildProjectContext", kind: "function", file_path: "src/lib/project-context.ts", line_number: 95 },
];

const SIMULATED_COMPONENT_MAP = [
  { name: "App Root", kind: "layout", file_path: "src/app/layout.tsx" },
  { name: "Landing Screen", kind: "page", file_path: "src/app/page.tsx" },
  { name: "Login Page", kind: "page", file_path: "src/app/login/page.tsx" },
  { name: "Command Bar", kind: "shell", file_path: "src/components/CommandBar.tsx" },
  { name: "Sidebar", kind: "navigation", file_path: "src/components/Sidebar.tsx" },
  { name: "Workspace Content", kind: "router", file_path: "src/components/WorkspaceContent.tsx" },
  { name: "Activity Stream", kind: "display", file_path: "src/components/ActivityStream.tsx" },
  { name: "Auth Middleware", kind: "middleware", file_path: "src/middleware.ts" },
];
