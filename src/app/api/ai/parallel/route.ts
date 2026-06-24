import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { withGoogleSearchGrounding, extractGroundingSources } from "@/lib/rag";

const BranchSchema = z.object({
  name: z.string().min(3),
  probability: z.string(),
  revenue: z.string(),
  incidents: z.string(),
  velocity: z.string(),
  vulnerabilities: z.string(),
  theme: z.enum(["cyan", "purple", "warning"]),
  narrative: z.string().min(10),
});

const ParallelSimulationSchema = z.object({
  branches: z.array(BranchSchema).length(3),
  scenarioAnalysis: z.string().min(10),
  metricsSummary: z.object({
    bestCaseProbability: z.number().min(0).max(100),
    worstCaseProbability: z.number().min(0).max(100),
    expectedRevenueImpact: z.string(),
    primaryRisk: z.string(),
  }),
});

const scenarioPersonas = {
  optimistic: "Universe A — The Optimistic Branch: assumes best-case conditions, successful mitigation, and favorable market response. Represents the upside potential with probability-weighted optimism.",
  nominal: "Universe B — The Nominal/Moderate Branch: assumes average conditions, standard operational risks, and typical business outcomes. Represents the most likely path.",
  pessimistic: "Universe C — The Pessimistic/Worst-Case Branch: assumes adverse conditions, cascading failures, and worst-case market response. Represents downside risk.",
};

function buildSystemPrompt(): string {
  const personaDescriptions = Object.entries(scenarioPersonas)
    .map(([id, desc]) => `${id.toUpperCase()} — ${desc}`)
    .join("\n\n");

  return `You are a strategic AI simulation engine that models how software engineering decisions impact business and technical outcomes across 3 parallel universe branches.

For any given scenario, you generate 3 distinct future branches (Optimistic, Nominal, Pessimistic) with realistic, internally consistent metrics.

## Branch Personas
${personaDescriptions}

## Output Rules
- Each branch MUST have a unique, descriptive name (not just "Universe A", "Universe B", "Universe C")
- Probability should be a string like "72% PROBABILITY"
- Revenue should be a realistic dollar figure with context, e.g. "+$84k (Sprint Acceleration)" or "-$24k (Lost Revenue)"
- Incidents should be a percentage with context, e.g. "3% (All Clear)" or "68% (DB Lock Risk)"
- Velocity should describe engineering throughput impact, e.g. "+22% (Team Boost)" or "-15% (Context Switching)"
- Vulnerabilities should describe security impact, e.g. "0 (All Patched)" or "3 (Unreviewed)"
- Theme must match the branch: "cyan" for optimistic, "purple" for nominal, "warning" for pessimistic
- Narrative is a 1-2 sentence explanation of why this branch plays out this way
- scenarioAnalysis is a brief overall strategic assessment of the scenario
- Probabilities across branches should sum to approximately 100%
- Make the simulation feel data-driven and realistic with specific numbers

## JSON Output Format
You must output ONLY a valid JSON object with NO markdown formatting, no code fences, no extra text before or after. The JSON must match this exact schema:
{
  "branches": [
    {
      "name": "...",
      "probability": "...",
      "revenue": "...",
      "incidents": "...",
      "velocity": "...",
      "vulnerabilities": "...",
      "theme": "cyan|purple|warning",
      "narrative": "..."
    }
  ],
  "scenarioAnalysis": "...",
  "metricsSummary": {
    "bestCaseProbability": 0-100,
    "worstCaseProbability": 0-100,
    "expectedRevenueImpact": "...",
    "primaryRisk": "..."
  }
}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenario } = body as { scenario: string };

    if (!scenario || typeof scenario !== "string" || scenario.trim().length < 3) {
      return NextResponse.json(
        { error: "Scenario must be at least 3 characters." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GOOGLE_GENERATIVE_AI_API_KEY not configured. Using local simulation engine.",
          needsFallback: true,
        },
        { status: 503 }
      );
    }

    const systemPrompt = buildSystemPrompt();

    const userPrompt = `Simulate the following software engineering decision scenario across 3 parallel universe branches:

Scenario: "${scenario.trim()}"

Generate a realistic, data-driven simulation with specific numerical projections for each branch. Use Google Search to ground your projections in real-world engineering metrics, industry benchmarks, and current market trends relevant to this scenario. Each branch should tell a coherent story about how the decision plays out.

Output ONLY the JSON object with no extra text.`;

    const { text, providerMetadata } = await generateText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
      tools: withGoogleSearchGrounding(),
    });

    // Parse and validate the JSON response
    const parsed = JSON.parse(text);
    const object = ParallelSimulationSchema.parse(parsed);

    // Extract grounding sources
    const groundingSources = extractGroundingSources(
      providerMetadata as Record<string, unknown> | undefined
    );

    return NextResponse.json({ ...object, groundingSources });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Parallel simulation AI generation failed:", message);

    return NextResponse.json(
      {
        error: "AI simulation failed. Using local simulation engine.",
        needsFallback: true,
        details: message,
      },
      { status: 503 }
    );
  }
}
