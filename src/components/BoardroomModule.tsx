"use client";

import React, { useState, useEffect, useRef } from "react";
import { fallbackDebates, fallbackCustomDebate, type SpeechBubble, type AIDebateResult } from "./boardroom/boardroomData";
import BoardroomConfigBar from "./boardroom/BoardroomConfigBar";
import BoardroomTable from "./boardroom/BoardroomTable";
import BoardroomSpeechFeed from "./boardroom/BoardroomSpeechFeed";
import BoardroomVerdict from "./boardroom/BoardroomVerdict";
import { dispatchGameEvent } from "@/lib/gamification";
import { AudioEngine } from "@/lib/audio";

export default function BoardroomModule({ triggerSignal }: { triggerSignal: number }) {
  const [topic, setTopic] = useState<keyof typeof fallbackDebates | "custom">("auth_debt");
  const [customTopic, setCustomTopic] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [consensus, setConsensus] = useState(50);
  const [bubbles, setBubbles] = useState<SpeechBubble[]>([]);
  const [verdict, setVerdict] = useState("Waiting for boardroom debate session to convene...");
  const [memberVotes, setMemberVotes] = useState<Record<string, string>>({
    ceo: "?", cto: "?", ciso: "?", qa: "?", devops: "?", product: "?"
  });
  const [isDebating, setIsDebating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "generating" | "fallback" | "ready">("idle");

  const feedRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const startDebateRef = useRef<(selectedTopic: keyof typeof fallbackDebates | "custom") => Promise<void>>(null!);

  // Play back debate data with timed animation
  const playDebate = (debateData: { lines: SpeechBubble[]; votes: Record<string, string>; consensus: number; verdict: string }) => {
    clearInterval(intervalRef.current!);
    AudioEngine.unlock();
    AudioEngine.playGavel(); // Gavel slam to open debate
    setIsDebating(true);
    setIsLoadingAI(false);
    setBubbles([]);
    setConsensus(50);
    setVerdict("Executive debate in progress...");
    setActiveSpeaker(null);
    setMemberVotes({
      ceo: "?", cto: "?", ciso: "?", qa: "?", devops: "?", product: "?"
    });

    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < debateData.lines.length) {
        const line = debateData.lines[index];
        setActiveSpeaker(line.sender);
        setBubbles(prev => [...prev, line]);

        // Subtle data tx sound for each speaker
        AudioEngine.playDataTx();

        if (index > 0) {
          const voter = debateData.lines[index - 1].sender;
          const voteVal = debateData.votes[voter];
          if (voteVal) {
            setMemberVotes(prev => ({ ...prev, [voter]: voteVal }));
          }
        }

        let pct = 50 + index * 6;
        if (index === debateData.lines.length - 1) {
          pct = debateData.consensus;
          setMemberVotes(debateData.votes);
        }
        setConsensus(Math.min(100, Math.floor(pct)));

        index++;
      } else {
        clearInterval(intervalRef.current!);
        setVerdict(debateData.verdict);
        setActiveSpeaker(null);
        setIsDebating(false);
        // Gavel slam to close debate
        AudioEngine.playGavel();
      }
    }, 1800);

    setTimeout(() => dispatchGameEvent("boardroom:debated"), 100);
  };

  // Fetch AI-generated debate from the API
  const fetchAIDebate = async (topicText: string): Promise<AIDebateResult | null> => {
    try {
      const response = await fetch("/api/ai/boardroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicText }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.needsFallback) {
          return null;
        }
        throw new Error(data.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data as AIDebateResult;
    } catch (err) {
      console.error("AI debate fetch failed:", err);
      return null;
    }
  };

  const startDebate = async (selectedTopic: keyof typeof fallbackDebates | "custom") => {
    const isCustom = selectedTopic === "custom" && customTopic.trim();
    const topicLabel = isCustom
      ? customTopic.trim()
      : selectedTopic === "custom"
        ? fallbackDebates.auth_debt.title
        : fallbackDebates[selectedTopic].title;

    // Try AI first
    setIsLoadingAI(true);
    setAiStatus("generating");
    setBubbles([]);
    setConsensus(50);
    setVerdict("Consulting AI executive agents...");
    setActiveSpeaker(null);
    setMemberVotes({ ceo: "?", cto: "?", ciso: "?", qa: "?", devops: "?", product: "?" });

    const aiResult = await fetchAIDebate(topicLabel);

    if (aiResult && aiResult.lines && aiResult.lines.length === 7) {
      setAiStatus("ready");
      setIsLoadingAI(false);

      const validatedLines: SpeechBubble[] = aiResult.lines.map(l => ({
        sender: l.sender as SpeechBubble["sender"],
        text: l.text,
      }));

      playDebate({
        lines: validatedLines,
        votes: aiResult.votes,
        consensus: aiResult.consensus,
        verdict: aiResult.verdict,
      });
      return;
    }

    // Fallback to local scripts
    setAiStatus("fallback");
    setIsLoadingAI(false);

    const localData = isCustom
      ? fallbackCustomDebate(customTopic.trim())
      : selectedTopic === "custom"
        ? fallbackDebates.auth_debt
        : fallbackDebates[selectedTopic];

    playDebate(localData);
  };

  // Sync ref with latest startDebate after each render
  useEffect(() => {
    startDebateRef.current = startDebate;
  });

  useEffect(() => {
    if (triggerSignal === 0) return;
    startDebateRef.current("auth_debt");
  }, [triggerSignal]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [bubbles]);

  const handleTopicChange = (val: string) => {
    setTopic(val as keyof typeof fallbackDebates | "custom");
    if (val !== "custom") setCustomTopic("");
  };

  const isConveneDisabled = isDebating || isLoadingAI || (topic === "custom" && !customTopic.trim());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 h-[485px] animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* Visual circular table card */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">

        <BoardroomConfigBar
          topic={topic}
          onTopicChange={handleTopicChange}
          customTopic={customTopic}
          onCustomTopicChange={setCustomTopic}
          isDebating={isDebating}
          isLoadingAI={isLoadingAI}
          aiStatus={aiStatus}
          onConvene={() => startDebate(topic)}
          onCustomKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && customTopic.trim()) startDebate("custom");
          }}
          customTopicDisabled={isConveneDisabled}
        />

        <BoardroomTable
          consensus={consensus}
          activeSpeaker={activeSpeaker}
          memberVotes={memberVotes}
        />
      </div>

      {/* Speech bubbles dialogue logs feed */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
          <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
            Executive Discourse Feed
          </h3>
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/25 text-[#a855f7] tracking-wider uppercase select-none">
            {isLoadingAI ? "GENERATING..." : isDebating ? "DEBATE ONGOING" : "STANDBY"}
          </span>
        </div>

        <BoardroomSpeechFeed
          bubbles={bubbles}
          isLoadingAI={isLoadingAI}
        />

        <BoardroomVerdict
          verdict={verdict}
          isDebating={isDebating}
          isLoadingAI={isLoadingAI}
          bubbles={bubbles}
        />
      </div>

    </div>
  );
}
