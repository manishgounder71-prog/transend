import { NextResponse } from "next/server";
import { queryGraph, getOrbitStatus } from "@/lib/orbit";

export const dynamic = "force-dynamic";

/**
 * POST /api/orbit/query
 *
 * Execute a read-only SQL query against the GitLab Orbit
 * knowledge graph. Only SELECT queries are allowed.
 *
 * Body: { sql: string }
 */
export async function POST(request: Request) {
  try {
    const { sql } = (await request.json()) as { sql: string };

    if (!sql || typeof sql !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'sql' field in request body." },
        { status: 400 },
      );
    }

    // Only allow SELECT queries for safety
    const trimmed = sql.trim().toUpperCase();
    if (!trimmed.startsWith("SELECT")) {
      return NextResponse.json(
        { error: "Only SELECT queries are allowed." },
        { status: 403 },
      );
    }

    // Check if Orbit is available first
    const status = await getOrbitStatus();
    if (!status.available || !status.graph_exists) {
      return NextResponse.json(
        {
          error: "Orbit graph is not available.",
          status,
          hint: "Run 'orbit index .' to index this project, or use DEMO mode with simulated data.",
        },
        { status: 503 },
      );
    }

    const results = await queryGraph(sql);

    if (results === null) {
      return NextResponse.json(
        { error: "Query failed. The Orbit graph may not have the expected schema." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      rows: results,
      rowCount: results.length,
      sql: sql.trim(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Orbit query failed:", message);
    return NextResponse.json(
      { error: "Orbit query failed.", details: message },
      { status: 500 },
    );
  }
}
