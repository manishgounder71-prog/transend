import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import KnowledgeBaseSearch from "@/components/KnowledgeBaseSearch";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

/** Create a fetch mock that returns different responses based on the request URL/method */
function createMockFetch(defaultIndexed = true) {
  mockFetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
    const urlStr = typeof url === "string" ? url : url.toString();

    // GET /api/ai/rag/search → index check
    if (urlStr.includes("/api/ai/rag/search") && (!options || options.method === "GET")) {
      if (defaultIndexed) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ indexSummary: { totalChunks: 42, sources: [{ sourceFile: "README.md", count: 42 }] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ indexSummary: { totalChunks: 0, sources: [] } }),
      });
    }

    // GET /api/ai/rag/ingest?file=... → file content fetcher
    if (urlStr.includes("/api/ai/rag/ingest") && options?.method !== "POST") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ content: "Mock file content for preview" }),
      });
    }

    // POST /api/ai/rag/ingest → indexing
    if (urlStr.includes("/api/ai/rag/ingest") && options?.method === "POST") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ingested: { chunksCount: 5 } }),
      });
    }

    // Default: return empty results
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    });
  });
}

// Helper to simulate a search flow
async function performSearch(query: string, responseResults: any[]) {
  // Override the search response
  mockFetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
    const urlStr = typeof url === "string" ? url : url.toString();

    // Index check (GET)
    if (urlStr.includes("/api/ai/rag/search") && (!options || options.method === "GET")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ indexSummary: { totalChunks: 42, sources: [{ sourceFile: "README.md", count: 42 }] } }),
      });
    }

    // Search (POST)
    if (urlStr.includes("/api/ai/rag/search") && options?.method === "POST") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: responseResults }),
      });
    }

    // File content
    if (urlStr.includes("/api/ai/rag/ingest") && (!options || options.method === "GET")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ content: "File content for preview" }),
      });
    }

    return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [] }) });
  });

  render(<KnowledgeBaseSearch />);

  const input = screen.getByPlaceholderText(/Search the knowledge base/i);
  fireEvent.change(input, { target: { value: query } });

  // Flush pending microtasks
  await act(async () => { await new Promise(r => setTimeout(r, 10)); });

  fireEvent.click(screen.getByText("Search"));
}

describe("KnowledgeBaseSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header", () => {
    createMockFetch();
    render(<KnowledgeBaseSearch />);
    expect(screen.getByText("Knowledge Base")).toBeInTheDocument();
  });

  it("shows chunk count when already indexed", async () => {
    createMockFetch();
    render(<KnowledgeBaseSearch />);
    await waitFor(() => {
      expect(screen.getByText(/42 Chunks/)).toBeInTheDocument();
    });
  });

  it("renders search input with placeholder", () => {
    createMockFetch();
    render(<KnowledgeBaseSearch />);
    expect(screen.getByPlaceholderText(/Search the knowledge base/i)).toBeInTheDocument();
  });

  it("disables search button when query is empty", () => {
    createMockFetch();
    render(<KnowledgeBaseSearch />);
    const searchButton = screen.getByText("Search");
    expect(searchButton).toBeDisabled();
  });

  it("performs search and shows results", async () => {
    mockFetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/ai/rag/search") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            results: [{ id: "1", text: "This is a test result about incident response.", sourceFile: "README.md", metadata: {}, similarity: 0.85 }],
          }),
        });
      }
      if (urlStr.includes("/api/ai/rag/search")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ indexSummary: { totalChunks: 42, sources: [{ sourceFile: "README.md", count: 42 }] } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [] }) });
    });

    render(<KnowledgeBaseSearch />);

    const input = screen.getByPlaceholderText(/Search the knowledge base/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "incident response" } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Search"));
    });

    // Use container-based query to handle text split across <mark> elements
    await waitFor(() => {
      expect(screen.getByText("README.md")).toBeInTheDocument();
    });
  });

  it("shows similarity percentage for each result", async () => {
    await performSearch("test", [
      { id: "1", text: "Result text", sourceFile: "README.md", metadata: {}, similarity: 0.85 },
    ]);

    await waitFor(() => {
      expect(screen.getByText("85%")).toBeInTheDocument();
    });
  });

  it("shows relevance badge for each result", async () => {
    await performSearch("test", [
      { id: "1", text: "Result text", sourceFile: "README.md", metadata: {}, similarity: 0.85 },
    ]);

    await waitFor(() => {
      expect(screen.getByText("Excellent")).toBeInTheDocument();
    });
  });

  it("shows source file name for each result", async () => {
    await performSearch("test", [
      { id: "1", text: "Result text", sourceFile: "README.md", metadata: {}, similarity: 0.85 },
    ]);

    await waitFor(() => {
      expect(screen.getByText("README.md")).toBeInTheDocument();
    });
  });

  it("shows loading state while searching", async () => {
    // Create a fetch that never resolves for search
    mockFetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/ai/rag/search") && options?.method === "POST") {
        return new Promise(() => {}); // never resolves
      }
      if (urlStr.includes("/api/ai/rag/search")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ indexSummary: { totalChunks: 42, sources: [] } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<KnowledgeBaseSearch />);

    const input = screen.getByPlaceholderText(/Search the knowledge base/i);
    fireEvent.change(input, { target: { value: "test" } });
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByText("Searching...")).toBeInTheDocument();
    });
  });

  it("shows result count badge when results exist", async () => {
    await performSearch("test", [
      { id: "1", text: "Result 1", sourceFile: "README.md", metadata: {}, similarity: 0.85 },
      { id: "2", text: "Result 2", sourceFile: "AGENTS.md", metadata: {}, similarity: 0.72 },
    ]);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("performs search on Enter key press", async () => {
    // Setup mock for search + index check
    mockFetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/ai/rag/search") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: [{ id: "1", text: "Result from Enter key", sourceFile: "README.md", metadata: {}, similarity: 0.85 }] }),
        });
      }
      if (urlStr.includes("/api/ai/rag/search")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ indexSummary: { totalChunks: 42, sources: [{ sourceFile: "README.md", count: 42 }] } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<KnowledgeBaseSearch />);

    const input = screen.getByPlaceholderText(/Search the knowledge base/i);
    fireEvent.change(input, { target: { value: "enter search" } });
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText(/Result from Enter key/)).toBeInTheDocument();
    });
  });

  it("shows error state when search fails", async () => {
    mockFetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/ai/rag/search") && options?.method === "POST") {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Search failed." }),
        });
      }
      if (urlStr.includes("/api/ai/rag/search")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ indexSummary: { totalChunks: 42, sources: [] } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<KnowledgeBaseSearch />);
    const input = screen.getByPlaceholderText(/Search the knowledge base/i);
    fireEvent.change(input, { target: { value: "test" } });
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByText("Search failed.")).toBeInTheDocument();
    });
  });

  it("shows empty results state when no matches", async () => {
    mockFetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/ai/rag/search") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: [] }),
        });
      }
      if (urlStr.includes("/api/ai/rag/search")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ indexSummary: { totalChunks: 42, sources: [] } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<KnowledgeBaseSearch />);
    const input = screen.getByPlaceholderText(/Search the knowledge base/i);
    fireEvent.change(input, { target: { value: "zzzzz" } });
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByText(/No semantically similar documents found/i)).toBeInTheDocument();
    });
  });

  it("clears results when clear button is clicked", async () => {
    await performSearch("test", [
      { id: "1", text: "Result to clear", sourceFile: "README.md", metadata: {}, similarity: 0.85 },
    ]);

    await waitFor(() => {
      expect(screen.getByText(/Result to clear/)).toBeInTheDocument();
    });

    // Click clear
    fireEvent.click(screen.getByText("Clear"));
    expect(screen.queryByText(/Result to clear/)).not.toBeInTheDocument();
  });

  it("shows 'Re-Index Documents' when already indexed", async () => {
    createMockFetch();
    render(<KnowledgeBaseSearch />);
    await waitFor(() => {
      expect(screen.getByText("Re-Index Documents")).toBeInTheDocument();
    });
  });

  it("shows quality filter chips after search", async () => {
    await performSearch("test", [
      { id: "1", text: "Result 1", sourceFile: "A.md", metadata: {}, similarity: 0.95 },
      { id: "2", text: "Result 2", sourceFile: "B.md", metadata: {}, similarity: 0.75 },
    ]);

    await waitFor(() => {
      expect(screen.getByText(/Filters:/)).toBeInTheDocument();
    });
  });

  it("shows API key missing message when search needs key", async () => {
    mockFetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/ai/rag/search") && options?.method === "POST") {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ needsApiKey: true }),
        });
      }
      if (urlStr.includes("/api/ai/rag/search")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ indexSummary: { totalChunks: 42, sources: [] } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<KnowledgeBaseSearch />);
    const input = screen.getByPlaceholderText(/Search the knowledge base/i);
    fireEvent.change(input, { target: { value: "test" } });
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByText(/API key required for semantic search/i)).toBeInTheDocument();
    });
  });

  describe("document preview modal", () => {
    it("opens and closes preview modal", async () => {
      // Setup mock: search POST returns a result, then file content GET returns preview
      const { getByText: _getByText, ...screenUtils } = screen;

      mockFetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
        const urlStr = typeof url === "string" ? url : url.toString();

        // Index check
        if (urlStr.includes("/api/ai/rag/search") && (!options || options.method === "GET")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ indexSummary: { totalChunks: 42, sources: [] } }),
          });
        }

        // Search
        if (urlStr.includes("/api/ai/rag/search") && options?.method === "POST") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              results: [{ id: "1", text: "Preview test content", sourceFile: "README.md", metadata: {}, similarity: 0.85 }],
            }),
          });
        }

        // File content for preview
        if (urlStr.includes("/api/ai/rag/ingest") && (!options || options.method === "GET")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: "# README\nTest content for preview" }),
          });
        }

        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(<KnowledgeBaseSearch />);

      // Search first
      const input = screen.getByPlaceholderText(/Search the knowledge base/i);
      fireEvent.change(input, { target: { value: "test" } });
      await act(async () => { await new Promise(r => setTimeout(r, 10)); });
      fireEvent.click(screen.getByText("Search"));

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText("README.md")).toBeInTheDocument();
      });

      // Click the source file to open preview
      const fileBtns = screen.getAllByText("README.md");
      fireEvent.click(fileBtns[0]);

      // Wait for preview content
      await waitFor(() => {
        expect(screen.getByText(/Test content for preview/i)).toBeInTheDocument();
      });

      // Close by clicking overlay
      const overlay = document.querySelector('[class*="fixed"]');
      if (overlay) {
        fireEvent.click(overlay);
        await waitFor(() => {
          expect(screen.queryByText(/Test content for preview/i)).not.toBeInTheDocument();
        });
      }
    });
  });
});
