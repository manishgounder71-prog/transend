import { NextResponse } from "next/server";
import { indexProject, getOrbitStatus } from "@/lib/orbit";

export const dynamic = "force-dynamic";

/**
 * POST /api/orbit/index
 *
 * Triggers the `orbit index` command on the current project
 * directory. This builds the local DuckDB knowledge graph.
 *
 * Body (optional): { targetPath?: string }
 */
export async function POST(request: Request) {
  try {
    // Check if Orbit CLI is installed first
    const status = await getOrbitStatus();

    if (!status.installed) {
      return NextResponse.json(
        {
          error: "GitLab Orbit CLI is not installed.",
          hint: "Install it with: curl -fsSL https://gitlab.com/gitlab-org/orbit/knowledge-graph/-/raw/main/install.sh | bash",
        },
        { status: 503 },
      );
    }

    let targetPath: string | undefined;
    try {
      const body = (await request.json()) as { targetPath?: string };
      targetPath = body.targetPath;
    } catch {
      // No body — index the current project
    }

    const success = await indexProject(targetPath);

    if (!success) {
      return NextResponse.json(
        { error: "Indexing failed. Check that the orbit CLI is properly installed." },
        { status: 500 },
      );
    }

    // Re-check status after indexing
    const updatedStatus = await getOrbitStatus();

    return NextResponse.json({
      message: "Project indexed successfully into GitLab Orbit knowledge graph.",
      indexed: true,
      status: updatedStatus,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Orbit indexing failed:", message);
    return NextResponse.json(
      { error: "Orbit indexing failed.", details: message },
      { status: 500 },
    );
  }
}
