export interface SpeechBubble {
  sender: "ceo" | "cto" | "ciso" | "qa" | "devops" | "product";
  text: string;
}

export interface BoardMember {
  id: "ceo" | "cto" | "ciso" | "qa" | "devops" | "product";
  name: string;
  label: string;
  role: string;
  color: string;
  style: React.CSSProperties;
}

export interface AIDebateResult {
  lines: { sender: string; text: string }[];
  votes: Record<string, string>;
  consensus: number;
  verdict: string;
  title: string;
}

export const boardroomSeats: BoardMember[] = [
  { id: "ceo", name: "CEO", label: "CEO Agent", role: "Chief Executive Officer", color: "#a855f7", style: { top: "5%", left: "50%" } },
  { id: "cto", name: "CTO", label: "CTO Agent", role: "Chief Technology Officer", color: "#00f0ff", style: { top: "27%", left: "93%" } },
  { id: "ciso", name: "CISO", label: "CISO Agent", role: "Security CISO Agent", color: "#10b981", style: { top: "73%", left: "93%" } },
  { id: "qa", name: "QA", label: "QA Director", role: "QA Director Agent", color: "#f59e0b", style: { top: "95%", left: "50%" } },
  { id: "devops", name: "OPS", label: "DevOps Lead", role: "DevOps SRE Agent", color: "#ef4444", style: { top: "73%", left: "7%" } },
  { id: "product", name: "PROD", label: "Product Lead", role: "Product Strategy Lead", color: "#0072ff", style: { top: "27%", left: "7%" } },
];

// Hardcoded fallback debates — used when AI is unavailable
export const fallbackDebates: Record<string, { title: string; lines: SpeechBubble[]; votes: Record<string, string>; consensus: number; verdict: string }> = {
  auth_debt: {
    title: "Ship v1.12 with auth-service connection debt?",
    lines: [
      { sender: "ceo", text: "We are evaluating a 2-week launch delay to resolve technical debt. I want a complete risk assessment." },
      { sender: "cto", text: "Our digital twin maps 80ms latency spikes in auth-service. Delaying allows us to resolve connection thread pooling." },
      { sender: "ciso", text: "Our security scan logs detect minor container vulnerabilities. I vote for delay to compile Blue Team patches." },
      { sender: "product", text: "Market window remains tight. However, customer risk is high if service availability is compromised." },
      { sender: "qa", text: "Test coverage on payment gateways is at 68%. Delaying release lets us reach our 90% regression target." },
      { sender: "devops", text: "Kubernetes pod recycle sequence takes longer under load. Delaying allows us to recycle replicas safely." },
      { sender: "ceo", text: "Consensus hits 82% against deployment. Release postponed. 2-week buffer scheduled." },
    ],
    votes: { ceo: "DELAY", cto: "DELAY", ciso: "DELAY", product: "SHIP", qa: "DELAY", devops: "DELAY" },
    consensus: 83,
    verdict: "Consensus reached. Release postponed by 2 weeks to clear database pool debt and vulnerabilities.",
  },
  hotfix: {
    title: "Deploy emergency hotfix for payment gateway sync?",
    lines: [
      { sender: "ceo", text: "Should we push the emergency hotfix for stripe gateway desynchronization immediately?" },
      { sender: "cto", text: "Code changes are minimal. We've bypassed auth-service caching parameters to force immediate updates." },
      { sender: "qa", text: "We ran only 10 smoke tests, but billing integration specs passed successfully. Code coverage is low." },
      { sender: "product", text: "We are losing $1,400 per hour in stuck orders. This is a critical blocker. We must deploy immediately." },
      { sender: "ciso", text: "Bypassing caching does not introduce new ports or vectors. Threat vector checks are green." },
      { sender: "devops", text: "Replicas are ready to run rolling updates. Can recycle within 45 seconds. Highly recommend deploy." },
      { sender: "ceo", text: "Agreed. Financial and SRE consensus says deploy immediately. Hotfix pipeline engaged." },
    ],
    votes: { ceo: "DEPLOY", cto: "DEPLOY", ciso: "DEPLOY", product: "DEPLOY", qa: "HOLD", devops: "DEPLOY" },
    consensus: 88,
    verdict: "Consensus reached (88%). Emergency deployment approved. CI/CD pipeline triggered for release.",
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
      { sender: "ceo", text: "We will run a 1-week staging simulation first before regional deployment." },
    ],
    votes: { ceo: "HOLD", cto: "HOLD", ciso: "HOLD", product: "DEPLOY", qa: "HOLD", devops: "DEPLOY" },
    consensus: 33,
    verdict: "Consensus deferred (33%). Transition held. QA to execute staging replication simulation first.",
  },
};

export const fallbackCustomDebate = (proposal: string) => {
  const keyword = proposal.length > 40 ? proposal.slice(0, 40) + "\u2026" : proposal;
  return {
    title: proposal,
    lines: [
      { sender: "ceo" as const, text: `I'm convening this session to evaluate: "${keyword}". Let's hear all risk and opportunity angles.` },
      { sender: "cto" as const, text: `From a technical standpoint, "${keyword}" requires architecture review. Our digital twin shows moderate integration complexity and potential API surface changes.` },
      { sender: "ciso" as const, text: `Security implications of "${keyword}" must be assessed. I'm running threat models on new attack vectors this introduces. Preliminary scan shows low-to-moderate risk.` },
      { sender: "product" as const, text: `Market analysis for "${keyword}" looks favorable. Customer retention impact is estimated at +8%. However, we need to validate with A/B testing first.` },
      { sender: "qa" as const, text: `Testing for "${keyword}" would require 3-5 days of regression coverage. Current test coverage baseline is 74%. I recommend staging validation before production.` },
      { sender: "devops" as const, text: `Infrastructure impact of "${keyword}" is manageable. Rolling deployment with canary release is feasible. Estimated pod recycle time: 90 seconds.` },
      { sender: "ceo" as const, text: `Consensus analysis complete for "${keyword}". Proceeding with staged rollout pending QA validation. 2-week pilot window approved.` },
    ],
    votes: { ceo: "APPROVE", cto: "APPROVE", ciso: "HOLD", product: "APPROVE", qa: "HOLD", devops: "APPROVE" } as Record<string, string>,
    consensus: 67,
    verdict: `Consensus reached (67%) for "${keyword}". Staged rollout approved with QA validation gate. 2-week pilot window scheduled.`,
  };
};

export const getVoteBadgeColor = (vote: string) => {
  if (vote === "?" || !vote) return "bg-white/5 text-white/30 border-white/10";
  if (vote === "SHIP" || vote === "DEPLOY" || vote === "YES" || vote === "APPROVE") return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  if (vote === "DELAY" || vote === "NO") return "bg-red-500/10 border-red-500/30 text-red-400";
  return "bg-amber-500/10 border-amber-500/30 text-amber-400";
};
