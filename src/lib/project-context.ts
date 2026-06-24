// ── Project Context for AI Grounding ────────────
// Fetches recent commits from the GitLab integration,
// queries the GitLab Orbit knowledge graph for code-level context,
// and formats incident data as injectable prompt context.

import { buildOrbitContext, formatOrbitContextForPrompt, simulateOrbitContext } from "@/lib/orbit";

interface Commit {
  short_id: string;
  title: string;
  author_name: string;
  committed_date: string;
}

interface PipelineEvent {
  id: number;
  status: string;
  ref: string;
  sha: string;
  commitMessage: string;
  createdAt: string;
}

// ── GitLab Commits ──────────────────────────────

async function fetchRecentCommits(baseUrl: string): Promise<Commit[]> {
  try {
    const url = new URL("/api/gitlab/commits", baseUrl);
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.commits ?? [];
  } catch {
    return [];
  }
}

// ── GitLab Pipelines ────────────────────────────

async function fetchRecentPipelines(baseUrl: string): Promise<PipelineEvent[]> {
  try {
    // Try loading stored GitLab config first
    const configRes = await fetch(new URL("/api/config/gitlab", baseUrl).toString(), {
      signal: AbortSignal.timeout(3000),
    });
    const configData = await configRes.json();
    const config = configData?.config;

    if (!config?.projectId || !config?.token) return [];

    const connectRes = await fetch(new URL("/api/gitlab/connect", baseUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "pipelines",
        token: config.token,
        projectId: config.projectId,
        gitlabUrl: config.gitlabUrl,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!connectRes.ok) return [];

    const connectData = await connectRes.json();
    return connectData.pipelines ?? [];
  } catch {
    return [];
  }
}

// ── Known Incident Data ─────────────────────────
// Hardcoded sample incidents that represent the app's demo narrative.
// In production, this could pull from an incident database.

const SAMPLE_INCIDENTS = [
  {
    id: "INC-4029",
    severity: "P1 Critical",
    date: "June 20, 2026",
    summary:
      "Primary Kubernetes ingress controller recorded a surge in 504 Gateway Timeouts at /v1/auth/verify. Database pooling parameters limited query concurrency to 10 connections. Heavy webhook transactions triggered a pool lockout.",
    rootCause:
      "Auth-service thread allocation throttled inside prisma/schema.prisma configurations. Auto-scaling rules recycled containers but thread limitations starved query completions.",
    mitigation:
      "CTO-X Autonomous Agent performed remediations including disconnecting replica-1 query loops, generating connection limit upgrade patches (connection_limit=50), triggering emergency GitLab CI/CD builds, restoring uptime within 2.5 minutes.",
    timeline: [
      "11:04:12 — Outage warning dispatched via Prometheus logs.",
      "11:04:35 — CISO Agent isolated target container blocks.",
      "11:05:10 — Automated schema parameter patches compiled.",
      "11:05:45 — Rolling upgrades completed successfully. API restored.",
    ],
  },
  {
    id: "RELEASE-v1.12",
    severity: "P3 Minor",
    date: "June 20, 2026",
    summary:
      "Release v1.12.80 — Auth service connection pool configuration update. Database thread limit increased from 10 to 50. Security patches for nginx ingress CVE vulnerabilities. Confidence: 84% Safe to Ship.",
    rootCause:
      "Post-INC-4029 remediation: connection_limit parameter was permanently updated in prisma/schema.prisma to prevent recurrence.",
    mitigation:
      "Staged rollout with 2-week monitoring window. Rollback plan documented. Deployment risk elevated due to auth-service changes (88% risk index) but rollback risk low at 12%.",
    timeline: [
      "Deployment approved with staged rollout across 3 clusters.",
      "Monitoring window: 2 weeks.",
      "Post-deployment audit passed.",
    ],
  },
];

// ── Context Builder ─────────────────────────────

function formatIncidents(): string {
  return SAMPLE_INCIDENTS
    .map(
      (inc) =>
        `[${inc.severity}] ${inc.id} (${inc.date})
  Summary: ${inc.summary}
  Root Cause: ${inc.rootCause}
  Mitigation: ${inc.mitigation}
  Timeline:
${inc.timeline.map((t) => `    • ${t}`).join("\n")}`
    )
    .join("\n\n");
}

export async function buildProjectContext(baseUrl: string): Promise<{
  contextString: string;
  sourceCounts: { commits: number; pipelines: number; incidents: number; orbitFiles?: number; orbitDefinitions?: number };
}> {
  const [commits, pipelines, orbitCtx] = await Promise.all([
    fetchRecentCommits(baseUrl),
    fetchRecentPipelines(baseUrl),
    buildOrbitContext(),
  ]);

  const parts: string[] = [];
  const sourceCounts = {
    commits: commits.length,
    pipelines: pipelines.length,
    incidents: SAMPLE_INCIDENTS.length,
    orbitFiles: orbitCtx.available ? parseInt(orbitCtx.filesSummary.match(/^(\d+)/)?.[1] || "0") : 0,
    orbitDefinitions: orbitCtx.available ? parseInt(orbitCtx.definitionsSummary.match(/^(\d+)/)?.[1] || "0") : 0,
  };

  // Summary header so the model knows what data it received
  const summaries: string[] = [];
  if (commits.length > 0) summaries.push(`${commits.length} recent commits`);
  if (pipelines.length > 0) summaries.push(`${pipelines.length} pipeline events`);
  if (orbitCtx.available) summaries.push(`${orbitCtx.filesSummary}`);
  summaries.push(`${SAMPLE_INCIDENTS.length} known incidents`);

  parts.push(`Source Summary: ${summaries.join(", ")}.`);

  if (commits.length > 0) {
    const commitLines = commits
      .slice(0, 10)
      .map(
        (c) =>
          `  • ${c.short_id} — ${c.title} (by ${c.author_name}, ${new Date(c.committed_date).toLocaleDateString()})`
      )
      .join("\n");

    parts.push(
      `## Recent Git Commits (${commits.length} total)\n${commitLines}`
    );
  } else {
    parts.push(`## Recent Git Commits\n  GitLab integration not connected — no recent commits available.`);
  }

  if (pipelines.length > 0) {
    const pipelineLines = pipelines
      .slice(0, 5)
      .map(
        (p) =>
          `  • Pipeline #${p.id} — ${p.commitMessage} [${p.status}] on ${p.ref}`
      )
      .join("\n");

    parts.push(
      `## Recent Pipeline Activity\n${pipelineLines}`
    );
  } else {
    parts.push(`## Recent Pipeline Activity\n  No recent pipeline data available.`);
  }

  parts.push(
    `## Known Incidents & Events\n${formatIncidents()}`
  );

  // Add GitLab Orbit knowledge graph context if available
  if (orbitCtx.available) {
    parts.push(formatOrbitContextForPrompt(orbitCtx));
  }

  const contextString = `\n\n## Project Context (Grounding Data)\n${parts.join("\n\n")}\n`;

  return { contextString, sourceCounts };
}
