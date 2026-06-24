"use client";

import React from "react";
import type { FilterType } from "./digitalTwinData";

interface DigitalTwinFilterBarProps {
  filterType: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "ALL", label: "ALL" },
  { value: "SERVICE", label: "SERVICES" },
  { value: "REPOSITORY", label: "REPOS" },
  { value: "INFRASTRUCTURE", label: "INFRA" },
  { value: "AGENT", label: "AGENTS" },
];

export default function DigitalTwinFilterBar({ filterType, onFilterChange }: DigitalTwinFilterBarProps) {
  return (
    <div className="flex bg-black/45 border border-white/10 rounded-lg p-0.5 gap-0.5">
      {filterOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onFilterChange(opt.value)}
          className={`font-mono text-[9px] font-bold px-2 py-1 rounded cursor-pointer transition ${
            filterType === opt.value
              ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20"
              : "text-white/45 hover:text-white hover:bg-white/5"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
