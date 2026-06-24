import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output disabled for custom WebSocket server.
  // The server.ts handles both HTTP and WebSocket connections.
};

export default nextConfig;
