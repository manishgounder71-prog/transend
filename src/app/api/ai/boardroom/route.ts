import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { withGoogleSearchGrounding, extractGroundingSources } from "@/lib/rag";
import { buildProjectContext } from "@/lib/project-context";

const BoardroomDebateSchema = z.object({
  lines: z.array(
    z.object({
      sender: z.enum(["ceo", "cto", "ciso", "qa", "devops", "product"]),
      text: z.string().min(10),
    })
  ).length(7),
  votes: z.object({
    ceo: z.enum(["SHIP", "DEPLOY", "DELAY", "HOLD", "APPROVE", "YES", "NO"]),
    cto: z.enum(["SHIP", "DEPLOY", "DELAY", "HOLD", "APPROVE", "YES", "NO"]),
    ciso: z.enum(["SHIP", "DEPLOY", "DELAY", "HOLD", "APPROVE", "YES", "NO"]),
    qa: z.enum(["SHIP", "DEPLOY", "DELAY", "HOLD", "APPROVE", "YES", "NO"]),
    devops: z.enum(["SHIP", "DEPLOY", "DELAY", "HOLD", "APPROVE", "YES", "NO"]),
    product: z.enum(["SHIP", "DEPLOY", "DELAY", "HOLD", "APPROVE", "YES", "NO"]),
  }),
  consensus: z.number().min(0).max(100),
  verdict: z.string().min(10),
});

const boardroomPersonas = {
  ceo: "CEO Agent (Chief Executive Officer) — focused on business strategy, revenue, market positioning, and final decision-making. Authoritative and decisive.",
  cto: "CTO Agent (Chief Technology Officer) — focused on technical architecture, engineering tradeoffs, system design, and code quality. Analytical and detail-oriented.",
  ciso: "CISO Agent (Security CISO Agent) — focused on threat modeling, vulnerability assessment, compliance, and security risk. Cautious and thorough.",
  qa: "QA Director (QA Director Agent) — focused on test coverage, regression risks, staging validation, and quality gates. Pragmatic and metric-driven.",
  devops: "DevOps Lead (DevOps SRE Agent) — focused on infrastructure, deployment pipelines, scalability, and operational reliability. Hands-on and practical.",
  product: "Product Lead (Product Strategy Lead) — focused on customer needs, market timing, feature prioritization, and business impact. Empathetic and strategic.",
};


function buildSystemPrompt(): string {
  const personaDescriptions = Object.entries(boardroomPersonas)
    .map(([id, desc]) => `${id.toUpperCase()} — ${desc}`)
    .join("\n");

  return `You are orchestrating a simulated boardroom debate among 6 AI executive agents.

Each agent has a distinct personality, expertise, and agenda. They must debate the given topic as if in a real meeting, with realistic tensions and tradeoffs.

## Agent Personas
${personaDescriptions}

## Debate Format
The debate must follow this exact speaker order with EXACTLY 7 lines total:
1. CEO — opens the debate, states the decision to be made, asks for input
2. CTO — provides technical analysis
3. CISO — provides security assessment
4. QA — provides testing/quality assessment
5. DevOps — provides infrastructure/operations assessment
6. Product — provides market/customer perspective
7. CEO — synthesizes the discussion, announces the decision, and provides final verdict

## Output Rules
- Each line MUST be from the perspective of that specific agent persona
- Lines should be 1-3 sentences, substantive and role-appropriate
- The CEO's final line should reference what other agents said
- Votes should reflect the positions argued in the debate (not all the same)
- Consensus should reflect how many agreed (not always 100%)
- The verdict should summarize the outcome based on what was actually debated
- Make the debate feel natural with realistic technical details and business considerations

## JSON Output Format
You must output ONLY a valid JSON object with NO markdown formatting, no code fences, no extra text before or after. The JSON must match this exact schema:
{
  "lines": [
    { "sender": "ceo", "text": "..." },
    { "sender": "cto", "text": "..." },
    { "sender": "ciso", "text": "..." },
    { "sender": "qa", "text": "..." },
    { "sender": "devops", "text": "..." },
    { "sender": "product", "text": "..." },
    { "sender": "ceo", "text": "..." }
  ],
  "votes": {
    "ceo": "SHIP|DEPLOY|DELAY|HOLD|APPROVE|YES|NO",
    "cto": "SHIP|DEPLOY|DELAY|HOLD|APPROVE|YES|NO",
    "ciso": "SHIP|DEPLOY|DELAY|HOLD|APPROVE|YES|NO",
    "qa": "SHIP|DEPLOY|DELAY|HOLD|APPROVE|YES|NO",
    "devops": "SHIP|DEPLOY|DELAY|HOLD|APPROVE|YES|NO",
    "product": "SHIP|DEPLOY|DELAY|HOLD|APPROVE|YES|NO"
  },
  "consensus": 0-100,
  "verdict": "..."
}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic } = body as { topic: string };

    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return NextResponse.json(
        { error: "Topic must be at least 3 characters." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Fallback: if no API key, return a polite error the client can handle
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GOOGLE_GENERATIVE_AI_API_KEY not configured. Using local debate scripts.",
          needsFallback: true,
        },
        { status: 503 }
      );
    }

    const systemPrompt = buildSystemPrompt();

    // Fetch project context (recent commits + incidents) for grounding
    const baseUrl = new URL(request.url).origin;
    const { contextString, sourceCounts } = await buildProjectContext(baseUrl);

    const userPrompt = `Debate topic: "${topic.trim()}"${contextString}

Generate a realistic boardroom debate following the format rules. Each agent should speak from their persona's perspective, with realistic technical depth and business considerations. Ground your arguments in the Project Context data above (commits, incidents, pipelines) where relevant. Use Google Search to supplement with real-world benchmarks and industry best practices — especially if the project context is limited.\n\nOutput ONLY the JSON object with no extra text.`;

    const { text, providerMetadata } = await generateText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
      tools: withGoogleSearchGrounding(),
    });

    // Parse and validate the JSON response
    const parsed = JSON.parse(text);
    const object = BoardroomDebateSchema.parse(parsed);

    // Extract grounding sources
    const groundingSources = extractGroundingSources(
      providerMetadata as Record<string, unknown> | undefined
    );

    return NextResponse.json({
      ...object,
      title: topic,
      groundingSources,
      projectContext: sourceCounts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Boardroom AI generation failed:", message);

    return NextResponse.json(
      {
        error: "AI generation failed. Using local debate scripts.",
        needsFallback: true,
        details: message,
      },
      { status: 503 }
    );
  }
}
