import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { cosineSimilarity } from "@/lib/rag/embed";

const TEST_DB = path.join(process.cwd(), "dev.test-store.db");

// Test the store functions by creating a fresh DB and importing store
// Note: store.ts uses a module-level singleton, so we set DATABASE_URL to point to a test DB
// and use fresh imports via dynamic import

async function getStore() {
  process.env.DATABASE_URL = `file:${TEST_DB}`;
  return await import("@/lib/rag/store");
}

describe("rag/store — vector store operations", () => {
  let store: Awaited<ReturnType<typeof getStore>>;
  let db: Database.Database;

  beforeAll(async () => {
    // Clean up any previous test DB
    try { fs.unlinkSync(TEST_DB); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-wal"); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-shm"); } catch { /* ignore */ }

    store = await getStore();
    db = new Database(TEST_DB);
    db.pragma("journal_mode = WAL");
  });

  afterAll(() => {
    db.close();
    try { fs.unlinkSync(TEST_DB); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-wal"); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-shm"); } catch { /* ignore */ }
    delete process.env.DATABASE_URL;
  });

  it("initRagTables creates the rag_chunks table", () => {
    store.initRagTables();

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='rag_chunks'"
    ).all() as { name: string }[];
    expect(tables.length).toBe(1);
    expect(tables[0].name).toBe("rag_chunks");
  });

  it("upsertChunk inserts a chunk with embedding", () => {
    store.upsertChunk("test::0", "test.md", "Hello world", { label: "Test" }, [0.1, 0.2, 0.3]);

    const row = db.prepare("SELECT * FROM rag_chunks WHERE id = ?").get("test::0") as any;
    expect(row).toBeTruthy();
    expect(row.source_file).toBe("test.md");
    expect(row.chunk_text).toBe("Hello world");
    expect(JSON.parse(row.metadata_json)).toEqual({ label: "Test" });
    expect(JSON.parse(row.embedding_json)).toEqual([0.1, 0.2, 0.3]);
  });

  it("upsertChunk can insert without embedding", () => {
    store.upsertChunk("no-emb::0", "no-emb.md", "No embedding here", {}, null);

    const row = db.prepare("SELECT * FROM rag_chunks WHERE id = ?").get("no-emb::0") as any;
    expect(row).toBeTruthy();
    expect(row.embedding_json).toBeNull();
  });

  it("upsertChunk replaces existing chunk with same id", () => {
    store.upsertChunk("replace::0", "original.md", "Original text", {}, [0.5, 0.5]);
    store.upsertChunk("replace::0", "replaced.md", "Replaced text", { updated: "true" }, [0.9, 0.1]);

    const row = db.prepare("SELECT * FROM rag_chunks WHERE id = 'replace::0'").get() as any;
    expect(row.source_file).toBe("replaced.md");
    expect(row.chunk_text).toBe("Replaced text");
  });

  it("deleteChunksBySource removes only chunks from specified file", () => {
    store.upsertChunk("del::0", "delete-me.md", "Delete me", {}, [1, 0]);
    store.upsertChunk("keep::0", "keep-me.md", "Keep me", {}, [0, 1]);

    store.deleteChunksBySource("delete-me.md");

    const deleted = db.prepare("SELECT * FROM rag_chunks WHERE id = 'del::0'").get();
    expect(deleted).toBeUndefined();

    const kept = db.prepare("SELECT * FROM rag_chunks WHERE id = 'keep::0'").get();
    expect(kept).toBeTruthy();
  });

  it("getChunkCount returns total number of chunks", () => {
    // We have: keep::0 from previous test
    const count = store.getChunkCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it("getSourceSummary returns list of sources with counts", () => {
    const summary = store.getSourceSummary();
    expect(Array.isArray(summary)).toBe(true);
    if (summary.length > 0) {
      expect(summary[0]).toHaveProperty("sourceFile");
      expect(summary[0]).toHaveProperty("count");
    }
  });

  it("searchSimilarChunks returns results sorted by similarity", () => {
    store.upsertChunk("search::1", "search-test.md", "AI machine learning", {}, [0.9, 0.1, 0.5]);
    store.upsertChunk("search::2", "search-test.md", "Database transactions", {}, [0.3, 0.8, 0.2]);
    store.upsertChunk("search::3", "search-test.md", "Neural networks", {}, [0.85, 0.15, 0.45]);

    const results = store.searchSimilarChunks([0.9, 0.1, 0.5], 5, 0.3);

    expect(results.length).toBeGreaterThan(0);

    // Verify results are sorted by similarity descending
    for (let i = 1; i < results.length; i++) {
      expect(results[i].similarity).toBeLessThanOrEqual(results[i - 1].similarity);
    }

    // The most similar should be the AI machine learning chunk
    expect(results[0].chunk.id).toBe("search::1");
    expect(results[0].similarity).toBeCloseTo(1, 2);
  });

  it("searchSimilarChunks respects topK parameter", () => {
    const results = store.searchSimilarChunks([0.9, 0.1, 0.5], 2, 0.0);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("searchSimilarChunks respects minSimilarity threshold", () => {
    const results = store.searchSimilarChunks([1, 0, 0], 10, 0.99);
    // Only near-perfect matches should pass
    const allAboveThreshold = results.every((r) => r.similarity >= 0.99);
    expect(allAboveThreshold).toBe(true);
  });

  it("searchSimilarChunks returns empty array for empty query", () => {
    const results = store.searchSimilarChunks([], 5, 0.3);
    expect(results).toEqual([]);
  });

  it("searchSimilarChunks handles malformed embeddings gracefully", () => {
    // Insert a chunk with bad embedding JSON
    db.prepare(
      "INSERT OR REPLACE INTO rag_chunks (id, source_file, chunk_text, metadata_json, embedding_json) VALUES (?, ?, ?, ?, ?)"
    ).run("bad::emb", "bad.md", "Bad embedding", "{}", "not-json-at-all");

    // Should not throw
    const results = store.searchSimilarChunks([0.5, 0.5], 5, 0.0);
    expect(Array.isArray(results)).toBe(true);
  });
});
