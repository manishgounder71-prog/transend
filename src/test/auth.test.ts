import { describe, it, expect, beforeAll, afterAll } from "vitest";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";

const TEST_DB = path.join(process.cwd(), "dev.test-auth.db");

// Set DATABASE_URL BEFORE importing auth module (via dynamic import below)
process.env.DATABASE_URL = `file:${TEST_DB}`;

// Reset the global singleton so getAuthDb() creates a fresh connection
const g = globalThis as unknown as { authDb: Database.Database | undefined };
delete g.authDb;

// Import dynamically after env var is set
let hashPassword: (pw: string) => Promise<string>;
let verifyPassword: (pw: string, hash: string) => Promise<boolean>;
let generateToken: () => string;
let createSession: (userId: number) => Promise<string>;
let getSession: (token: string) => { token: string; user: { id: number; email: string; name: string } } | null;
let deleteSession: (token: string) => void;
let cleanupExpiredSessions: () => void;

beforeAll(async () => {
  const auth = await import("@/lib/auth");
  hashPassword = auth.hashPassword;
  verifyPassword = auth.verifyPassword;
  generateToken = auth.generateToken;
  createSession = auth.createSession;
  getSession = auth.getSession;
  deleteSession = auth.deleteSession;
  cleanupExpiredSessions = auth.cleanupExpiredSessions;
});

describe("auth — password hashing", () => {
  it("hashPassword returns a bcrypt hash", async () => {
    const hash = await hashPassword("my-secret-password");
    expect(hash).toBeTruthy();
    // bcryptjs uses $2b$ (or $2a$ depending on version)
    expect(hash).toMatch(/^\$2[ab]\$/);
    expect(hash.length).toBeGreaterThan(50);
  });

  it("verifyPassword returns true for correct password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("correct-password", hash);
    expect(result).toBe(true);
  });

  it("verifyPassword returns false for wrong password", async () => {
    const hash = await hashPassword("real-password");
    const result = await verifyPassword("wrong-password", hash);
    expect(result).toBe(false);
  });

  it("verifyPassword returns false for empty string vs hash", async () => {
    const hash = await hashPassword("something");
    const result = await verifyPassword("", hash);
    expect(result).toBe(false);
  });

  it("generated hashes are unique even for same password", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });
});

describe("auth — token generation", () => {
  it("generateToken returns a 64-char hex string", () => {
    const token = generateToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generateToken produces unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
  });
});

describe("auth — session management", () => {
  let db: Database.Database;

  beforeAll(() => {
    // Clean up any previous test DB
    try { fs.unlinkSync(TEST_DB); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-wal"); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-shm"); } catch { /* ignore */ }

    // Create a test database and initialize the schema
    db = new Database(TEST_DB);
    db.pragma("journal_mode = WAL");

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    `);

    // Insert a test user
    db.prepare(
      "INSERT OR IGNORE INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)"
    ).run(1, "test@example.com", "Test User", "dummy-hash");
  });

  afterAll(() => {
    db.close();
    try { fs.unlinkSync(TEST_DB); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-wal"); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-shm"); } catch { /* ignore */ }
    delete process.env.DATABASE_URL;
  });

  it("createSession inserts a new session and returns a token", async () => {
    const token = await createSession(1);
    expect(token).toMatch(/^[0-9a-f]{64}$/);

    const row = db.prepare("SELECT * FROM sessions WHERE token = ?").get(token) as { user_id: number; expires_at: string } | undefined;
    expect(row).toBeTruthy();
    expect(row!.user_id).toBe(1);
  });

  it("getSession retrieves a valid session", async () => {
    const token = await createSession(1);
    const session = getSession(token);
    expect(session).not.toBeNull();
    expect(session!.token).toBe(token);
    expect(session!.user.email).toBe("test@example.com");
    expect(session!.user.name).toBe("Test User");
    expect(session!.user.id).toBe(1);
  });

  it("getSession returns null for nonexistent token", () => {
    const result = getSession("nonexistent_token_1234567890123456789012345678901234567890123456789012345678901234");
    expect(result).toBeNull();
  });

  it("getSession returns null for empty token", () => {
    const result = getSession("");
    expect(result).toBeNull();
  });

  it("deleteSession removes the session from the database", async () => {
    const token = await createSession(1);
    expect(getSession(token)).not.toBeNull();

    deleteSession(token);
    expect(getSession(token)).toBeNull();

    const row = db.prepare("SELECT * FROM sessions WHERE token = ?").get(token);
    expect(row).toBeUndefined();
  });

  it("deleteSession does not throw for non-existent token", () => {
    expect(() => deleteSession("0000000000000000000000000000000000000000000000000000000000000000")).not.toThrow();
  });

  it("cleanupExpiredSessions removes past sessions but keeps valid ones", () => {
    const expiredToken = `expired_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    db.prepare(
      "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime('now', '-1 day'))"
    ).run(1, expiredToken);

    const validToken = `valid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const futureExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(
      "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)"
    ).run(1, validToken, futureExpiry);

    cleanupExpiredSessions();

    const expired = db.prepare("SELECT * FROM sessions WHERE token = ?").get(expiredToken);
    expect(expired).toBeUndefined();

    const valid = db.prepare("SELECT * FROM sessions WHERE token = ?").get(validToken);
    expect(valid).toBeTruthy();
  });
});
