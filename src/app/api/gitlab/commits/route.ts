import { NextResponse } from "next/server";

export async function GET() {
  const gitlabUrl = process.env.GITLAB_API_URL || "https://gitlab.com/api/v4";
  const accessToken = process.env.GITLAB_ACCESS_TOKEN;
  const projectId = process.env.GITLAB_PROJECT_ID;

  // Fallback / Sample response if environment variables are not set
  if (!accessToken || !projectId) {
    return NextResponse.json({
      status: "offline",
      message: "GitLab environment variables not set. Showing sample data.",
      commits: [
        {
          id: "mock_commit_1",
          short_id: "8c9b2a1f",
          title: "docs: update PRD and TRD files for release v1.12",
          author_name: "Arianna Haradon",
          committed_date: new Date().toISOString()
        },
        {
          id: "mock_commit_2",
          short_id: "7f4c3d2e",
          title: "fix(auth): adjust database connection pool timeouts to 50",
          author_name: "Lee Tickett",
          committed_date: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        },
        {
          id: "mock_commit_3",
          short_id: "3d5a2f1c",
          title: "chore: update Helm charts for active-active replica scaling",
          author_name: "DevOps Lead",
          committed_date: new Date(Date.now() - 1000 * 60 * 35).toISOString()
        }
      ]
    });
  }

  // Fetch real commits from GitLab API
  const endpoint = `${gitlabUrl}/projects/${projectId}/repository/commits`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        "PRIVATE-TOKEN": accessToken
      },
      next: { revalidate: 60 } // Cache results for 60 seconds
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitLab API responded with status ${response.status}` },
        { status: response.status }
      );
    }

    const commits = await response.json() as Array<{ id: string; short_id: string; title: string; author_name: string; committed_date: string }>;
    return NextResponse.json({
      status: "connected",
      message: "Successfully synchronized with GitLab Orbit.",
      commits: commits.map((c) => ({
        id: c.id,
        short_id: c.short_id,
        title: c.title,
        author_name: c.author_name,
        committed_date: c.committed_date
      }))
    });  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: message }, { status: 500 }
    );
  }
}
