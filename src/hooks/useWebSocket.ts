"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { ServerEvent, ServerEventType, ServerEventMap } from "@/lib/ws-types";

type EventCallback<T extends ServerEventType> = (payload: ServerEventMap[T]) => void;
type GenericCallback = EventCallback<ServerEventType>;

interface UseWebSocketReturn {
  isConnected: boolean;
  subscribe: <T extends ServerEventType>(event: T, callback: EventCallback<T>) => () => void;
}

/**
 * React hook that connects to the Orbit CTO X WebSocket server.
 * Provides auto-reconnect and typed event subscriptions.
 */
export function useWebSocket(): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<ServerEventType, Set<GenericCallback>>>(new Map());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const connectRef = useRef<() => void>(() => {});
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    // Determine WebSocket URL from the current page origin
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect after 3 seconds — use ref to avoid self-reference in useCallback
        reconnectTimeoutRef.current = setTimeout(connectRef.current, 3000);
      };

      ws.onerror = () => {
        // onclose will fire after onerror, triggering reconnect
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as ServerEvent;
          const { type, payload } = data;

          const callbacks = listenersRef.current.get(type as ServerEventType);
          if (callbacks) {
            callbacks.forEach((cb) => cb(payload as ServerEventMap[typeof type]));
          }
        } catch {
          // Ignore malformed messages
        }
      };
    } catch {
      // Connection failed, will retry
      reconnectTimeoutRef.current = setTimeout(connectRef.current, 3000);
    }
  }, []);

  useEffect(() => {
    // Sync ref so recursive reconnects always use the latest connect
    connectRef.current = connect;

    connectRef.current();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribe = useCallback(
    <T extends ServerEventType>(event: T, callback: EventCallback<T>): (() => void) => {
      if (!listenersRef.current.has(event)) {
        listenersRef.current.set(event, new Set());
      }
      listenersRef.current.get(event)!.add(callback as GenericCallback);

      // Return unsubscribe function
      return () => {
        listenersRef.current.get(event)?.delete(callback as GenericCallback);
      };
    },
    [],
  );

  return { isConnected, subscribe };
}
