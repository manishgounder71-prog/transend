// ── GitLab Orbit Integration — Public API ──────────────────
// Barrel file: re-exports the main Orbit types and utilities.
//
// Use this import from other modules:
//   import { getOrbitStatus, buildOrbitContext } from "@/lib/orbit";

export * from "./types";
export {
  getOrbitStatus,
  buildOrbitContext,
  indexProject,
  queryGraph,
  getGraphSchema,
  getProjectFiles,
  getProjectDefinitions,
  getProjectImports,
  getIndexSummary,
} from "./client";

export { formatOrbitContextForPrompt, simulateOrbitContext } from "./simulated";
