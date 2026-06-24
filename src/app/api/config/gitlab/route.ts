import { NextResponse } from "next/server";
import { getGitLabConfig, upsertGitLabConfig, deleteGitLabConfig, initDb } from "@/lib/db";

// Initialize the database on first API call
try {
  initDb();
} catch {
  // DB might not be available during build
}

// GET /api/config/gitlab — retrieve stored GitLab config
export async function GET() {
  try {
    const config = getGitLabConfig();

    if (!config) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({
      config: {
        projectId: config.project_id,
        token: config.token,
        gitlabUrl: config.gitlab_url,
        branch: config.branch,
      },
    });
  } catch (error) {
    console.error("Failed to fetch GitLab config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration." },
      { status: 500 }
    );
  }
}

// POST /api/config/gitlab — save or update GitLab config
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, token, gitlabUrl, branch } = body as {
      projectId?: string;
      token?: string;
      gitlabUrl?: string;
      branch?: string;
    };

    if (!projectId || !token) {
      return NextResponse.json(
        { error: "projectId and token are required." },
        { status: 400 }
      );
    }

    upsertGitLabConfig(
      projectId,
      token,
      gitlabUrl || "https://gitlab.com/api/v4",
      branch || "main"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save GitLab config:", error);
    return NextResponse.json(
      { error: "Failed to save configuration." },
      { status: 500 }
    );
  }
}

// DELETE /api/config/gitlab — remove stored GitLab config
export async function DELETE() {
  try {
    deleteGitLabConfig();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete GitLab config:", error);
    return NextResponse.json(
      { error: "Failed to delete configuration." },
      { status: 500 }
    );
  }
}
