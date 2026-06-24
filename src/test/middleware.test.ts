import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock NextResponse and NextRequest before importing middleware
const mockNext = vi.fn(() => "next()");
const mockRedirect = vi.fn((url: URL) => `redirect:${url.toString()}`);

vi.mock("next/server", () => ({
  NextResponse: {
    next: () => mockNext(),
    redirect: (url: URL) => mockRedirect(url),
  },
}));

// Dynamically import middleware after mocks are set up
const { middleware } = await import("@/middleware");

function createMockRequest(pathname: string, cookieValue?: string) {
  return {
    nextUrl: {
      pathname,
      searchParams: new URLSearchParams(),
    },
    url: `http://localhost:3000${pathname}`,
    cookies: {
      get: vi.fn((name: string) => {
        if (name === "orbit_session" && cookieValue) {
          return { value: cookieValue };
        }
        return undefined;
      }),
    },
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("middleware — route protection", () => {
  it("allows public routes (e.g., /login) without cookie", () => {
    const req = createMockRequest("/login");
    const result = middleware(req);
    expect(result).toBe("next()");
    expect(mockNext).toHaveBeenCalled();
  });

  it("allows /api/auth routes without cookie", () => {
    const req = createMockRequest("/api/auth/login");
    const result = middleware(req);
    expect(result).toBe("next()");
  });

  it("allows /api/auth/register without cookie", () => {
    const req = createMockRequest("/api/auth/register");
    const result = middleware(req);
    expect(result).toBe("next()");
  });

  it("allows /_next/* static assets without cookie", () => {
    const req = createMockRequest("/_next/static/chunks/main.js");
    const result = middleware(req);
    expect(result).toBe("next()");
  });

  it("allows /favicon.ico without cookie", () => {
    const req = createMockRequest("/favicon.ico");
    const result = middleware(req);
    expect(result).toBe("next()");
  });

  it("redirects protected route to /login when no cookie present", () => {
    const req = createMockRequest("/");
    const result = middleware(req);
    expect(result).toContain("redirect:");
    expect(result).toContain("/login");
    expect(result).toContain("redirect=%2F"); // encoded /
  });

  it("redirects /dashboard to /login with redirect param", () => {
    const req = createMockRequest("/dashboard");
    const result = middleware(req);

    expect(result).toContain("redirect:");
    expect(result).toContain("/login");
    expect(result).toContain("redirect=%2Fdashboard");
  });

  it("allows protected route when valid cookie is present", () => {
    const req = createMockRequest("/dashboard", "valid-session-token");
    const result = middleware(req);
    expect(result).toBe("next()");
  });

  it("allows /api/ai/boardroom when valid cookie is present", () => {
    const req = createMockRequest("/api/ai/boardroom", "some-token");
    const result = middleware(req);
    expect(result).toBe("next()");
  });

  it("redirects /api/ai/boardroom when no cookie", () => {
    const req = createMockRequest("/api/ai/boardroom");
    const result = middleware(req);
    expect(result).toContain("redirect:");
    expect(result).toContain("/login");
  });

  it("redirects /api/gitlab/connect when no cookie", () => {
    const req = createMockRequest("/api/gitlab/connect");
    const result = middleware(req);
    expect(result).toContain("redirect:");
  });
});

describe("middleware — config matcher", () => {
  it("has a config with matcher for all routes except static assets", async () => {
    const { config } = await import("@/middleware");
    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher[0]).toContain("_next/static");
  });
});
