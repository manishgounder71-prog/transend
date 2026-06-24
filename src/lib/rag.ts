import { google } from "@ai-sdk/google";

// ── Type for grounding sources returned in the response ──

export interface GroundingSource {
  title: string;
  url: string;
}

// ── Google Search Grounding Tool ────────────────────────
// Returns the tools config that grounds Gemini responses with Google Search.
// Add this to generateText() or generateObject() calls:
//
//   const result = await generateText({
//     model: google("gemini-2.0-flash"),
//     tools: withGoogleSearchGrounding(),
//     ...
//   });

export function withGoogleSearchGrounding() {
  return {
    googleSearch: google.tools.googleSearch({}),
  };
}

// ── Extract grounding sources from provider metadata ───
// After generation, pass providerMetadata to extract cited sources.
// Gemini returns: groundingMetadata.searchEntryPoint and
// groundingMetadata.groundingChunks (list of { web: { uri, title } })

export function extractGroundingSources(
  providerMetadata?: Record<string, unknown>
): GroundingSource[] {
  if (!providerMetadata) return [];

  const googleMeta = providerMetadata.google as
    | { groundingMetadata?: { groundingChunks?: Array<{ web: { uri: string; title: string } }> } }
    | undefined;

  if (!googleMeta?.groundingMetadata?.groundingChunks) return [];

  return googleMeta.groundingMetadata.groundingChunks
    .filter((chunk) => chunk.web?.uri && chunk.web?.title)
    .map((chunk) => ({
      title: chunk.web.title,
      url: chunk.web.uri,
    }));
}


