"use client";

import React from "react";
import { Users } from "lucide-react";
import { boardroomSeats, type SpeechBubble } from "./boardroomData";

interface BoardroomSpeechFeedProps {
  bubbles: SpeechBubble[];
  isLoadingAI: boolean;
}

export default function BoardroomSpeechFeed({ bubbles, isLoadingAI }: BoardroomSpeechFeedProps) {
  const getSeatInfo = (id: string) => boardroomSeats.find((s) => s.id === id);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 py-1">
      {bubbles.length === 0 && !isLoadingAI ? (
        <div className="h-full flex flex-col justify-center items-center gap-2 text-white/30 select-none text-center">
          <Users size={24} className="animate-pulse" />
          <p className="text-xs">
            Select a topic and click &quot;Convene&quot; or command Voice CTO to start debate transcripts.
          </p>
        </div>
      ) : bubbles.length === 0 && isLoadingAI ? (
        <div className="h-full flex flex-col justify-center items-center gap-2 text-white/30 select-none text-center">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-xs font-mono text-purple-400 animate-pulse">
            AI agents are debating... Stand by.
          </p>
        </div>
      ) : (
        bubbles.map((bubble, i) => {
          const info = getSeatInfo(bubble.sender);
          return (
            <div
              key={i}
              className="bg-white/[0.015] border border-white/5 rounded-lg p-3 self-start max-w-[95%] border-l-2 animate-in fade-in zoom-in-95 duration-200"
              style={{ borderLeftColor: info?.color }}
            >
              <div className="text-[9px] font-bold text-white/35 mb-1" style={{ color: info?.color }}>
                {info?.label} ({info?.role})
              </div>
              <p className="text-[11px] leading-relaxed text-slate-200">{bubble.text}</p>
            </div>
          );
        })
      )}
    </div>
  );
}
