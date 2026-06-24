// ── GitLab Orbit MCP/CLI Client ─────────────────────────────
// Provides an interface for querying the local GitLab Orbit
// knowledge graph via the `orbit` CLI or MCP protocol.
//
// All operations gracefully fall back when the CLI is not
// installed or the graph does not exist.

import { execSync, type ExecSyncOptions } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import type {
  OrbitStatus,
  OrbitIndexSummary,
  OrbitGraphSchema,
  OrbitFile,
  OrbitDefinition,
  OrbitImport,
  OrbitContextResult,
} from "./types";

// ── Configuration ──────────────────────────────────────────

const ORBIT_CLI = "orbit";
const ORBIT_GRAPH_DIR = path.join(os.homedir(), ".orbit");
const ORBIT_GRAPH_PATH = path.join(ORBIT_GRAPH_DIR, "graph.duckdb");
const INDEX_TIMEOUT_MS = 120_000; // 2 min for indexing
const QUERY_TIMEOUT_MS = 15_000;
const PROJECT_ROOT = process.cwd();

// ── Exec Helpers ───────────────────────────────────────────

function runOrbit(
  args: string[],
  options: ExecSyncOptions = {},
): { stdout: string; stderr: string } {
  const result = execSync(`${ORBIT_CLI} ${args.join(" ")}`, {
    maxBuffer: 10 * 1024 * 1024,
    ...options,
    encoding: "utf-8",
  });
  return { stdout: result, stderr: "" };
}

function runOrbitSafe(
  args: string[],
  options: ExecSyncOptions = {},
): { stdout: string; stderr: string } | null {
  try {
    return runOrbit(args, options);
  } catch {
    return null;
  }
}

// ── Caching ────────────────────────────────────────────────
let cachedInstalled: boolean | null = null;
let cachedGraphExists: boolean | null = null;
let cachedProjectIndexed: boolean | null = null;
let cachedIndexSummary: OrbitIndexSummary | null = null;

let lastInstalledCheck = 0;
let lastGraphCheck = 0;
let lastIndexedCheck = 0;
let lastSummaryCheck = 0;

// ── Detection ──────────────────────────────────────────────

function isOrbitInstalled(): boolean {
  const now = Date.now();
  if (cachedInstalled !== null && now - lastInstalledCheck < 60_000) {
    return cachedInstalled;
  }
  try {
    execSync(`${ORBIT_CLI} --version`, {
      encoding: "utf-8",
      stdio: "ignore",
      timeout: 5_000,
    });
    cachedInstalled = true;
  } catch {
    cachedInstalled = false;
  }
  lastInstalledCheck = now;
  return cachedInstalled;
}

function graphExists(): boolean {
  const now = Date.now();
  if (cachedGraphExists !== null && now - lastGraphCheck < 10_000) {
    return cachedGraphExists;
  }
  try {
    cachedGraphExists = fs.existsSync(ORBIT_GRAPH_PATH);
  } catch {
    cachedGraphExists = false;
  }
  lastGraphCheck = now;
  return cachedGraphExists;
}

function isProjectIndexed(): boolean {
  if (!graphExists()) return false;
  const now = Date.now();
  if (cachedProjectIndexed !== null && now - lastIndexedCheck < 10_000) {
    return cachedProjectIndexed;
  }
  // Check if our project appears in the graph
  const result = runOrbitSafe(["sql", `SELECT COUNT(*) as cnt FROM files WHERE file_path LIKE '${PROJECT_ROOT}%'`]);
  if (!result) {
    cachedProjectIndexed = false;
  } else {
    try {
      const parsed = JSON.parse(result.stdout);
      cachedProjectIndexed = Array.isArray(parsed) && parsed.length > 0 && parsed[0].cnt > 0;
    } catch {
      cachedProjectIndexed = false;
    }
  }
  lastIndexedCheck = now;
  return cachedProjectIndexed;
}

// ── Schema Introspection ───────────────────────────────────

export async function getGraphSchema(): Promise<OrbitGraphSchema | null> {
  const result = runOrbitSafe(["schema", "--json"]);
  if (!result) return null;
  try {
    return JSON.parse(result.stdout) as OrbitGraphSchema;
  } catch {
    return null;
  }
}

// ── Indexing ───────────────────────────────────────────────

export async function indexProject(targetPath?: string): Promise<boolean> {
  const dir = targetPath ?? PROJECT_ROOT;

  // Ensure the orbit data directory exists
  if (!fs.existsSync(ORBIT_GRAPH_DIR)) {
    fs.mkdirSync(ORBIT_GRAPH_DIR, { recursive: true });
  }

  const result = runOrbitSafe(["index", dir], {
    timeout: INDEX_TIMEOUT_MS,
  });

  if (result !== null) {
    // Invalidate status caches
    cachedGraphExists = null;
    cachedProjectIndexed = null;
    cachedIndexSummary = null;
    lastGraphCheck = 0;
    lastIndexedCheck = 0;
    lastSummaryCheck = 0;
  }

  return result !== null;
}

// ── SQL Queries ────────────────────────────────────────────

/**
 * Execute a read-only SQL query against the Orbit DuckDB graph.
 * Returns parsed JSON rows, or null on failure.
 */
export async function queryGraph(sql: string): Promise<unknown[] | null> {
  // Safety: only allow SELECT queries
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith("SELECT")) {
    return null;
  }

  const result = runOrbitSafe(["sql", sql, "--json"], {
    timeout: QUERY_TIMEOUT_MS,
  });

  if (!result) return null;

  try {
    const parsed = JSON.parse(result.stdout);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// ── Typed Query Helpers ────────────────────────────────────

/**
 * Get all source files in the project.
 */
export async function getProjectFiles(): Promise<OrbitFile[]> {
  const rows = await queryGraph(
    `SELECT id, file_path as path, language, lines, size_bytes, last_modified
     FROM files
     WHERE file_path LIKE '${PROJECT_ROOT}%'
     ORDER BY file_path`,
  );

  if (!rows) return [];
  return rows as OrbitFile[];
}

/**
 * Get all definitions (functions, classes, types) in the project.
 */
export async function getProjectDefinitions(): Promise<OrbitDefinition[]> {
  const rows = await queryGraph(
    `SELECT d.id, d.name, d.kind, d.file_path, d.line_number
     FROM definitions d
     WHERE d.file_path LIKE '${PROJECT_ROOT}%'
     ORDER BY d.file_path, d.line_number`,
  );

  if (!rows) return [];
  return rows as OrbitDefinition[];
}

/**
 * Get all imports / dependencies between files.
 */
export async function getProjectImports(): Promise<OrbitImport[]> {
  const rows = await queryGraph(
    `SELECT source_file, target_file, symbol_name, import_type
     FROM imports
     WHERE source_file LIKE '${PROJECT_ROOT}%'
     ORDER BY source_file`,
  );

  if (!rows) return [];
  return rows as OrbitImport[];
}

/**
 * Get a summary of the indexed project: file counts, language breakdown, etc.
 */
export async function getIndexSummary(): Promise<OrbitIndexSummary | null> {
  if (!graphExists()) return null;
  const now = Date.now();
  if (cachedIndexSummary !== null && now - lastSummaryCheck < 10_000) {
    return cachedIndexSummary;
  }

  const [fileStats, langStats, defStats, importStats] = await Promise.all([
    queryGraph(
      `SELECT COUNT(*) as total FROM files WHERE file_path LIKE '${PROJECT_ROOT}%'`,
    ),
    queryGraph(
      `SELECT language, COUNT(*) as count FROM files WHERE file_path LIKE '${PROJECT_ROOT}%' GROUP BY language ORDER BY count DESC`,
    ),
    queryGraph(
      `SELECT COUNT(*) as total FROM definitions d WHERE d.file_path LIKE '${PROJECT_ROOT}%'`,
    ),
    queryGraph(
      `SELECT COUNT(*) as total FROM imports i WHERE i.source_file LIKE '${PROJECT_ROOT}%'`,
    ),
  ]);

  const files = fileStats?.[0] as { total: number } | undefined;
  const defs = defStats?.[0] as { total: number } | undefined;
  const imports = importStats?.[0] as { total: number } | undefined;

  // Get last indexed time from the graph file's mtime
  let lastIndexed: string | null = null;
  try {
    const stat = fs.statSync(ORBIT_GRAPH_PATH);
    lastIndexed = stat.mtime.toISOString();
  } catch {
    // ignore
  }

  const languages: Record<string, number> = {};
  if (langStats) {
    for (const row of langStats as Array<{ language: string; count: number }>) {
      languages[row.language] = row.count;
    }
  }

  const summary = {
    total_files: files?.total ?? 0,
    total_definitions: defs?.total ?? 0,
    total_imports: imports?.total ?? 0,
    languages,
    project_name: path.basename(PROJECT_ROOT),
    last_indexed: lastIndexed,
  };
  cachedIndexSummary = summary;
  lastSummaryCheck = now;
  return summary;
}

// ── Status ─────────────────────────────────────────────────

export async function getOrbitStatus(): Promise<OrbitStatus> {
  const installed = isOrbitInstalled();
  const graph = graphExists();

  if (!installed) {
    return {
      available: false,
      installed: false,
      graph_exists: false,
      indexed: false,
      summary: null,
      error: "GitLab Orbit CLI not installed. Run: curl -fsSL https://gitlab.com/gitlab-org/orbit/knowledge-graph/-/raw/main/install.sh | bash",
    };
  }

  if (!graph) {
    return {
      available: true,
      installed: true,
      graph_exists: false,
      indexed: false,
      summary: null,
      error: "Orbit graph not found. Run: orbit index .",
    };
  }

  const indexed = isProjectIndexed();
  const summary = indexed ? await getIndexSummary() : null;

  return {
    available: true,
    installed: true,
    graph_exists: true,
    indexed,
    summary,
  };
}

// ── Context Builder for AI Grounding ───────────────────────

/**
 * Build a context string from the Orbit knowledge graph for
 * injecting into AI prompts (boardroom debates, pipeline analysis, etc.).
 *
 * Gracefully falls back to empty context if Orbit is not available.
 */
export async function buildOrbitContext(): Promise<OrbitContextResult> {
  const status = await getOrbitStatus();

  if (!status.available || !status.indexed || !status.summary) {
    return {
      available: false,
      filesSummary: "",
      definitionsSummary: "",
      dependenciesSummary: "",
    };
  }

  const summary = status.summary;

  // Build file summary
  const langBreakdown = Object.entries(summary.languages)
    .map(([lang, count]) => `${count} ${lang} files`)
    .join(", ");

  const filesSummary = `${summary.total_files} files indexed (${langBreakdown})`;

  // Build definitions summary
  const definitionsSummary = `${summary.total_definitions} code definitions (functions, classes, types, etc.)`;

  // Build dependencies summary
  const dependenciesSummary = `${summary.total_imports} import relationships between files`;

  // Fetch recent definitions for richer context
  let recentDefs: OrbitDefinition[] = [];
  try {
    const rows = await queryGraph(
      `SELECT d.name, d.kind, d.file_path, d.line_number
       FROM definitions d
       WHERE d.file_path LIKE '${PROJECT_ROOT}%'
       ORDER BY d.line_number DESC
       LIMIT 15`,
    );
    if (rows) {
      recentDefs = rows as OrbitDefinition[];
    }
  } catch {
    // ignore
  }

  const rawSqlResults: Record<string, unknown[]> = {};
  if (recentDefs.length > 0) {
    rawSqlResults["recent_definitions"] = recentDefs;
  }

  return {
    available: true,
    filesSummary,
    definitionsSummary,
    dependenciesSummary,
    rawSqlResults,
  };
}
