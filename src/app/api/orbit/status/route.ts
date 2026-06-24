import { NextResponse } from "next/server";
import { getOrbitStatus } from "@/lib/orbit";
import { simulateOrbitStatus } from "@/lib/orbit/simulated";

export const dynamic = "force-dynamic";

/**
 * GET /api/orbit/status
 *
 * Returns the current status of the GitLab Orbit integration.
 * Attempts real detection first; falls back to simulated status
 * for demo mode when the `orbit` CLI is not installed.
 */
export async function GET() {
  try {
    const realStatus = await getOrbitStatus();

    // If Orbit is actually available, return real status
    if (realStatus.available && realStatus.installed) {
      return NextResponse.json({
        ...realStatus,
        source: "real",
      });
    }

    // Fall back to simulated status for demo mode
    const simulated = simulateOrbitStatus();

    return NextResponse.json({
      ...simulated,
      simulated: true,
      source: "simulated",
      error: realStatus.error,
      installHint: "For real Orbit integration, install the CLI: curl -fsSL https://gitlab.com/gitlab-org/orbit/knowledge-graph/-/raw/main/install.sh | bash",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Orbit status check failed:", message);

    // Always return a response — never 500 on status check
    const simulated = simulateOrbitStatus();
    return NextResponse.json({
      ...simulated,
      simulated: true,
      source: "simulated",
      error: message,
    });
  }
}
