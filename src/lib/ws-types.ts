// ── Server → Client Push Events ──

export interface ActivityLogPayload {
  sender: string;
  message: string;
  type: "info" | "success" | "warn" | "error" | "purple";
  time?: string;
}

export interface PipelineStatusPayload {
  pipelineId: number;
  status: string;
  log?: string;
  duration?: number;
}

export interface ServerEventMap {
  "activity:log": ActivityLogPayload;
  "pipeline:status": PipelineStatusPayload;
  "pipeline:complete": { pipelineId: number; status: string };
  "gitlab:commit": { shortId: string; author: string; title: string };
  "system:status": { message: string; level: string };
}

export type ServerEventType = keyof ServerEventMap;

export interface ServerEvent<T extends ServerEventType = ServerEventType> {
  type: T;
  payload: ServerEventMap[T];
}

// ── Client → Server Commands ──

export interface SubscribePayload {
  channel: string;
}

export interface ClientCommandMap {
  subscribe: SubscribePayload;
  ping: Record<string, never>;
}

export type ClientCommandType = keyof ClientCommandMap;

export interface ClientCommand<T extends ClientCommandType = ClientCommandType> {
  type: T;
  payload: ClientCommandMap[T];
}
