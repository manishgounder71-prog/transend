import { embed, embedMany } from "ai";
import { google } from "@ai-sdk/google";

const EMBEDDING_MODEL = "text-embedding-004";

/**
 * Create an embedding vector for a single text string.
 * Returns null if the API key is missing or the call fails.
 */
export async function createEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("RAG: No GOOGLE_GENERATIVE_AI_API_KEY — skipping embedding.");
    return null;
  }

  try {
    const { embedding: vector } = await embed({
      model: google.embedding(EMBEDDING_MODEL),
      value: text,
    });
    return vector;
  } catch (err) {
    console.error("RAG embedding failed:", err);
    return null;
  }
}

/**
 * Create embedding vectors for multiple texts in batch.
 * Returns null for the batch if the API key is missing or the call fails.
 */
export async function createEmbeddings(
  texts: string[],
): Promise<number[][] | null> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("RAG: No GOOGLE_GENERATIVE_AI_API_KEY — skipping batch embedding.");
    return null;
  }

  try {
    const { embeddings: vectors } = await embedMany({
      model: google.embedding(EMBEDDING_MODEL),
      values: texts,
    });
    return vectors;
  } catch (err) {
    console.error("RAG batch embedding failed:", err);
    return null;
  }
}

/**
 * Compute cosine similarity between two vectors.
 * Returns a value in [-1, 1] where 1 = identical direction.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
