export interface Chunk {
  id: string;
  text: string;
  sourceFile: string;
  metadata: Record<string, string>;
}

/**
 * Split a document into overlapping chunks of roughly `maxTokens` words each.
 * Uses word-boundary splitting since we don't have a tokenizer.
 * Overlap ensures query context isn't lost at chunk boundaries.
 */
export function chunkDocument(
  text: string,
  sourceFile: string,
  metadata: Record<string, string> = {},
  maxWords = 400,
  overlapWords = 50,
): Chunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: Chunk[] = [];

  if (words.length === 0) return chunks;

  let start = 0;
  let chunkIndex = 0;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    const chunkText = words.slice(start, end).join(" ");

    chunks.push({
      id: `${sourceFile}::${chunkIndex}`,
      text: chunkText,
      sourceFile,
      metadata: {
        ...metadata,
        chunkIndex: String(chunkIndex),
      },
    });

    chunkIndex++;
    const nextStart = end - overlapWords;
    // Ensure progress — if we're not moving forward, exit to prevent infinite loop
    if (nextStart <= start) break;
    start = nextStart;
  }

  return chunks;
}
