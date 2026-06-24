import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";

const SESSION_COOKIE = "orbit_session";
const SESSION_DURATION_DAYS = 7;

const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace("file:", "").replace(/"/g, "").trim()
  : path.join(process.cwd(), "dev.db");

const globalForAuth = globalThis as unknown as {
  authDb: Database.Database | undefined;
};

function getAuthDb(): Database.Database {
  const db = globalForAuth.authDb ?? new Database(DB_PATH);
  if (!globalForAuth.authDb) {
    db.pragma("journal_mode = WAL");
    globalForAuth.authDb = db;
  }
  return db;
}

// ── Password Hashing ──

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Session Token ──

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Session Management ──

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Session {
  token: string;
  user: User;
}

export async function createSession(userId: number): Promise<string> {
  const db = getAuthDb();
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  db.prepare(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
  ).run(userId, token, expiresAt);

  return token;
}

export function getSession(token: string): Session | null {
  const db = getAuthDb();
  const row = db
    .prepare(
      `SELECT s.token, u.id, u.email, u.name
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`,
    )
    .get(token) as
    | { token: string; id: number; email: string; name: string }
    | undefined;

  if (!row) return null;

  return {
    token: row.token,
    user: { id: row.id, email: row.email, name: row.name },
  };
}

export function deleteSession(token: string): void {
  const db = getAuthDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function cleanupExpiredSessions(): void {
  const db = getAuthDb();
  db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
}

export { SESSION_COOKIE };
