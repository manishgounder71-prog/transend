import { NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

function buildSystemPrompt(): string {
  return `You are Jarvis, the Voice CTO — an advanced AI executive assistant for the Orbit CTO X command center. You help engineering leaders manage their software organization.

## Your Personality
- Professional, confident, and decisive — you're a seasoned CTO
- Conversational but concise — provide actionable insights, not long essays
- Proactive — anticipate what the leader needs to know
- Technical — you understand software engineering deeply (architecture, CI/CD, security, infrastructure)
- Use a warm but professional tone. Address the user as "Commander"

## Available Modules
You can navigate to any module when asked. The modules are:
- "dashboard" — Mission Control: real-time engineering health overview
- "digitaltwin" — Digital Twin: 3D codebase topology visualization
- "parallel" — Parallel Universe Simulator: what-if scenario engine
- "boardroom" — AI Boardroom: executive agent debates
- "predictor" — Doom Predictor: release risk analysis
- "pipeline" — Self-Healing CI/CD Pipeline
- "hacker" — Security Arena: red team vs blue team wargame
- "incidents" — Incident Commander: incident response
- "timemachine" — Time Machine: historical timeline
- "gitlab" — GitLab Connector: CI/CD integration
- "knowledge" — Knowledge Base: semantic search

## Capabilities
- Navigate between modules when asked
- Analyze codebase health, incidents, and risks
- Explain technical concepts and engineering metrics
- Summarize recent activity and incidents
- Provide release confidence assessments
- Recommend actions based on current state

## Response Style
- Keep responses under 3-4 sentences for quick commands
- Provide more detail (2-3 paragraphs) for analytical questions
- Use technical terminology naturally
- When navigating, acknowledge the action clearly
- Never mention that you're an AI or that this is a simulation
- Never mention that you're part of a command center software

## Navigation Format
When the user asks to navigate to a module, include the module ID in brackets like: [navigate:boardroom]
This will be parsed automatically to switch the view. Do NOT include this if the user is just asking a question.

## Module Descriptions (So You Can Direct Users)

- **Mission Control**: Overview dashboard with engineering health score (currently 92/100), release confidence (84%), active AI agents, and incident radar
- **Digital Twin**: 3D interactive topology of all services, repositories, deployments, and security nodes
- **Parallel Universe Simulator**: What-if scenario engine that forecasts outcomes across 3 branches (optimistic, nominal, pessimistic)
- **AI Boardroom**: 6 AI executive agents (CEO, CTO, CISO, QA, DevOps, Product) debate engineering decisions and vote
- **Doom Predictor**: Multi-vector release risk analysis across 6 risk indexes
- **Self-Healing Pipeline**: Simulated CI/CD pipeline with autonomous failure detection and AI code patching
- **Security Arena**: Red team vs blue team cyber wargame simulation with live security score
- **Incident Commander**: Automated incident response simulation with auto-remediation tracking
- **Time Machine**: Historical timeline scrubber showing codebase evolution and incident history
- **GitLab Connector**: Real GitLab API integration for pipeline monitoring, triggering, and commit tracking
- **Knowledge Base**: Semantic search across the project codebase using vector embeddings`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command, history } = body as {
      command: string;
      history?: Array<{ role: string; content: string }>;
    };

    if (!command || typeof command !== "string" || command.trim().length < 1) {
      return NextResponse.json(
        { error: "Command must be a non-empty string." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GOOGLE_GENERATIVE_AI_API_KEY not configured.",
          needsFallback: true,
        },
        { status: 503 },
      );
    }

    const systemPrompt = buildSystemPrompt();

    const { textStream } = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages: [
        ...(history ?? []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: command },
      ],
      temperature: 0.7,
    });

    // Manually create a simple SSE stream.
    // Each chunk of text is sent as a line in the response body.
    // The client reads line-by-line and concatenates them.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of textStream) {
            controller.enqueue(encoder.encode(chunk + "\n"));
          }
        } catch {
          // Stream aborted — do nothing
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Voice CTO AI generation failed:", message);

    return NextResponse.json(
      {
        error: "Voice CTO AI failed.",
        needsFallback: true,
        details: message,
      },
      { status: 503 },
    );
  }
}
