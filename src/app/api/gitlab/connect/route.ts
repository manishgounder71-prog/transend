import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, token, projectId, gitlabUrl = "https://gitlab.com/api/v4", ref = "main", pipelineId } = body;

    if (!token || !projectId) {
      // Demo mode: return mock data when no credentials are provided
      if (action === "verify") {
        return NextResponse.json({
          status: "connected",
          projectName: "Orbit CTO X Demo Project",
          description: "This is a demo project showing the GitLab integration capabilities of Orbit CTO X. Connect your real GitLab project to unlock live pipeline monitoring and CI/CD triggers.",
          webUrl: "https://gitlab.com/orbit-cto/demo",
          starCount: 42,
          owner: "Orbit CTO X",
          path: "orbit-cto/demo-project"
        });
      }
      if (action === "pipelines") {
        return NextResponse.json({
          pipelines: [
            { id: 1001, status: "success", ref: "main", sha: "8c9b2a1f", commitMessage: "feat: add database connection pooling auto-scaling", webUrl: "https://gitlab.com/orbit-cto/demo/-/pipelines/1001", createdAt: new Date().toISOString() },
            { id: 1000, status: "failed", ref: "main", sha: "7f4c3d2e", commitMessage: "fix(auth): adjust connection pool timeouts to 50", webUrl: "https://gitlab.com/orbit-cto/demo/-/pipelines/1000", createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: 999, status: "running", ref: "develop", sha: "3d5a2f1c", commitMessage: "chore: update Helm charts for active-active scaling", webUrl: "https://gitlab.com/orbit-cto/demo/-/pipelines/999", createdAt: new Date(Date.now() - 7200000).toISOString() },
            { id: 998, status: "success", ref: "main", sha: "1a2b3c4d", commitMessage: "docs: update PRD and TRD files for release v1.12", webUrl: "https://gitlab.com/orbit-cto/demo/-/pipelines/998", createdAt: new Date(Date.now() - 86400000).toISOString() }
          ]
        });
      }
      if (action === "trigger") {
        return NextResponse.json({
          message: "Demo mode: pipeline trigger simulated.",
          pipelineId: Math.floor(Math.random() * 9000) + 1000,
          status: "pending",
          ref: ref || "main",
          sha: "demo-simulated-sha"
        });
      }
      if (action === "status") {
        return NextResponse.json({
          id: pipelineId || 1001,
          status: "success",
          ref: ref || "main",
          sha: "demo-simulated-sha",
          duration: Math.floor(Math.random() * 120) + 30,
          finishedAt: new Date().toISOString()
        });
      }
      return NextResponse.json({ error: "Access Token and Project ID are required." }, { status: 400 });
    }

    const headers = {
      "PRIVATE-TOKEN": token
    };

    // ACTION 1: VERIFY CONNECTION & FETCH PROJECT INFO
    if (action === "verify") {
      const response = await fetch(`${gitlabUrl}/projects/${projectId}`, { headers });
      if (!response.ok) {
        return NextResponse.json({ error: `Connection failed: ${response.statusText}` }, { status: response.status });
      }
      const data = await response.json();
      return NextResponse.json({
        status: "connected",
        projectName: data.name,
        description: data.description || "No description provided.",
        webUrl: data.web_url,
        starCount: data.star_count,
        owner: data.namespace?.name || "GitLab Namespace",
        path: data.path_with_namespace
      });
    }

    // ACTION 2: LIST RECENT PIPELINES
    if (action === "pipelines") {
      const response = await fetch(`${gitlabUrl}/projects/${projectId}/pipelines?per_page=8`, { headers });
      if (!response.ok) {
        return NextResponse.json({ error: `Failed to fetch pipelines: ${response.statusText}` }, { status: response.status });
      }
      const data = await response.json();
      
      // Let's query details (commit message) for each pipeline to make it premium
      const enrichedPipelines = await Promise.all(
        data.map(async (pipe: { id: number; status: string; ref: string; sha: string; web_url: string; created_at: string }) => {
          try {
            // Fetch associated commit
            const commitRes = await fetch(`${gitlabUrl}/projects/${projectId}/repository/commits/${pipe.sha}`, { headers });
            const commitData = commitRes.ok ? await commitRes.json() : null;
            return {
              id: pipe.id,
              status: pipe.status,
              ref: pipe.ref,
              sha: pipe.sha.substring(0, 8),
              commitMessage: commitData ? commitData.title : "Running pipeline integrations...",
              webUrl: pipe.web_url,
              createdAt: pipe.created_at
            };
          } catch {
            return {
              id: pipe.id,
              status: pipe.status,
              ref: pipe.ref,
              sha: pipe.sha.substring(0, 8),
              commitMessage: "Pipeline checks ongoing...",
              webUrl: pipe.web_url,
              createdAt: pipe.created_at
            };
          }
        })
      );

      return NextResponse.json({ pipelines: enrichedPipelines });
    }

    // ACTION 3: TRIGGER NEW PIPELINE RUN
    if (action === "trigger") {
      const response = await fetch(`${gitlabUrl}/projects/${projectId}/pipeline?ref=${ref}`, {
        method: "POST",
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({ 
          error: `Trigger failed: ${response.statusText}`, 
          details: errorData.message || "Unknown GitLab CI error"
        }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json({
        message: "Pipeline successfully triggered.",
        pipelineId: data.id,
        status: data.status,
        ref: data.ref,
        sha: data.sha.substring(0, 8)
      });
    }

    // ACTION 4: CHECK SPECIFIC PIPELINE STATUS & LOGS
    if (action === "status") {
      if (!pipelineId) {
        return NextResponse.json({ error: "Pipeline ID is required for status checks." }, { status: 400 });
      }

      const response = await fetch(`${gitlabUrl}/projects/${projectId}/pipelines/${pipelineId}`, { headers });
      if (!response.ok) {
        return NextResponse.json({ error: `Status check failed: ${response.statusText}` }, { status: response.status });
      }
      
      const data = await response.json();
      return NextResponse.json({
        id: data.id,
        status: data.status,
        ref: data.ref,
        sha: data.sha.substring(0, 8),
        duration: data.duration || 0,
        finishedAt: data.finished_at
      });
    }

    return NextResponse.json({ error: "Invalid action parameter." }, { status: 400 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Proxy server failed", details: message }, { status: 500 });
  }
}
