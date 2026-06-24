import { chunkDocument } from "./chunk";
import { createEmbedding, createEmbeddings } from "./embed";
import { upsertChunk, deleteChunksBySource, searchSimilarChunks, getChunkCount, getSourceSummary, initRagTables } from "./store";

export interface RagSearchResult {
  id: string;
  text: string;
  sourceFile: string;
  metadata: Record<string, string>;
  similarity: number;
}

export interface RagSourceSummary {
  sourceFile: string;
  count: number;
}

/**
 * Ingest a document into the RAG vector store.
 * - Splits the text into overlapping chunks
 * - Creates embeddings via Gemini
 * - Stores everything in SQLite
 */
export async function ingestDocument(
  text: string,
  sourceFile: string,
  metadata: Record<string, string> = {},
): Promise<{ chunksCount: number; embeddedCount: number }> {
  initRagTables();

  // Remove any previously indexed chunks for this source
  deleteChunksBySource(sourceFile);

  // Chunk the document
  const chunks = chunkDocument(text, sourceFile, metadata);

  if (chunks.length === 0) {
    return { chunksCount: 0, embeddedCount: 0 };
  }

  // Create embeddings in batch
  const texts = chunks.map((c) => c.text);
  const embeddings = await createEmbeddings(texts);

  // Store each chunk (with or without embedding)
  let embeddedCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const emb = embeddings?.[i] ?? null;
    if (emb) embeddedCount++;
    upsertChunk(chunks[i].id, chunks[i].sourceFile, chunks[i].text, chunks[i].metadata, emb);
  }

  return { chunksCount: chunks.length, embeddedCount };
}

/**
 * Search the RAG vector store for chunks semantically similar to the query.
 * Returns results sorted by similarity (highest first).
 */
export async function searchKnowledgeBase(
  query: string,
  topK = 8,
  minSimilarity = 0.3,
): Promise<RagSearchResult[]> {
  initRagTables();

  const queryEmbedding = await createEmbedding(query);
  if (!queryEmbedding) return [];

  const results = searchSimilarChunks(queryEmbedding, topK, minSimilarity);

  return results.map(({ chunk, similarity }) => ({
    id: chunk.id,
    text: chunk.chunk_text,
    sourceFile: chunk.source_file,
    metadata: JSON.parse(chunk.metadata_json || "{}"),
    similarity,
  }));
}

/**
 * Get a summary of all indexed documents.
 */
export function getIndexSummary(): { totalChunks: number; sources: RagSourceSummary[] } {
  initRagTables();
  return {
    totalChunks: getChunkCount(),
    sources: getSourceSummary(),
  };
}
