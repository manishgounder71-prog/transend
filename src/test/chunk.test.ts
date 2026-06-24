import { describe, it, expect } from "vitest";
import { chunkDocument } from "@/lib/rag/chunk";

describe("chunkDocument", () => {
  it("returns a single chunk for short text", () => {
    const chunks = chunkDocument("Hello world", "test.md");
    expect(chunks).toHaveLength(1);
    expect(chunks[0].text).toBe("Hello world");
    expect(chunks[0].sourceFile).toBe("test.md");
    expect(chunks[0].id).toBe("test.md::0");
  });

  it("returns empty array for empty text", () => {
    const chunks = chunkDocument("", "empty.md");
    expect(chunks).toHaveLength(0);
  });

  it("returns empty array for whitespace-only text", () => {
    const chunks = chunkDocument("   \n  \t  ", "whitespace.md");
    expect(chunks).toHaveLength(0);
  });

  it("splits long text into multiple chunks", () => {
    // 500 words, maxWords=200, overlapWords=50
    const words = Array.from({ length: 500 }, (_, i) => `word${i}`);
    const text = words.join(" ");
    const chunks = chunkDocument(text, "long.md", {}, 200, 50);

    // 500 words: chunk1=0-200, chunk2=150-350, chunk3=300-500
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks.length).toBeLessThanOrEqual(4);

    // Check overlap: chunk2 should start with words from the end of chunk1
    const chunk2Words = chunks[1].text.split(" ");
    expect(chunk2Words[0]).toBe("word150");
  });

  it("preserves metadata across all chunks", () => {
    const chunks = chunkDocument("Some text here", "meta.md", { label: "test doc" }, 50, 5);
    for (const chunk of chunks) {
      expect(chunk.metadata.label).toBe("test doc");
      expect(chunk.metadata.chunkIndex).toBeDefined();
    }
  });

  it("assigns sequential chunk indices", () => {
    const text = Array.from({ length: 300 }, (_, i) => `word${i}`).join(" ");
    const chunks = chunkDocument(text, "indexed.md", {}, 100, 10);
    chunks.forEach((chunk, i) => {
      expect(chunk.metadata.chunkIndex).toBe(String(i));
    });
  });

  it("uses provided maxWords and overlapWords correctly", () => {
    const words = Array.from({ length: 50 }, (_, i) => `w${i}`);
    const text = words.join(" ");
    // 50 words, maxWords=20, overlapWords=5:
    //   chunk1:  0-20  (w0..w19)
    //   chunk2: 15-35  (w15..w34) — 5-word overlap with chunk1
    //   chunk3: 30-50  (w30..w49) — 5-word overlap with chunk2
    //   chunk4: 45-50  (w45..w49) — final 5 words (overlap=5 but start advances)
    const chunks = chunkDocument(text, "custom.md", {}, 20, 5);

    expect(chunks.length).toBe(4);
    expect(chunks[0].text).toContain("w0");
    expect(chunks[0].text).toContain("w19");
    expect(chunks[1].text).toContain("w15"); // overlap
    expect(chunks[2].text).toContain("w30"); // overlap
    expect(chunks[3].text).toContain("w45"); // final chunk
    expect(chunks[3].text).toContain("w49");
  });
});
