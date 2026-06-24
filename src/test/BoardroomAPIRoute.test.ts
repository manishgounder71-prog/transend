import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the AI SDK modules BEFORE importing the route handler
vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => {
  const googleFn = vi.fn((model: string) => ({ modelId: model })) as unknown as Record<string, unknown>;
  // google.tools.googleSearch is needed by withGoogleSearchGrounding() at call time
  googleFn.tools = { googleSearch: vi.fn().mockReturnValue({}) };
  return { google: googleFn };
});

// The POST handler is imported after mocks are set up
const { POST } = await import("@/app/api/ai/boardroom/route");

// Sample valid structured debate data matching the Zod schema
const mockValidDebate = {
  lines: [
    { sender: "ceo", text: "We are evaluating a critical infrastructure decision regarding our database scaling strategy." },
    { sender: "cto", text: "Our current PostgreSQL setup is nearing connection limits. We should consider connection pooling." },
    { sender: "ciso", text: "Security implications of opening additional database connections must be reviewed first." },
    { sender: "qa", text: "Test coverage on the database layer is at 72%. We need more integration tests before scaling." },
    { sender: "devops", text: "Infrastructure can handle the scaling but we need to coordinate the rollout carefully." },
    { sender: "product", text: "Customer growth demands this scaling. We risk downtime if we don't act soon." },
    { sender: "ceo", text: "Based on the team input, we will proceed with a staged rollout over two weeks." },
  ],
  votes: {
    ceo: "APPROVE",
    cto: "APPROVE",
    ciso: "HOLD",
    qa: "HOLD",
    devops: "APPROVE",
    product: "APPROVE",
  },
  consensus: 67,
  verdict: "Consensus reached at 67%. Proceeding with staged rollout with security review gates.",
};

// Helper to create a mock Request
function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/ai/boardroom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/boardroom", () => {
  // Clear mocks and set sensible defaults before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when topic is empty", async () => {
    const response = await POST(makeRequest({ topic: "" }));
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain("at least 3 characters");
  });

  it("returns 400 when topic is too short", async () => {
    const response = await POST(makeRequest({ topic: "ab" }));
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain("at least 3 characters");
  });

  it("returns 400 when topic is missing", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain("at least 3 characters");
  });

  it("returns 400 when body has no topic field", async () => {
    const response = await POST(makeRequest({ unrelated: "data" }));
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain("at least 3 characters");
  });

  it("returns 503 with needsFallback when GOOGLE_GENERATIVE_AI_API_KEY is not configured", async () => {
    // Temporarily remove the env var
    const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    try {
      const response = await POST(makeRequest({ topic: "Should we update our database?" }));
      expect(response.status).toBe(503);

      const body = await response.json();
      expect(body.needsFallback).toBe(true);
      expect(body.error).toContain("GOOGLE_GENERATIVE_AI_API_KEY");
    } finally {
      // Restore env var
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey;
    }
  });

  it("returns 200 with structured debate data on successful generation", async () => {
    // Set the API key so the route doesn't short-circuit
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

    // Mock successful AI text generation with valid JSON
    const { generateText } = await import("ai");
    (generateText as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      text: JSON.stringify(mockValidDebate),
      providerMetadata: undefined,
    });

    const response = await POST(makeRequest({ topic: "Should we scale our database?" }));
    expect(response.status).toBe(200);

    const body = await response.json();

    // Check the structure matches expectations
    expect(body.title).toBe("Should we scale our database?");
    expect(body.lines).toHaveLength(7);
    expect(body.consensus).toBe(67);
    expect(body.verdict).toBeTruthy();
    expect(body.votes).toBeDefined();
    expect(body.votes.ceo).toBeDefined();
    expect(body.votes.cto).toBeDefined();
    expect(body.votes.ciso).toBeDefined();
    expect(body.votes.qa).toBeDefined();
    expect(body.votes.devops).toBeDefined();
    expect(body.votes.product).toBeDefined();

    // Verify that generateText was called with the right parameters
    expect(generateText).toHaveBeenCalledTimes(1);
    const callArg = (generateText as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.model).toEqual({ modelId: "gemini-2.0-flash" });
    expect(callArg.prompt).toContain("Should we scale our database?");
    expect(callArg.temperature).toBe(0.8);
    expect(callArg.tools).toBeDefined();
    expect(callArg.tools.googleSearch).toBeDefined();
  });

  it("returns 503 when AI generation fails with an error", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

    const { generateText } = await import("ai");
    (generateText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Rate limit exceeded")
    );

    const response = await POST(makeRequest({ topic: "Should we refactor the codebase?" }));
    expect(response.status).toBe(503);

    const body = await response.json();
    expect(body.needsFallback).toBe(true);
    expect(body.error).toContain("failed");
  });

  it("returns 503 when AI returns invalid JSON", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

    const { generateText } = await import("ai");
    (generateText as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      text: "This is not valid JSON at all",
      providerMetadata: undefined,
    });

    const response = await POST(makeRequest({ topic: "Test invalid JSON" }));
    expect(response.status).toBe(503);
  });

  it("returns 503 when AI returns JSON that fails Zod validation", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

    const { generateText } = await import("ai");
    // Valid JSON but does not match the schema (lines array too short)
    (generateText as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      text: JSON.stringify({ lines: [], votes: {}, consensus: 0, verdict: "ok" }),
      providerMetadata: undefined,
    });

    const response = await POST(makeRequest({ topic: "Test schema validation" }));
    expect(response.status).toBe(503);
  });

  it("includes all 6 executive agents in the debate", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

    const { generateText } = await import("ai");
    (generateText as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      text: JSON.stringify(mockValidDebate),
      providerMetadata: undefined,
    });

    const response = await POST(makeRequest({ topic: "Test agent coverage" }));
    expect(response.status).toBe(200);

    const body = await response.json();

    // Each line must have a valid sender
    const validSenders = ["ceo", "cto", "ciso", "qa", "devops", "product"];
    for (const line of body.lines) {
      expect(validSenders).toContain(line.sender);
    }

    // All 6 agents must have a vote
    for (const agent of validSenders) {
      expect(body.votes[agent]).toBeDefined();
      expect(body.votes[agent].length).toBeGreaterThan(0);
    }
  });

  it("returns 400 when topic is a number instead of a string", async () => {
    const response = await POST(makeRequest({ topic: 12345 }));
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain("at least 3 characters");
  });

  it("returns 400 when topic is only whitespace", async () => {
    const response = await POST(makeRequest({ topic: "   " }));
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain("at least 3 characters");
  });

  it("debate title matches the provided topic in the response", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

    const { generateText } = await import("ai");
    (generateText as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      text: JSON.stringify(mockValidDebate),
      providerMetadata: undefined,
    });

    const topic = "Should we migrate to microservices?";
    const response = await POST(makeRequest({ topic }));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.title).toBe(topic);
  });
});
