"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Users, Award, ShieldAlert } from "lucide-react";

interface SpeechBubble {
  sender: "ceo" | "cto" | "ciso" | "qa" | "devops" | "product";
  text: string;
}

interface BoardMember {
  id: "ceo" | "cto" | "ciso" | "qa" | "devops" | "product";
  name: string;
  label: string;
  role: string;
  color: string;
  style: React.CSSProperties;
}

const boardroomSeats: BoardMember[] = [
  { id: "ceo", name: "CEO", label: "CEO Agent", role: "Chief Executive Officer", color: "#a855f7", style: { top: "5%", left: "50%" } },
  { id: "cto", name: "CTO", label: "CTO Agent", role: "Chief Technology Officer", color: "#00f0ff", style: { top: "27%", left: "93%" } },
  { id: "ciso", name: "CISO", label: "CISO Agent", role: "Security CISO Agent", color: "#10b981", style: { top: "73%", left: "93%" } },
  { id: "qa", name: "QA", label: "QA Director", role: "QA Director Agent", color: "#f59e0b", style: { top: "95%", left: "50%" } },
  { id: "devops", name: "OPS", label: "DevOps Lead", role: "DevOps SRE Agent", color: "#ef4444", style: { top: "73%", left: "7%" } },
  { id: "product", name: "PROD", label: "Product Lead", role: "Product Strategy Lead", color: "#0072ff", style: { top: "27%", left: "7%" } }
];

const debatesByTopic = {
  auth_debt: {
    title: "Ship v1.12 with auth-service connection debt?",
    lines: [
      { sender: "ceo", text: "We are evaluating a 2-week launch delay to resolve technical debt. I want a complete risk assessment." },
      { sender: "cto", text: "Our digital twin maps 80ms latency spikes in auth-service. Delaying allows us to resolve connection thread pooling." },
      { sender: "ciso", text: "Our security scan logs detect minor container vulnerabilities. I vote for delay to compile Blue Team patches." },
      { sender: "product", text: "Market window remains tight. However, customer risk is high if service availability is compromised." },
      { sender: "qa", text: "Test coverage on payment gateways is at 68%. Delaying release lets us reach our 90% regression target." },
      { sender: "devops", text: "Kubernetes pod recycle sequence takes longer under load. Delaying allows us to recycle replicas safely." },
      { sender: "ceo", text: "Consensus hits 82% against deployment. Release postponed. 2-week buffer scheduled." }
    ],
    votes: { ceo: "DELAY", cto: "DELAY", ciso: "DELAY", product: "SHIP", qa: "DELAY", devops: "DELAY" },
    consensus: 83,
    verdict: "Consensus reached. Release postponed by 2 weeks to clear database pool debt and vulnerabilities."
  },
  hotfix: {
    title: "Deploy emergency hotfix for payment gateway sync?",
    lines: [
      { sender: "ceo", text: "Should we push the emergency hotfix for stripe gateway desynchronization immediately?" },
      { sender: "cto", text: "Code changes are minimal. We\u2019ve bypassed auth-service caching parameters to force immediate updates." },
      { sender: "qa", text: "We ran only 10 smoke tests, but billing integration specs passed successfully. Code coverage is low." },
      { sender: "product", text: "We are losing $1,400 per hour in stuck orders. This is a critical blocker. We must deploy immediately." },
      { sender: "ciso", text: "Bypassing caching does not introduce new ports or vectors. Threat vector checks are green." },
      { sender: "devops", text: "Replicas are ready to run rolling updates. Can recycle within 45 seconds. Highly recommend deploy." },
      { sender: "ceo", text: "Agreed. Financial and SRE consensus says deploy immediately. Hotfix pipeline engaged." }
    ],
    votes: { ceo: "DEPLOY", cto: "DEPLOY", ciso: "DEPLOY", product: "DEPLOY", qa: "HOLD", devops: "DEPLOY" },
    consensus: 88,
    verdict: "Consensus reached (88%). Emergency deployment approved. CI/CD pipeline triggered for release."
  },
  failover: {
    title: "Deploy active-active multi-region K8s replica clusters?",
    lines: [
      { sender: "ceo", text: "Debating the transition to active-active multi-region Kubernetes database deployment. Cost impact vs uptime gains." },
      { sender: "devops", text: "Multi-region increases sync overhead by 12ms but secures 99.999% uptime guarantees." },
      { sender: "product", text: "Enterprise SLAs require five-nines uptime. Uptime gains represent a 15% boost in target retention." },
      { sender: "ciso", text: "Active-active duplicates the threat surface. Security agents must monitor double the ingress controllers." },
      { sender: "cto", text: "Our data mapping twin predicts PostgreSQL replica latency could spike under peak load. Risk index is moderate." },
      { sender: "qa", text: "Testing database replication desync takes a week. QA suggests a staging simulation before prod." },
      { sender: "ceo", text: "We will run a 1-week staging simulation first before regional deployment." }
    ],
    votes: { ceo: "HOLD", cto: "HOLD", ciso: "HOLD", product: "DEPLOY", qa: "HOLD", devops: "DEPLOY" },
    consensus: 33,
    verdict: "Consensus deferred (33%). Transition held. QA to execute staging replication simulation first."
  }
};

export default function BoardroomModule({ triggerSignal }: { triggerSignal: number }) {
  const [topic, setTopic] = useState<keyof typeof debatesByTopic | "custom">("auth_debt");
  const [customTopic, setCustomTopic] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [consensus, setConsensus] = useState(50);
  const [bubbles, setBubbles] = useState<SpeechBubble[]>([]);
  const [verdict, setVerdict] = useState("Waiting for boardroom debate session to convene...");
  const [memberVotes, setMemberVotes] = useState<Record<string, string>>({
    ceo: "?", cto: "?", ciso: "?", qa: "?", devops: "?", product: "?"
  });
  const [isDebating, setIsDebating] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const getSeatInfo = (id: string) => {
    return boardroomSeats.find(s => s.id === id);
  };

  const getVoteBadgeColor = (vote: string) => {
    if (vote === "?" || !vote) return "bg-white/5 text-white/30 border-white/10";
    if (vote === "SHIP" || vote === "DEPLOY" || vote === "YES") return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    if (vote === "DELAY" || vote === "NO") return "bg-red-500/10 border-red-500/30 text-red-400";
    return "bg-amber-500/10 border-amber-500/30 text-amber-400";
  };

  const generateCustomDebate = (proposal: string) => {
    const keyword = proposal.length > 40 ? proposal.slice(0, 40) + "\u2026" : proposal;
    return {
      title: proposal,
      lines: [
        { sender: "ceo" as const, text: `I\u2019m convening this session to evaluate: \u201c${keyword}\u201d. Let\u2019s hear all risk and opportunity angles.` },
        { sender: "cto" as const, text: `From a technical standpoint, \u201c${keyword}\u201d requires architecture review. Our digital twin shows moderate integration complexity and potential API surface changes.` },
        { sender: "ciso" as const, text: `Security implications of \u201c${keyword}\u201d must be assessed. I\u2019m running threat models on new attack vectors this introduces. Preliminary scan shows low-to-moderate risk.` },
        { sender: "product" as const, text: `Market analysis for \u201c${keyword}\u201d looks favorable. Customer retention impact is estimated at +8%. However, we need to validate with A/B testing first.` },
        { sender: "qa" as const, text: `Testing for \u201c${keyword}\u201d would require 3-5 days of regression coverage. Current test coverage baseline is 74%. I recommend staging validation before production.` },
        { sender: "devops" as const, text: `Infrastructure impact of \u201c${keyword}\u201d is manageable. Rolling deployment with canary release is feasible. Estimated pod recycle time: 90 seconds.` },
        { sender: "ceo" as const, text: `Consensus analysis complete for \u201c${keyword}\u201d. Proceeding with staged rollout pending QA validation. 2-week pilot window approved.` }
      ],
      votes: { ceo: "APPROVE", cto: "APPROVE", ciso: "HOLD", product: "APPROVE", qa: "HOLD", devops: "APPROVE" } as Record<string, string>,
      consensus: 67,
      verdict: `Consensus reached (67%) for \u201c${keyword}\u201d. Staged rollout approved with QA validation gate. 2-week pilot window scheduled.`
    };
  };

  const startDebate = (selectedTopic: keyof typeof debatesByTopic | "custom") => {
    clearInterval(intervalRef.current!);
    setIsDebating(true);
    setBubbles([]);
    setConsensus(50);
    setVerdict("Executive debate in progress...");
    setActiveSpeaker(null);
    setMemberVotes({
      ceo: "?", cto: "?", ciso: "?", qa: "?", devops: "?", product: "?"
    });

    const debateData = selectedTopic === "custom" && customTopic.trim()
      ? generateCustomDebate(customTopic.trim())
      : debatesByTopic[selectedTopic === "custom" ? "auth_debt" : selectedTopic];
    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < debateData.lines.length) {
        const line = debateData.lines[index];
        setActiveSpeaker(line.sender);
        setBubbles(prev => [...prev, { sender: line.sender as SpeechBubble['sender'], text: line.text }]);

        if (index > 0) {
          const voter = debateData.lines[index - 1].sender;
          const voteVal = debateData.votes[voter as keyof typeof debateData.votes];
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
      }
    }, 2500);
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (triggerSignal === 0) return;
    startDebate("auth_debt");
  }, [triggerSignal]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [bubbles]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 h-[485px] animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* Visual circular table card */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-2 mb-2 select-none">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              AI Boardroom Executive Panel
            </h3>
            <p className="text-[10px] text-white/40 mt-0.5">
              Virtual executive meeting of AI agents debating key business decisions.
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <select
              disabled={isDebating}
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value as keyof typeof debatesByTopic | "custom");
                if (e.target.value !== "custom") setCustomTopic("");
              }}
              className="bg-black/45 border border-white/10 rounded px-2 py-1 text-[10px] text-white font-semibold outline-none focus:border-[#00f0ff]/40 transition"
            >
              <option value="auth_debt">Topic: Auth DB Debt</option>
              <option value="hotfix">Topic: Emergency Hotfix</option>
              <option value="failover">Topic: Multi-Region Failover</option>
              <option value="custom">Custom Proposal...</option>
            </select>
            {topic === "custom" && (
              <input
                type="text"
                disabled={isDebating}
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customTopic.trim()) startDebate("custom");
                }}
                placeholder="Type your debate proposal..."
                className="bg-black/45 border border-white/10 rounded px-2 py-1 text-[10px] text-white font-semibold outline-none focus:border-[#a855f7]/40 transition placeholder-white/25 min-w-[180px] flex-1"
              />
            )}
            <button
              disabled={isDebating || (topic === "custom" && !customTopic.trim())}
              onClick={() => startDebate(topic)}
              className="font-sans text-[10px] font-bold text-slate-950 bg-[#00f0ff] hover:bg-[#00f0ff]/80 transition rounded px-3 py-1 cursor-pointer disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed flex items-center gap-1 active:scale-[0.98]"
            >
              <Play size={10} fill="currentColor" />
              Convene
            </button>
          </div>
        </div>

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
                      color: isActive ? "#ffffff" : undefined
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
      </div>

      {/* Speech bubbles dialogue logs feed */}
      <div className="glass-panel p-5 flex flex-col h-full overflow-hidden justify-between">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
          <h3 className="text-xs font-bold text-white tracking-wide uppercase select-none">
            Executive Discourse Feed
          </h3>
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/25 text-[#a855f7] tracking-wider uppercase select-none">
            {isDebating ? "DEBATE ONGOING" : "STANDBY"}
          </span>
        </div>

        <div 
          ref={feedRef}
          className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 py-1"
        >
          {bubbles.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center gap-2 text-white/30 select-none text-center">
              <Users size={24} className="animate-pulse" />
              <p className="text-xs">
                Select a topic and click &quot;Convene&quot; or command Voice CTO to start debate transcripts.
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

        <div 
          className="mt-3 p-3 rounded-lg border border-dashed text-xs bg-cyan-500/[0.02] select-none"
          style={{
            borderColor: bubbles.length > 0 && !isDebating ? "rgba(16, 185, 129, 0.25)" : "rgba(255,255,255,0.06)",
            boxShadow: bubbles.length > 0 && !isDebating ? "0 0 10px rgba(16,185,129,0.08)" : "none"
          }}
        >
          <h4 className="font-bold uppercase tracking-wider text-[9px] text-[#00f0ff] mb-1 select-none flex items-center gap-1.5">
            {bubbles.length > 0 && !isDebating ? <Award size={10} className="text-[#10b981]" /> : <ShieldAlert size={10} />}
            <span>Final Verdict Recommendation</span>
          </h4>
          <p className={`text-[10.5px] leading-normal ${bubbles.length > 0 && !isDebating ? "text-[#10b981] font-semibold" : "text-white/40"}`}>
            {verdict}
          </p>
        </div>
      </div>

    </div>
  );
}
