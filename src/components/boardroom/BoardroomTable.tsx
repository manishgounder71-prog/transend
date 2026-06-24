"use client";

import React from "react";
import { boardroomSeats, getVoteBadgeColor } from "./boardroomData";

interface BoardroomTableProps {
  consensus: number;
  activeSpeaker: string | null;
  memberVotes: Record<string, string>;
}

export default function BoardroomTable({ consensus, activeSpeaker, memberVotes }: BoardroomTableProps) {
  return (
    <div className="flex-1 flex justify-center items-center relative select-none scale-[0.88] md:scale-100">
      <div className="meeting-table-layout">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black/60 border border-white/5 rounded-full overflow-hidden flex flex-col justify-center items-center shadow-[0_0_15px_rgba(0,240,255,0.1)]">
          <div
            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-500/25 to-purple-500/25 transition-all duration-500"
            style={{ height: `${consensus}%` }}
          />
          <span className="text-[7.5px] font-bold text-white/40 z-10">CONSENSUS</span>
          <span className="text-lg font-black text-white z-10">{consensus}%</span>
        </div>

        {boardroomSeats.map((seat) => {
          const isActive = activeSpeaker === seat.id;
          const vote = memberVotes[seat.id];
          return (
            <div
              key={seat.id}
              className="executive-chair group"
              style={seat.style}
            >
              <div
                className="w-10 h-10 rounded-full bg-black/80 border text-[10px] font-bold text-white/60 flex flex-col justify-center items-center transition-all duration-300 relative"
                style={{
                  borderColor: isActive ? seat.color : "rgba(255,255,255,0.06)",
                  boxShadow: isActive ? `0 0 12px ${seat.color}` : "none",
                  color: isActive ? "#ffffff" : undefined,
                }}
              >
                <span className="leading-none mt-0.5">{seat.name}</span>
                <span className={`font-mono text-[7px] border rounded px-1 mt-0.5 leading-tight ${getVoteBadgeColor(vote)}`}>
                  {vote || "?"}
                </span>
              </div>
              <span
                className="absolute bottom-[-16px] text-[8.5px] text-white/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity select-none font-semibold"
                style={{ color: isActive ? seat.color : undefined }}
              >
                {seat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
