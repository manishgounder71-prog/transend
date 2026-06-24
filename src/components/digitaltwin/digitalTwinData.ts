export interface TwinNode {
  id: string;
  name: string;
  type: "ROOT" | "SERVICE" | "REPOSITORY" | "INFRASTRUCTURE" | "AGENT";
  status: "NOMINAL" | "RISK" | "CRITICAL";
  x3d: number;
  y3d: number;
  z3d: number;
  loc: string;
  pods: string;
  health: string;
  author: string;
  linkTo?: string;

  // Projected 2D parameters
  x2d?: number;
  y2d?: number;
  radius?: number;
  depthZ?: number;
}

export function getStatusColor(status: string) {
  switch (status) {
    case "NOMINAL":
      return "text-[#10b981]";
    case "RISK":
      return "text-[#f59e0b]";
    case "CRITICAL":
      return "text-[#ef4444]";
    default:
      return "text-white";
  }
}

export function getNodeColor(node: TwinNode): string {
  if (node.status === "RISK") return "var(--color-warning)";
  if (node.status === "CRITICAL") return "var(--color-critical)";
  if (node.type === "AGENT") return "var(--color-purple)";
  if (node.type === "ROOT") return "var(--color-cyan)";
  return "var(--color-blue)";
}

export const defaultNodes: TwinNode[] = [
  { id: "root", name: "Orbit Engine Hub", type: "ROOT", status: "NOMINAL", x3d: 0, y3d: 0, z3d: 0, loc: "520k lines", pods: "12 Pods", health: "98.4%", author: "System Architect" },
  { id: "auth", name: "auth-service-v3", type: "SERVICE", status: "RISK", x3d: -80, y3d: -40, z3d: 40, loc: "45k lines", pods: "3 Pods", health: "78%", author: "Arianna Haradon", linkTo: "root" },
  { id: "gateway", name: "gateway-k8s-pod", type: "INFRASTRUCTURE", status: "CRITICAL", x3d: 60, y3d: 60, z3d: -60, loc: "YAML Configs", pods: "8 Pods", health: "64%", author: "DevOps Lead", linkTo: "root" },
  { id: "payments", name: "payment_gateway.py", type: "REPOSITORY", status: "NOMINAL", x3d: 90, y3d: -60, z3d: 20, loc: "18k lines", pods: "4 Pods", health: "92%", author: "Lee Tickett", linkTo: "root" },
  { id: "billing", name: "billing-sync-db", type: "INFRASTRUCTURE", status: "NOMINAL", x3d: -70, y3d: 70, z3d: -30, loc: "PostgreSQL Replica", pods: "1 Master", health: "95%", author: "Raimund Hook", linkTo: "root" },
  { id: "helpers", name: "clean_string_util", type: "REPOSITORY", status: "NOMINAL", x3d: 0, y3d: -95, z3d: -70, loc: "1.2k lines", pods: "Local Library", health: "100%", author: "Mattias Michaux", linkTo: "root" },
  { id: "orb_ciso", name: "ciso-security-agent", type: "AGENT", status: "NOMINAL", x3d: -110, y3d: 0, z3d: -40, loc: "Security Guardian", pods: "Agent Core", health: "100%", author: "System Shield", linkTo: "root" },
];

export type FilterType = "ALL" | "SERVICE" | "REPOSITORY" | "INFRASTRUCTURE" | "AGENT";
