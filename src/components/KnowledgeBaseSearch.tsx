"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Loader2,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Cpu,
  X,
  Eye,
  Sparkles,
  Hash,
  Layers,
  Quote,
} from "lucide-react";

interface RagSearchResult {
  id: string;
  text: string;
  sourceFile: string;
  metadata: Record<string, string>;
  similarity: number;
}

interface IndexSummary {
  totalChunks: number;
  sources: { sourceFile: string; count: number }[];
}

const DEFAULT_DOCS = [
  { file: "README.md", label: "Project Overview & Features" },
  { file: "AGENTS.md", label: "Agent Configuration Rules" },
  { file: "src/lib/types.ts", label: "Core TypeScript Types" },
  { file: "src/components/Sidebar.tsx", label: "Navigation & Modules" },
  { file: "src/components/BoardroomModule.tsx", label: "AI Boardroom Module" },
  { file: "src/components/ParallelSimulator.tsx", label: "Parallel Universe Simulator" },
  { file: "src/components/SelfHealingPipeline.tsx", label: "Self-Healing CI/CD Pipeline" },
  { file: "src/components/IncidentCommander.tsx", label: "Incident Commander Module" },
  { file: "src/components/ReleasePredictor.tsx", label: "Release Doom Predictor" },
  { file: "src/components/HackerArenaModule.tsx", label: "Security Arena" },
];

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${q})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-cyan-500/20 text-cyan-200 rounded-sm px-0.5 font-medium">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function KnowledgeBaseSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RagSearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [indexSummary, setIndexSummary] = useState<IndexSummary | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexStatus, setIndexStatus] = useState<"idle" | "ingesting" | "ready" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ file: string; content: string } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Auto-index on first mount if no index exists
  const autoIndex = useCallback(async () => {
    try {
      // Check if already indexed
      const checkRes = await fetch("/api/ai/rag/search", { method: "GET" });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.indexSummary?.totalChunks > 0) {
          setIndexSummary(checkData.indexSummary);
          setIndexStatus("ready");
          return; // Already indexed
        }
      }
    } catch {
      // Continue to index
    }

    // Auto-index silently
    setIsIndexing(true);
    setIndexStatus("ingesting");
    let totalChunks = 0;

    for (let i = 0; i < DEFAULT_DOCS.length; i++) {
      const doc = DEFAULT_DOCS[i];
      try {
        const textRes = await fetch(`/api/ai/rag/ingest?file=${encodeURIComponent(doc.file)}`);
        if (!textRes.ok) continue;
        const textData = await textRes.json();
        const content = textData.content;
        if (!content || content.trim().length < 20) continue;

        const ingestRes = await fetch("/api/ai/rag/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: content, sourceFile: doc.file, metadata: { label: doc.label } }),
        });
        const ingestData = await ingestRes.json();
        if (ingestData.ingested) totalChunks += ingestData.ingested.chunksCount;
        if (ingestData.needsApiKey) {
          setApiKeyMissing(true);
          setIndexStatus("error");
          setIsIndexing(false);
          return;
        }
      } catch {
        // Continue
      }
    }

    await refreshSummary();
    setIsIndexing(false);
    setIndexStatus("ready");
    setStatusMessage(`Auto-indexed ${totalChunks} chunks across ${DEFAULT_DOCS.length} documents`);
  }, []);

  // Start auto-index after a brief delay on mount
  useEffect(() => {
    const timer = setTimeout(() => autoIndex(), 500);
    return () => clearTimeout(timer);
  }, [autoIndex]);

  const refreshSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/rag/search", { method: "GET" });
      if (!res.ok) { const data = await res.json(); if (data.needsApiKey) setApiKeyMissing(true); return; }
      const data = await res.json();
      setIndexSummary(data.indexSummary);
      if (data.indexSummary.totalChunks > 0) setIndexStatus("ready");
    } catch { /* fail */ }
  }, []);

  const handleIndex = async () => {
    setIsIndexing(true);
    setIndexStatus("ingesting");
    setStatusMessage("Loading project files...");
    setApiKeyMissing(false);
    let totalChunks = 0;

    for (let i = 0; i < DEFAULT_DOCS.length; i++) {
      const doc = DEFAULT_DOCS[i];
      setStatusMessage(`Indexing ${doc.file} (${i + 1}/${DEFAULT_DOCS.length})...`);
      try {
        const textRes = await fetch(`/api/ai/rag/ingest?file=${encodeURIComponent(doc.file)}`);
        if (!textRes.ok) continue;
        const textData = await textRes.json();
        const content = textData.content;
        if (!content || content.trim().length < 20) continue;

        const ingestRes = await fetch("/api/ai/rag/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: content, sourceFile: doc.file, metadata: { label: doc.label } }),
        });
        const ingestData = await ingestRes.json();
        if (ingestData.ingested) totalChunks += ingestData.ingested.chunksCount;
        if (ingestData.needsApiKey) {
          setApiKeyMissing(true); setIndexStatus("error"); setIsIndexing(false);
          setStatusMessage("API key missing. Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local");
          return;
        }
      } catch { /* continue */ }
    }

    await refreshSummary();
    setIsIndexing(false);
    setIndexStatus("ready");
    setStatusMessage(`Indexing complete — ${totalChunks} chunks across ${DEFAULT_DOCS.length} documents`);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError("");
    setResults(null);

    try {
      const res = await fetch("/api/ai/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), topK: 8, minSimilarity: 0.25 }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.needsApiKey) { setApiKeyMissing(true); setSearchError("API key required for semantic search."); }
        else { setSearchError(data.error || "Search failed."); }
        setIsSearching(false);
        return;
      }
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setSearchError("Network error. Is the server running?");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePreview = async (sourceFile: string) => {
    setIsLoadingPreview(true);
    setPreviewDoc(null);
    try {
      const res = await fetch(`/api/ai/rag/ingest?file=${encodeURIComponent(sourceFile)}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewDoc({ file: sourceFile, content: data.content || "No content available" });
      }
    } catch { /* fail */ }
    setIsLoadingPreview(false);
  };

  const getSimilarityColor = (sim: number) => {
    if (sim > 0.7) return "text-[#10b981]";
    if (sim > 0.5) return "text-[#00f0ff]";
    return "text-[#f59e0b]";
  };

  const getSimilarityLabel = (sim: number) => {
    if (sim > 0.8) return "Excellent";
    if (sim > 0.7) return "Strong";
    if (sim > 0.5) return "Good";
    if (sim > 0.35) return "Fair";
    return "Weak";
  };

  const getFileLabel = (sourceFile: string) => DEFAULT_DOCS.find((d) => d.file === sourceFile)?.label || sourceFile;

  const resultCounts = useMemo(() => {
    if (!results) return null;
    return {
      excellent: results.filter(r => r.similarity > 0.8).length,
      strong: results.filter(r => r.similarity > 0.7 && r.similarity <= 0.8).length,
      good: results.filter(r => r.similarity > 0.5 && r.similarity <= 0.7).length,
      fair: results.filter(r => r.similarity <= 0.5).length,
    };
  }, [results]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Header */}
      <div className="glass-panel p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase select-none flex items-center gap-2">
              <BookOpen size={15} className="text-[#a855f7]" />
              Knowledge Base
            </h3>
            <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
              Semantically search across the project codebase, documentation, and agent configuration files.
            </p>
          </div>

          {/* Indexing status badge */}
          <div className="flex items-center gap-2">
            {indexStatus === "idle" && (
              <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 uppercase tracking-wide">
                Not Indexed
              </span>
            )}
            {indexStatus === "ingesting" && (
              <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/25 text-purple-400 uppercase tracking-wide animate-pulse flex items-center gap-1">
                <Loader2 size={8} className="animate-spin" /> Indexing...
              </span>
            )}
            {indexStatus === "ready" && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle size={8} /> {indexSummary?.totalChunks || 0} Chunks
                </span>
                {/* Quick stats */}
                {indexSummary && (
                  <span className="font-mono text-[7px] text-white/20">
                    {indexSummary.sources.length} sources
                  </span>
                )}
              </div>
            )}
            {indexStatus === "error" && (
              <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400 uppercase tracking-wide flex items-center gap-1">
                <AlertCircle size={8} /> Error
              </span>
            )}
          </div>
        </div>

        {/* Index action */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleIndex}
            disabled={isIndexing}
            className="font-sans text-[10px] font-bold text-slate-950 bg-gradient-to-r from-[#a855f7] to-[#0072ff] hover:shadow-[0_0_16px_rgba(168,85,247,0.4)] rounded px-4 py-1.5 cursor-pointer transition disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-[0.98]"
          >
            {isIndexing ? (
              <><Loader2 size={10} className="animate-spin" /> Indexing...</>
            ) : (
              <><Database size={10} /> {indexStatus === "ready" ? "Re-Index Documents" : "Index Project Documents"}</>
            )}
          </button>

          {apiKeyMissing && (
            <span className="text-[9px] text-red-400 font-mono">
              Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local for semantic search
            </span>
          )}

          {/* Quick filter chips */}
          {results && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[8px] font-mono text-white/20">Filters:</span>
              {resultCounts && Object.entries(resultCounts).map(([key, count]) => {
                if (count === 0) return null;
                const colors: Record<string, string> = {
                  excellent: "bg-emerald-500/10 text-[#10b981] border-emerald-500/20",
                  strong: "bg-cyan-500/10 text-[#00f0ff] border-cyan-500/20",
                  good: "bg-amber-500/10 text-[#f59e0b] border-amber-500/20",
                  fair: "bg-red-500/10 text-[#ef4444] border-red-500/20",
                };
                return (
                  <span key={key} className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${colors[key]}`}>
                    {key} ({count})
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Indexing status messages */}
        {isIndexing && statusMessage && (
          <div className="mt-3 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 flex items-center gap-2">
            <Cpu size={12} className="text-purple-400 animate-pulse" />
            <span className="font-mono text-[9px] text-purple-400">{statusMessage}</span>
          </div>
        )}

        {!isIndexing && statusMessage && indexStatus === "ready" && (
          <div className="mt-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle size={12} className="text-emerald-400" />
            <span className="font-mono text-[9px] text-emerald-400">{statusMessage}</span>
          </div>
        )}

        {/* Index summary */}
        {indexSummary && indexSummary.sources.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Hash size={10} className="text-white/20 mt-0.5" />
            {indexSummary.sources.map((src) => (
              <button
                key={src.sourceFile}
                onClick={() => handlePreview(src.sourceFile)}
                className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/30 border border-white/5 text-white/40 hover:border-cyan-500/30 hover:text-cyan-400 transition-all cursor-pointer flex items-center gap-1"
              >
                {src.sourceFile} ({src.count})
                <Eye size={7} />
              </button>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="mt-5 grid grid-cols-[24px_1fr_auto] items-center gap-3 bg-black/30 border border-white/5 rounded-lg px-4 py-2 focus-within:border-cyan-500/30 focus-within:shadow-[0_0_12px_rgba(0,240,255,0.08)] transition-all">
          <Search size={14} className="text-[#00f0ff]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Search the knowledge base (e.g. 'incident response process')..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder-white/30 w-full"
          />
          <div className="flex items-center gap-1.5">
            {query && (
              <button
                onClick={() => { setQuery(""); setResults(null); }}
                className="text-[9px] text-white/20 hover:text-white/50 cursor-pointer font-mono"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="font-sans text-[10px] font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-cyan-400 hover:from-[#00f0ff]/80 hover:to-cyan-400/80 transition rounded px-3.5 py-1.5 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed flex items-center justify-center gap-1 active:scale-[0.98]"
            >
              {isSearching ? <Loader2 size={10} className="animate-spin" /> : <TrendingUp size={10} />}
              {isSearching ? "Searching..." : "Search"}
            </button>
            {/* Results count badge */}
            {results && results.length > 0 && (
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                <Layers size={8} />
                {results.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {searchError && (
        <div className="glass-panel p-4 border-l-4 border-l-[#ef4444]">
          <div className="flex items-center gap-2 text-[11px] text-red-400 font-mono">
            <AlertCircle size={13} />
            {searchError}
          </div>
        </div>
      )}

      {/* Search Results */}
      {isSearching && (
        <div className="glass-panel p-10 flex flex-col justify-center items-center gap-3 text-center">
          <Loader2 size={24} className="text-[#00f0ff] animate-spin" />
          <h3 className="text-xs font-semibold font-mono text-white animate-pulse">
            Retrieving relevant context...
          </h3>
        </div>
      )}

      {!isSearching && results && results.length === 0 && (
        <div className="glass-panel py-12 flex flex-col items-center justify-center text-center gap-2 text-white/30">
          <FileText size={28} className="opacity-50" />
          <p className="text-xs font-medium">No semantically similar documents found.</p>
          <p className="text-[10px] text-white/20">Try a different query or re-index the documents.</p>
        </div>
      )}

      {!isSearching && results && results.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-white/30 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={10} className="text-[#a855f7]" />
              Top {results.length} Results
            </span>
            <span className="font-mono text-[9px] text-white/20">
              Sorted by semantic similarity
            </span>
          </div>

          {/* Result cards */}
          <div className="grid grid-cols-1 gap-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="glass-panel p-4 border-l-4 animate-in fade-in slide-in-from-bottom-3 duration-300 hover:bg-white/[0.01] transition-colors group"
                style={{ borderLeftColor: result.similarity > 0.7 ? "rgba(16, 185, 129, 0.5)" : result.similarity > 0.5 ? "rgba(0, 240, 255, 0.5)" : "rgba(245, 158, 11, 0.5)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText size={11} className="text-white/30 flex-shrink-0" />
                      <button
                        onClick={() => handlePreview(result.sourceFile)}
                        className="text-[9px] font-mono font-bold text-white/50 hover:text-cyan-400 transition-colors truncate cursor-pointer flex items-center gap-1"
                      >
                        {result.sourceFile}
                        <Eye size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <span className="text-[8px] font-mono text-white/20 px-1 py-px border border-white/10 rounded">
                        {getFileLabel(result.sourceFile)}
                      </span>
                      {/* Relevance badge */}
                      <span className={`text-[7px] font-bold px-1 py-px rounded border ${
                        result.similarity > 0.8 ? "bg-emerald-500/10 text-[#10b981] border-emerald-500/20" :
                        result.similarity > 0.7 ? "bg-cyan-500/10 text-[#00f0ff] border-cyan-500/20" :
                        result.similarity > 0.5 ? "bg-amber-500/10 text-[#f59e0b] border-amber-500/20" :
                        "bg-red-500/10 text-[#ef4444] border-red-500/20"
                      }`}>
                        {getSimilarityLabel(result.similarity)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-4">
                      <HighlightedText text={result.text} query={query} />
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className={`font-mono text-[10px] font-bold flex-shrink-0 ${getSimilarityColor(result.similarity)}`}>
                      {(result.similarity * 100).toFixed(0)}%
                    </span>
                    <span className="text-[6px] font-mono text-white/20 uppercase tracking-wider">Match</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${result.similarity > 0.7 ? "bg-[#10b981]" : result.similarity > 0.5 ? "bg-[#00f0ff]" : "bg-[#f59e0b]"}`}
                      style={{ width: `${result.similarity * 100}%` }}
                    />
                  </div>
                  <Quote size={8} className="text-white/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty states */}
      {!isSearching && !results && indexStatus === "ready" && (
        <div className="glass-panel py-12 flex flex-col items-center justify-center text-center gap-2 text-white/30">
          <Search size={28} className="opacity-50" />
          <p className="text-xs font-medium">Search the indexed documents above.</p>
          <p className="text-[10px] text-white/20 max-w-[400px]">
            Results are ranked by semantic similarity to your query using vector embeddings from Gemini.
          </p>
        </div>
      )}

      {!isSearching && !results && indexStatus === "idle" && (
        <div className="glass-panel py-12 flex flex-col items-center justify-center text-center gap-2 text-white/30">
          <Database size={28} className="opacity-50" />
          <p className="text-xs font-medium">No documents indexed yet.</p>
          <p className="text-[10px] text-white/20 max-w-[400px]">
            Click &quot;Index Project Documents&quot; above to ingest key files.
          </p>
        </div>
      )}

      {/* Doc Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPreviewDoc(null)}>
          <div
            className="w-full max-w-2xl max-h-[80vh] bg-[#0a0e1a] border border-white/10 rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[#00f0ff]" />
                <span className="text-[11px] font-mono font-bold text-white/80">{previewDoc.file}</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="text-[#00f0ff] animate-spin" />
                </div>
              ) : (
                <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {previewDoc.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
