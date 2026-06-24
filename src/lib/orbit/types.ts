// ── GitLab Orbit (Knowledge Graph) Types ─────────────────────
// These types represent the data available through the Orbit
// local DuckDB knowledge graph. The schema is introspected
// from the orbit CLI / MCP interface.

/** Represents a source file in the Orbit graph. */
export interface OrbitFile {
  id: string;
  path: string;
  language: string;
  lines: number;
  size_bytes: number;
  last_modified: string;
}

/** A named code definition (function, class, interface, type, etc.). */
export interface OrbitDefinition {
  id: string;
  name: string;
  kind: "function" | "class" | "interface" | "type" | "variable" | "module" | "enum" | "method";
  file_path: string;
  line_number: number;
  visibility?: "public" | "private" | "protected" | "exported";
}

/** A dependency or import between files. */
export interface OrbitImport {
  source_file: string;
  target_file: string;
  symbol_name: string;
  import_type: "named" | "default" | "namespace" | "side_effect";
}

/** Schema summary of the Orbit graph. */
export interface OrbitGraphSchema {
  tables: Array<{
    name: string;
    columns: Array<{ name: string; type: string }>;
  }>;
}

/** Summary of the indexed project. */
export interface OrbitIndexSummary {
  total_files: number;
  total_definitions: number;
  total_imports: number;
  languages: Record<string, number>;
  project_name: string;
  last_indexed: string | null;
}

/** Status of the Orbit integration. */
export interface OrbitStatus {
  available: boolean;
  installed: boolean;
  graph_exists: boolean;
  indexed: boolean;
  summary: OrbitIndexSummary | null;
  error?: string;
}

/** Context result to inject into AI prompts. */
export interface OrbitContextResult {
  available: boolean;
  filesSummary: string;
  definitionsSummary: string;
  dependenciesSummary: string;
  rawSqlResults?: Record<string, unknown[]>;
}

/** MCP tool request to the Orbit local server. */
export interface McpToolRequest {
  jsonrpc: "2.0";
  id: number;
  method: "tools/call";
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

/** MCP tool response from the Orbit local server. */
export interface McpToolResponse {
  jsonrpc: "2.0";
  id: number;
  result: {
    content: Array<{
      type: "text" | "json";
      text?: string;
    }>;
  };
}
