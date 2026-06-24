// ── HackerArena Types ──────────────────────────────────────

export interface CyberLog {
  time: string;
  threat: string;
  shield: string;
  level: "INFO" | "WARN" | "CRITICAL" | "RESOLVED";
}

export interface BattleScenario {
  threat: string;
  shield: string;
  level: "INFO" | "WARN" | "CRITICAL" | "RESOLVED";
  score: number;
  severity: string;
}

export type Difficulty = "easy" | "medium" | "hard" | "nightmare";

export interface DifficultyConfig {
  label: string;
  color: string;
  rounds: number;
  interval: number;
  scoreBase: number;
}

// ── Battle Scenario Pools ──────────────────────────────────

export const BATTLE_POOLS: Record<Difficulty, BattleScenario[]> = {
  easy: [
    { threat: "SQL injection payload sent to gateway /v1/auth/verify.", shield: "Intercepting payload... Ingress parameters sanitized. Attack aborted.", level: "RESOLVED", score: 94, severity: "LOW" },
    { threat: "Phishing link detected in internal Slack #dev channel.", shield: "Quarantining message. Alerting SOC team. Link blacklisted.", level: "RESOLVED", score: 96, severity: "LOW" },
    { threat: "Outdated SSL certificate on api-gateway.", shield: "Auto-renewing Let's Encrypt certificate. Reloading nginx.", level: "RESOLVED", score: 98, severity: "LOW" },
    { threat: "Port scan scan-ingress-02 searching for open SSH ports.", shield: "Ingress security rules throttling port scanning IPs. All ports secured.", level: "RESOLVED", score: 95, severity: "LOW" },
    { threat: "Expired third-party dev dependency alert on react-router.", shield: "Auto-dependency scanner lock file patching. Upgrading to v6.23.", level: "RESOLVED", score: 97, severity: "LOW" },
    { threat: "S3 bucket cross-origin policy mismatch on assets volume.", shield: "Applying IAM bucket restriction policy. Restoring CORS rules.", level: "RESOLVED", score: 99, severity: "LOW" },
    { threat: "Staging database password leak in local developer configs.", shield: "Revoking staging credential hashes. Re-rolling secrets in Vault.", level: "RESOLVED", score: 96, severity: "LOW" },
  ],
  medium: [
    { threat: "Syn flood DDoS attack simulation launched: 50,000 requests/sec targeting gateway-k8s-pod.", shield: "Cloud firewall rate limits enabled. Dropping packets from malicious IP ranges.", level: "WARN", score: 82, severity: "HIGH" },
    { threat: "Brute force credential scan targeting GitLab environment variables file.", shield: "SSH access token disabled. Root access endpoints quarantined.", level: "RESOLVED", score: 91, severity: "LOW" },
    { threat: "Malformed JSON payload injection attempt on /v2/deploy endpoint.", shield: "Payload validation triggered. Schema mismatch detected. Request blocked.", level: "RESOLVED", score: 87, severity: "MEDIUM" },
    { threat: "API flooding attempt (HTTP 429) targeting payment webhook gateway.", shield: "Enforcing Redis-backed token bucket rate limits. Malicious clients throttled.", level: "WARN", score: 85, severity: "MEDIUM" },
    { threat: "Rogue Docker container starting unauthorized outbound connections on port 25.", shield: "Killing container daemon process. Restricting namespace network egress rules.", level: "WARN", score: 81, severity: "HIGH" },
    { threat: "Local file inclusion payload detected in profile file upload handler.", shield: "Payload sanitized. Mime-type validated. Path traversal payload dropped.", level: "RESOLVED", score: 89, severity: "MEDIUM" },
    { threat: "Dangling CNAME pointer detected on subdomain docs.transend.app.", shield: "Purging dangling DNS records from Cloudflare zone configuration.", level: "RESOLVED", score: 92, severity: "LOW" },
  ],
  hard: [
    { threat: "Critical exploit payload discovered inside billing Helm charts manifests.", shield: "Isolating billing-sync-db container. Re-generating Helm values parameters.", level: "CRITICAL", score: 64, severity: "CRITICAL" },
    { threat: "Zero-day privilege escalation attempt via Kubernetes RBAC.", shield: "RBAC policy rollback to last-known-good. Blocking all service account token requests.", level: "CRITICAL", score: 55, severity: "CRITICAL" },
    { threat: "Supply chain attack: malicious npm package detected in lockfile.", shield: "Purging package from registry. Rolling back to cached integrity hash.", level: "WARN", score: 72, severity: "HIGH" },
    { threat: "Memory leak crash loop targeting core session database nodes.", shield: "Failing over to Redis cluster replicas. Scaling session pods by 2x.", level: "WARN", score: 70, severity: "HIGH" },
    { threat: "Cross-Site Scripting (XSS) payload bypass on dashboard feed inputs.", shield: "Enforcing Strict Content-Security-Policy (CSP) headers. Filtering feed templates.", level: "CRITICAL", score: 68, severity: "CRITICAL" },
    { threat: "DNS spoofing attack redirecting internal registry domains.", shield: "Rolling DNS SEC keys. Flushing CoreDNS cache across all worker nodes.", level: "WARN", score: 75, severity: "HIGH" },
    { threat: "Internal API service account key committed to public GitHub mirror.", shield: "Revoking key immediately in IAM. Auditing API logs for leak access.", level: "CRITICAL", score: 60, severity: "CRITICAL" },
  ],
  nightmare: [
    { threat: "🚨 FULL COMPROMISE: Attacker gained root access to prod-db-01 via VPN exploit.", shield: "EMERGENCY: Shutting down cluster. Initiating failover to DR region. Cryptographic audit triggered.", level: "CRITICAL", score: 34, severity: "CRITICAL" },
    { threat: "💀 Ransomware encryption detected on CI/CD artifact storage volume.", shield: "Immutable backup restore initiated. Filesystem locked. CIRT team alerted.", level: "CRITICAL", score: 28, severity: "CRITICAL" },
    { threat: "🔥 Exfiltration: 2TB of customer data being streamed to external IP.", shield: "KILL SWITCH ENGAGED: All egress traffic blocked. Data leak containment active.", level: "CRITICAL", score: 41, severity: "CRITICAL" },
    { threat: "🚨 ACTIVE MAN-IN-THE-MIDDLE: Attacker spoofing internal VPC load balancers.", shield: "Enforcing strict mTLS encryption across service mesh. Re-keying TLS certs.", level: "CRITICAL", score: 45, severity: "CRITICAL" },
    { threat: "💀 Malicious payload injected into Alpine Docker base image in registry.", shield: "Registry image locked. Re-building container builds from verified bare metal baseline.", level: "CRITICAL", score: 38, severity: "CRITICAL" },
    { threat: "🔥 Distributed ransomware attack targeting all elastic log indexes.", shield: "Isolating log volumes. Restoring index state from cold-storage backup clusters.", level: "CRITICAL", score: 42, severity: "CRITICAL" },
    { threat: "🚨 Kubernetes API server facing massive DDoS, control plane unresponsive.", shield: "Isolating control plane subnet. Directing traffic to multi-region cluster backups.", level: "CRITICAL", score: 31, severity: "CRITICAL" },
  ],
};

// ── Difficulty Configuration ───────────────────────────────

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { label: "Easy", color: "#10b981", rounds: 3, interval: 2000, scoreBase: 10 },
  medium: { label: "Medium", color: "#f59e0b", rounds: 5, interval: 2500, scoreBase: 25 },
  hard: { label: "Hard", color: "#ef4444", rounds: 7, interval: 3000, scoreBase: 50 },
  nightmare: { label: "Nightmare", color: "#a855f7", rounds: 10, interval: 2000, scoreBase: 100 },
};

// ── Difficulty Selector Options ────────────────────────────

export const DIFFICULTY_ENTRIES = Object.entries(DIFFICULTY_CONFIG) as [Difficulty, DifficultyConfig][];

// ── Helpers ────────────────────────────────────────────────

/**
 * Get the CSS class for a severity level.
 */
export function getSeverityColor(sev: string): string {
  if (sev === "CRITICAL" || sev === "HIGH") return "text-[#ef4444]";
  if (sev === "WARN") return "text-[#f59e0b]";
  return "text-[#10b981]";
}

/**
 * Get the CSS class for a numeric score.
 */
export function getScoreStyle(score: number): string {
  if (score < 70) return "text-[#ef4444] border-red-500/20 bg-red-500/5";
  if (score < 90) return "text-[#f59e0b] border-amber-500/20 bg-amber-500/5";
  return "text-[#10b981] border-emerald-500/20 bg-emerald-500/5";
}

/**
 * Pick random rounds from the pool, shuffled.
 * If the rounds needed exceeds the pool length, shuffle-repeat the pool.
 */
export function pickRounds(difficulty: Difficulty): BattleScenario[] {
  const config = DIFFICULTY_CONFIG[difficulty];
  const pool = BATTLE_POOLS[difficulty];
  const roundsNeeded = config.rounds;

  const result: BattleScenario[] = [];
  while (result.length < roundsNeeded) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    result.push(...shuffled);
  }
  return result.slice(0, roundsNeeded);
}
