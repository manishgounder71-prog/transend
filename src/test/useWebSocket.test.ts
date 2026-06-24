import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWebSocket } from "@/hooks/useWebSocket";

// Mock WebSocket — fires onopen only when openSocket() is explicitly called
class MockWebSocket {
  url: string;
  onopen: (() => void) | null = null;
  onclose: ((e: { code?: number; reason?: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  readyState: number = MockWebSocket.CONNECTING;
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];
  static lastUrl: string | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.lastUrl = url;
    MockWebSocket.instances.push(this);
  }

  send(_data: string) {}
  close() {
    this.readyState = MockWebSocket.CLOSED;
  }
}

let originalWs: typeof globalThis.WebSocket;

beforeEach(() => {
  MockWebSocket.instances = [];
  MockWebSocket.lastUrl = null;
  originalWs = globalThis.WebSocket;
  // Use MockWebSocket directly (NOT wrapped in vi.fn() — vi.fn() doesn't handle `new` properly)
  globalThis.WebSocket = MockWebSocket as unknown as typeof globalThis.WebSocket;
});

afterEach(() => {
  globalThis.WebSocket = originalWs;
});

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  Object.defineProperty(window, "location", {
    value: { protocol: "http:", host: "localhost:3000" },
    writable: true,
  });
});
afterEach(() => {
  Object.defineProperty(window, "location", {
    value: originalLocation,
    writable: true,
  });
});

/** Open the WebSocket at the given instance index */
function openSocket(index = 0) {
  const ws = MockWebSocket.instances[index];
  if (ws) {
    ws.readyState = MockWebSocket.OPEN;
    ws.onopen?.();
  }
}

describe("useWebSocket", () => {
  it("connects to the WebSocket server on mount", () => {
    renderHook(() => useWebSocket());
    expect(MockWebSocket.lastUrl).toBe("ws://localhost:3000/ws");
  });

  it("uses wss:// protocol when page is HTTPS", () => {
    Object.defineProperty(window, "location", {
      value: { protocol: "https:", host: "example.com" },
      writable: true,
    });

    renderHook(() => useWebSocket());
    expect(MockWebSocket.lastUrl).toBe("wss://example.com/ws");
  });

  it("sets isConnected to true when the socket opens", () => {
    const { result } = renderHook(() => useWebSocket());
    expect(result.current.isConnected).toBe(false);

    act(() => {
      openSocket();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it("sets isConnected to false on WebSocket close", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      openSocket();
    });
    expect(result.current.isConnected).toBe(true);

    act(() => {
      MockWebSocket.instances[0]?.onclose?.({});
    });

    expect(result.current.isConnected).toBe(false);
  });

  it("subscribe registers a callback and calls it on matching events", () => {
    const { result } = renderHook(() => useWebSocket());
    const callback = vi.fn();
    result.current.subscribe("activity:log", callback);

    act(() => {
      openSocket();
    });

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: "activity:log", payload: { sender: "CEO", message: "Test", type: "info" } }),
      });
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ sender: "CEO", message: "Test", type: "info" });
  });

  it("subscribe returns an unsubscribe function that stops callbacks", () => {
    const { result } = renderHook(() => useWebSocket());
    const callback = vi.fn();
    const unsub = result.current.subscribe("activity:log", callback);

    act(() => {
      openSocket();
    });

    act(() => {
      unsub();
    });

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: "activity:log", payload: { sender: "CTO", message: "Another", type: "warn" } }),
      });
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not call callback for unregistered event types", () => {
    const { result } = renderHook(() => useWebSocket());
    const callback = vi.fn();
    result.current.subscribe("activity:log", callback);

    act(() => {
      openSocket();
    });

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: "system:status", payload: { message: "System OK", level: "info" } }),
      });
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("ignores malformed JSON messages", () => {
    const { result } = renderHook(() => useWebSocket());
    const callback = vi.fn();
    result.current.subscribe("activity:log", callback);

    act(() => {
      openSocket();
    });

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({ data: "not-json" });
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("handles multiple subscribers for the same event", () => {
    const { result } = renderHook(() => useWebSocket());
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    result.current.subscribe("activity:log", cb1);
    result.current.subscribe("activity:log", cb2);

    act(() => {
      openSocket();
    });

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: "activity:log", payload: { sender: "CEO", message: "Multi", type: "info" } }),
      });
    });

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it("auto-reconnects after close with 3s timeout", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useWebSocket());
    act(() => {
      openSocket();
    });
    expect(result.current.isConnected).toBe(true);

    const instanceCountBeforeClose = MockWebSocket.instances.length;

    act(() => {
      MockWebSocket.instances[0]?.onclose?.({});
    });
    expect(result.current.isConnected).toBe(false);

    // Advance 3s to trigger reconnect
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // New WebSocket should have been created
    expect(MockWebSocket.instances.length).toBe(instanceCountBeforeClose + 1);
    expect(result.current.isConnected).toBe(false); // not yet opened

    // Open the new socket
    act(() => {
      openSocket(instanceCountBeforeClose);
    });
    expect(result.current.isConnected).toBe(true);

    vi.useRealTimers();
  });

  it("cleanup on unmount closes WebSocket", () => {
    const { unmount } = renderHook(() => useWebSocket());

    act(() => {
      openSocket();
    });
    expect(MockWebSocket.instances.length).toBe(1);

    const closeSpy = vi.spyOn(MockWebSocket.instances[0]!, "close");

    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });
});
