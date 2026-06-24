"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Send, Volume2, VolumeX, Loader2 } from "lucide-react";
import type { TabId } from "@/lib/types";
import { dispatchGameEvent } from "@/lib/gamification";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

interface VoiceCTOProps {
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
  triggerBoardroom: () => void;
}

// ── SSE Stream Parser ──────────────────────────────────────
// Consumes a custom SSE stream where each line is a text chunk.
// The server sends simple `text\n` lines that we concatenate.
async function consumeStream(
  response: Response,
  onText: (fullText: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: string) => void,
): Promise<void> {
  if (!response.body) {
    onError("Response body is null");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep incomplete line in buffer for next read
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Each line is a text chunk from the server
        accumulated += trimmed;
        onText(accumulated);
      }
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      accumulated += buffer.trim();
      onText(accumulated);
    }

    onComplete(accumulated);
  } catch (err) {
    onError(err instanceof Error ? err.message : "Stream error");
  }
}

// ── Mock Fallback Engine ───────────────────────────────────
function getMockReply(
  command: string,
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>,
  triggerBoardroom: () => void,
): string {
  const cmd = command.toLowerCase();

  if (cmd.includes("boardroom") || cmd.includes("meeting") || cmd.includes("debate")) {
    setActiveTab("boardroom");
    triggerBoardroom();
    return "Understood, Commander. Navigating to the AI Boardroom and convening the executive agents for analysis.";
  }
  if (cmd.includes("pipeline") || cmd.includes("healing") || cmd.includes("ci")) {
    setActiveTab("pipeline");
    return "Acknowledged. Switching to the Self-Healing Pipeline console. Auto-monitoring active.";
  }
  if (cmd.includes("incident") || cmd.includes("outage") || cmd.includes("incidents")) {
    setActiveTab("incidents");
    return "Opening the incident response deck. INC-4029 telemetry on screen.";
  }
  if (cmd.includes("twin") || cmd.includes("topology") || cmd.includes("graph")) {
    setActiveTab("digitaltwin");
    return "Initiating GitLab codebase topology twin. Core services maps loaded.";
  }
  if (cmd.includes("parallel") || cmd.includes("universe") || cmd.includes("scenario")) {
    setActiveTab("parallel");
    return "Right away, sir. Initializing the Parallel Universe Simulator. Awaiting core parameters.";
  }
  if (cmd.includes("predict") || cmd.includes("doom") || cmd.includes("risk")) {
    setActiveTab("predictor");
    return "Doom Predictor active. Synthesizing risk metrics and release vectors.";
  }
  if (cmd.includes("security") || cmd.includes("hacker") || cmd.includes("arena")) {
    setActiveTab("hacker");
    return "Opening the Security Arena. Red Team and Blue Team simulations synchronized.";
  }
  if (cmd.includes("time") || cmd.includes("history")) {
    setActiveTab("timemachine");
    return "Accessing historical archives. Loading the codebase Time Machine.";
  }
  if (cmd.includes("dashboard") || cmd.includes("mission") || cmd.includes("control")) {
    setActiveTab("dashboard");
    return "Returning to Mission Control. Synchronizing real-time telemetry.";
  }
  if (cmd.includes("deploy") || cmd.includes("ship")) {
    return "We are currently not ready to deploy. Release Doom Predictor indicates an elevated 64% incident risk on the authentication database cluster. Consensuses suggest delaying the release by 2 weeks to clear architectural debt.";
  }
  if (cmd.includes("risk") || cmd.includes("threat")) {
    return "Our primary risk factor is INC-4029 connection pool starvation on auth-service replica nodes. Mitigation stands active at 72% recovery.";
  }
  if (cmd.includes("confidence")) {
    return "Release confidence stands at 84% (Safe to Ship) with only 4% rollback risk predicted.";
  }

  return "Accessing GitLab Orbit codebase details. I've logged the query. Can you clarify the target repository, Commander?";
}

// ── Navigation Intent Parser ───────────────────────────────
function extractNavigation(text: string): { cleaned: string; target: TabId | null } {
  const match = text.match(/\[navigate:(\w+)\]/);
  if (match) {
    const target = match[1] as TabId;
    const cleaned = text.replace(/\[navigate:\w+\]/g, "").trim();
    return { cleaned, target };
  }
  return { cleaned: text, target: null };
}

// ── Component ──────────────────────────────────────────────

export default function VoiceCTOOrb({ setActiveTab, triggerBoardroom }: VoiceCTOProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("STANDBY");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "bot", text: "Voice CTO Jarvis active. Speak or type commands. Try: 'open boardroom', 'simulate pipeline failure', 'risk summary', or 'incident command'." }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const historyRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isMutedRef = useRef(isMuted);
  const conversationRef = useRef<Array<{ role: string; content: string }>>([]);
  const abortRef = useRef<AbortController | null>(null);
  // Monotonically increasing request ID. Each new command gets a higher ID.
  // If a response callback fires with a stale ID, it means this request was
  // superseded by a newer command — we skip processing it.
  const requestIdRef = useRef(0);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const speakMessage = useCallback((text: string) => {
    if (isMutedRef.current || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.95;
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Stable fallback function — no dependencies on messages or streaming state
  const executeMockFallback = useCallback(
    (command: string) => {
      setStatus("SPEAKING...");
      const reply = getMockReply(command, setActiveTab, triggerBoardroom);

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.sender === "bot" && last.text === "") {
          updated[updated.length - 1] = { ...last, text: reply };
        } else {
          updated.push({ sender: "bot", text: reply });
        }
        return updated;
      });

      conversationRef.current.push({ role: "assistant", content: reply });
      speakMessage(reply);

      setTimeout(() => setStatus("STANDBY"), 3000);
    },
    [setActiveTab, triggerBoardroom, speakMessage],
  );

  const handleCommandSubmit = useCallback(
    async (command: string) => {
      if (!command.trim()) return;

      // Cancel any in-flight stream
      if (abortRef.current) {
        abortRef.current.abort();
      }

      // Increment the request counter so old callbacks know they're stale
      const myRequestId = ++requestIdRef.current;

      // Add user message and placeholder bot message
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: command },
        { sender: "bot", text: "" },
      ]);
      conversationRef.current.push({ role: "user", content: command });
      setIsStreaming(true);
      setStatus("THINKING...");

      const abortController = new AbortController();
      abortRef.current = abortController;

      // Try AI streaming first
      try {
        const response = await fetch("/api/ai/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command,
            history: conversationRef.current.slice(-10, -1),
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("AI unavailable");
        }

        setStatus("STREAMING");

        await consumeStream(
          response,
          // onText — update the placeholder message with accumulated text
          (fullText) => {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.sender === "bot") {
                updated[updated.length - 1] = { ...last, text: fullText };
              }
              return updated;
            });
          },
          // onComplete — finalize the response
          (fullText) => {
            // Stale response from a superseded request — skip
            if (myRequestId !== requestIdRef.current) return;

            setIsStreaming(false);

            // Parse navigation intents
            const { cleaned, target } = extractNavigation(fullText);
            const displayText = target ? cleaned : fullText;

            if (target) {
              setActiveTab(target);
              if (target === "boardroom") triggerBoardroom();
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.sender === "bot") {
                  updated[updated.length - 1] = { ...last, text: cleaned };
                }
                return updated;
              });
            }

            conversationRef.current.push({ role: "assistant", content: displayText });
            dispatchGameEvent("voice:commanded");

            // Speak the response
            setStatus("SPEAKING...");
            speakMessage(displayText);
            setTimeout(() => setStatus("STANDBY"), 2500);
          },
          // onError — fallback to mock if request is still current
          () => {
            if (myRequestId !== requestIdRef.current) return;
            setIsStreaming(false);
            executeMockFallback(command);
          },
        );
      } catch {
        if (myRequestId === requestIdRef.current) {
          setIsStreaming(false);
          executeMockFallback(command);
        }
      }
    },
    [setActiveTab, triggerBoardroom, speakMessage, executeMockFallback],
  );

  // Set up speech recognition (stable — only re-runs when handleCommandSubmit changes,
  // which is now stable since it no longer depends on `messages`).
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        const rec = new SpeechRecognitionConstructor();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setStatus("LISTENING...");
          setIsListening(true);
        };

        rec.onerror = () => {
          setStatus("STANDBY");
          setIsListening(false);
        };

        rec.onend = () => {
          setStatus("STANDBY");
          setIsListening(false);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          handleCommandSubmit(text);
        };

        recognitionRef.current = rec;
      }
    }
  }, [handleCommandSubmit]);

  // Auto-scroll chat history to bottom
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleMic = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Speech recognition is not supported in this browser. Please type your command.");
      return;
    }
    if (isListening) {
      rec.stop();
    } else {
      rec.start();
    }
  };

  return (
    <div className="absolute bottom-[140px] right-4 md:right-8 z-50 flex flex-col items-center">
      {/* Visual Floating Orb */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-[60px] h-[60px] flex flex-col items-center justify-center cursor-pointer group"
      >
        <div className="relative w-11 h-11 flex items-center justify-center">
          <div className="w-4 h-4 bg-[#00f0ff] rounded-full voice-core-pulse z-10" />
          <div className="absolute w-[24px] h-[24px] border border-[#00f0ff] rounded-full opacity-30 voice-ring-spin-cw border-t-transparent" />
          <div className="absolute w-[34px] h-[34px] border border-[#00f0ff] rounded-full opacity-35 voice-ring-spin-ccw border-b-transparent" />
          <div className="absolute w-[44px] h-[44px] border border-[#00f0ff] rounded-full opacity-20 voice-ring-spin-cw border-l-transparent" />
        </div>
        <span className="font-mono text-[9px] font-bold tracking-wider text-[#00f0ff] mt-1.5 uppercase select-none text-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
          VOICE CTO
        </span>
      </div>

      {/* Floating Speech Dialog Overlay */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-[75px] right-0 w-[360px] glass-panel p-4 flex flex-col gap-3 z-50 border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div>
              <h4 className="text-xs font-bold tracking-tight text-white uppercase">Voice CTO Jarvis</h4>
              <span className="font-mono text-[9px] text-[#00f0ff] uppercase flex items-center gap-1.5">
                {isStreaming && (
                  <Loader2 size={10} className="animate-spin" />
                )}
                {status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/60 hover:text-white transition"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

          {/* History */}
          <div
            ref={historyRef}
            className="h-[220px] overflow-y-auto flex flex-col gap-2.5 pr-1"
          >
            {messages.map((msg, i) => {
              const isLastBot = msg.sender === "bot" && i === messages.length - 1;
              return (
                <div
                  key={i}
                  className={`text-[11px] leading-relaxed pl-2.5 py-0.5 border-l-2 ${
                    msg.sender === "bot"
                      ? "text-slate-300 border-[#00f0ff]"
                      : "text-white border-purple-500 self-end w-[90%]"
                  }`}
                >
                  {msg.text}
                  {isLastBot && isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-[#00f0ff] ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMic}
              disabled={isStreaming}
              className={`p-2 rounded-lg border transition ${
                isListening
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Mic size={14} className={isListening ? "animate-pulse" : ""} />
            </button>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isStreaming) {
                  const cmd = inputVal;
                  setInputVal("");
                  handleCommandSubmit(cmd);
                }
              }}
              placeholder="Ask Jarvis anything about your stack..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00f0ff]/40 transition disabled:opacity-40"
              disabled={isStreaming}
            />
            <button
              onClick={() => {
                const cmd = inputVal;
                setInputVal("");
                handleCommandSubmit(cmd);
              }}
              disabled={isStreaming || !inputVal.trim()}
              className="p-2 rounded-lg bg-[#00f0ff] text-slate-950 font-bold hover:bg-[#00f0ff]/80 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
