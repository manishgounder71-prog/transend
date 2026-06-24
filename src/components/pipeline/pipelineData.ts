export interface LogLine {
  text: string;
  type: "info" | "error" | "agent" | "success";
  time: string;
}

export type PipelineState = "idle" | "running_fail" | "failed" | "healing" | "healed";

export function getStageColor(pipelineState: PipelineState, stage: string): string {
  if (pipelineState === "idle") return "border-white/10 text-white/40";

  switch (stage) {
    case "build":
      if (pipelineState === "running_fail" || pipelineState === "failed" || pipelineState === "healing" || pipelineState === "healed") {
        return "border-[#10b981] text-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.2)]";
      }
      return "border-white/10 text-white/40";
    case "test":
      if (pipelineState === "running_fail") return "border-cyan-500 text-cyan-400 animate-pulse";
      if (pipelineState === "failed") return "border-[#ef4444] text-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.2)]";
      if (pipelineState === "healing") return "border-purple-500 text-purple-400 animate-pulse";
      if (pipelineState === "healed") return "border-[#10b981] text-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.2)]";
      return "border-white/10 text-white/40";
    case "security":
      if (pipelineState === "healing") return "border-purple-500 text-purple-400 animate-pulse";
      if (pipelineState === "healed") return "border-[#10b981] text-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.2)]";
      return "border-white/10 text-white/40";
    case "deploy":
      if (pipelineState === "healing") return "border-purple-500 text-purple-400 animate-pulse";
      if (pipelineState === "healed") return "border-[#10b981] text-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.2)]";
      return "border-white/10 text-white/40";
    default:
      return "border-white/10 text-white/40";
  }
}
