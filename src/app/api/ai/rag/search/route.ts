import { NextResponse } from "next/server";
import { searchKnowledgeBase, getIndexSummary } from "@/lib/rag/index";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY not configured. RAG requires an API key for embeddings.", needsApiKey: true },
        { status: 503 },
      );
    }

    const { query, topK, minSimilarity } = (await request.json()) as {
      query: string;
      topK?: number;
      minSimilarity?: number;
    };

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query must be a non-empty string." },
        { status: 400 },
      );
    }

    const results = await searchKnowledgeBase(query, topK ?? 8, minSimilarity ?? 0.3);
    const summary = getIndexSummary();

    return NextResponse.json({
      results,
      totalResults: results.length,
      indexSummary: summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("RAG search failed:", message);
    return NextResponse.json({ error: "Search failed.", details: message }, { status: 500 });
  }
}

/** GET returns the current index summary without searching. */
export async function GET() {
  try {
    const summary = getIndexSummary();
    return NextResponse.json({ indexSummary: summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to get index summary.", details: message }, { status: 500 });
  }
}
