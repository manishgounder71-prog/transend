import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ingestDocument, getIndexSummary } from "@/lib/rag/index";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY not configured. RAG requires an API key for embeddings.", needsApiKey: true },
        { status: 503 },
      );
    }

    const { text, sourceFile, metadata } = (await request.json()) as {
      text: string;
      sourceFile: string;
      metadata?: Record<string, string>;
    };

    if (!text || !sourceFile) {
      return NextResponse.json(
        { error: "Both 'text' and 'sourceFile' fields are required." },
        { status: 400 },
      );
    }

    const result = await ingestDocument(text, sourceFile, metadata ?? {});
    const summary = getIndexSummary();

    return NextResponse.json({
      ingested: result,
      indexSummary: summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("RAG ingest failed:", message);
    return NextResponse.json({ error: "Ingestion failed.", details: message }, { status: 500 });
  }
}

/** GET /api/ai/rag/ingest?file=<relative-path> — returns file contents for indexing. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const fileParam = url.searchParams.get("file");

    if (!fileParam) {
      return NextResponse.json(
        { error: "Provide a 'file' query parameter with the relative project path." },
        { status: 400 },
      );
    }

    // Resolve relative to project root (cwd)
    const resolvedPath = path.resolve(process.cwd(), fileParam);

    // Security: ensure the resolved path is within the project directory
    if (!resolvedPath.startsWith(process.cwd())) {
      return NextResponse.json({ error: "Invalid file path." }, { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: `File not found: ${fileParam}` }, { status: 404 });
    }

    const content = fs.readFileSync(resolvedPath, "utf-8");

    return NextResponse.json({
      file: fileParam,
      content,
      size: content.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to read file.", details: message }, { status: 500 });
  }
}
