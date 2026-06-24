import Database from "better-sqlite3";
import path from "path";
import { cosineSimilarity } from "./embed";

const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace("file:", "").replace(/"/g, "").trim()
  : path.join(process.cwd(), "dev.db");

const globalForStore = globalThis as unknown as {
  ragDb: Database.Database | undefined;
};

function getStoreDb(): Database.Database {
  const db =
    globalForStore.ragDb ??
    new Database(DB_PATH);

  if (!globalForStore.ragDb) {
    db.pragma("journal_mode = WAL");
    globalForStore.ragDb = db;
  }

  return db;
}

export interface StoredChunk {
  id: string;
  source_file: string;
  chunk_text: string;
  metadata_json: string;
  embedding_json: string | null;
}

/** Ensure the RAG tables exist. */
export function initRagTables(): void {
  const db = getStoreDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS rag_chunks (
      id TEXT PRIMARY KEY,
      source_file TEXT NOT NULL,
      chunk_text TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      embedding_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_rag_chunks_source_file ON rag_chunks(source_file);
  `);
}

/** Insert or replace a chunk + its embedding vector into the store. */
export function upsertChunk(
  id: string,
  sourceFile: string,
  chunkText: string,
  metadata: Record<string, string>,
  embedding: number[] | null,
): void {
  const db = getStoreDb();
  db.prepare(
    `INSERT OR REPLACE INTO rag_chunks (id, source_file, chunk_text, metadata_json, embedding_json)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(
    id,
    sourceFile,
    chunkText,
    JSON.stringify(metadata),
    embedding ? JSON.stringify(embedding) : null,
  );
}

/** Remove all chunks for a given source file. */
export function deleteChunksBySource(sourceFile: string): void {
  const db = getStoreDb();
  db.prepare("DELETE FROM rag_chunks WHERE source_file = ?").run(sourceFile);
}

/** Get total count of indexed chunks. */
export function getChunkCount(): number {
  const db = getStoreDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM rag_chunks").get() as { count: number };
  return row.count;
}

/** Get list of unique source files with their chunk counts. */
export function getSourceSummary(): { sourceFile: string; count: number }[] {
  const db = getStoreDb();
  const rows = db
    .prepare("SELECT source_file, COUNT(*) as count FROM rag_chunks GROUP BY source_file ORDER BY source_file")
    .all() as { source_file: string; count: number }[];
  return rows.map((r) => ({ sourceFile: r.source_file, count: r.count }));
}

/**
 * Search for the top-K most similar chunks to a query embedding using
 * cosine similarity. This performs a linear scan — fine for thousands of chunks.
 */
export function searchSimilarChunks(
  queryEmbedding: number[],
  topK = 8,
  minSimilarity = 0.3,
): { chunk: StoredChunk; similarity: number }[] {
  const db = getStoreDb();
  const rows = db
    .prepare("SELECT id, source_file, chunk_text, metadata_json, embedding_json FROM rag_chunks WHERE embedding_json IS NOT NULL")
    .all() as StoredChunk[];

  const scored: { chunk: StoredChunk; similarity: number }[] = [];

  for (const row of rows) {
    if (!row.embedding_json) continue;
    try {
      const emb = JSON.parse(row.embedding_json) as number[];
      if (!Array.isArray(emb)) continue;
      const sim = cosineSimilarity(queryEmbedding, emb);
      if (sim >= minSimilarity) {
        scored.push({ chunk: row, similarity: sim });
      }
    } catch {
      // skip malformed embeddings
    }
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}


// Initialize tables on first import in dev
if (process.env.NODE_ENV !== "production" || process.env.DATABASE_URL) {
  try {
    initRagTables();
  } catch {
    // DB might not be available during build
  }
}
