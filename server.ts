import { createServer, type IncomingMessage } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import type { ServerEvent, ServerEventType, ServerEventMap } from "./src/lib/ws-types";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ── WebSocket Event Bus ──
// Manages connected clients and broadcasts typed events.

const clients = new Set<WebSocket>();

function broadcast<T extends ServerEventType>(event: ServerEvent<T>): void {
  const data = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

// ── Mock Activity Generator ──
// Pushes realistic engineering activity events every 5.5 seconds.
// In production, this would be replaced with real GitLab webhook events.

const activityLogs: Array<{
  sender: string;
  message: string;
  type: ServerEventMap["activity:log"]["type"];
}> = [
  { sender: "CISO", message: "Running automated static code analysis check on gateway config maps.", type: "success" },
  { sender: "CTO", message: "Refactoring database index layout on user_profile tables to optimize search speed.", type: "info" },
  { sender: "QA", message: "All E2E check validations passed on branch auth-service-v3. Staging deploy pending.", type: "warn" },
  { sender: "DEVOPS", message: "Kubernetes pod recycle sequence initiated for transaction db replica nodes.", type: "error" },
  { sender: "PRODUCT", message: "Updating product roadmap indices. Release confidence projected at 84%.", type: "purple" },
  { sender: "CEO", message: "Engineering metrics synchronized. Calculated corporate dev hours saved: 928 hours.", type: "success" },
  { sender: "CISO", message: "Port intrusion scan check completed in Security Arena. Threat severity: LOW.", type: "success" },
];

let activityIndex = 0;
let activityInterval: ReturnType<typeof setInterval> | null = null;

function startActivityGenerator(): void {
  if (activityInterval) return;

  activityInterval = setInterval(() => {
    const entry = activityLogs[activityIndex % activityLogs.length];
    broadcast({
      type: "activity:log",
      payload: {
        sender: entry.sender,
        message: entry.message,
        type: entry.type,
        time: new Date().toLocaleTimeString(),
      },
    });
    activityIndex++;
  }, 5500);
}

function stopActivityGenerator(): void {
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }
}

// ── Start Server ──

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // ── WebSocket Server ──
  // Upgrades HTTP connections to WebSocket on the /ws path.

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    clients.add(ws);
    console.log(`[WS] Client connected (${clients.size} total)`);

    // Send initial connection confirmation
    ws.send(
      JSON.stringify({
        type: "system:status",
        payload: { message: "Connected to Orbit CTO X real-time stream", level: "info" },
      }),
    );

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`[WS] Client disconnected (${clients.size} remaining)`);
      if (clients.size === 0) {
        stopActivityGenerator();
      }
    });

    ws.on("error", () => {
      clients.delete(ws);
    });

    ws.on("message", (data: Buffer) => {
      try {
        const command = JSON.parse(data.toString());
        if (command.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", payload: {} }));
        }
      } catch {
        // Ignore malformed commands
      }
    });

    // Start activity generator when first client connects
    if (!activityInterval) {
      startActivityGenerator();
    }
  });

  // Handle HTTP upgrade requests for WebSocket
  httpServer.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url!, true);

    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  httpServer.listen(port, hostname, () => {
    console.log(
      `\n  🛰  Orbit CTO X running at http://${hostname}:${port}`,
    );
    console.log(`  🔌 WebSocket server at ws://${hostname}:${port}/ws\n`);
  });

  // ── Graceful Shutdown ──

  function shutdown(signal: string): void {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    stopActivityGenerator();

    // Close all WebSocket connections
    for (const client of clients) {
      client.close(1001, "Server shutting down");
    }
    clients.clear();

    wss.close(() => {
      httpServer.close(() => {
        console.log(`[${signal}] Server stopped.`);
        process.exit(0);
      });
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error(`[${signal}] Forced exit after timeout.`);
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
});
