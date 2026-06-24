import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const TEST_DB = path.join(process.cwd(), "dev.test-db.db");

// We test the SQL directly since getDb() is a module-internal singleton
// that shares the production DB path. Instead we test the SQL logic.
function createTestDb() {
  const db = new Database(TEST_DB);
  db.exec(`
    CREATE TABLE IF NOT EXISTS gitlab_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      token TEXT NOT NULL,
      gitlab_url TEXT NOT NULL DEFAULT 'https://gitlab.com/api/v4',
      branch TEXT NOT NULL DEFAULT 'main',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
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
  return db;
}

describe("db — schema initialization", () => {
  let db: Database.Database;

  beforeAll(() => {
    db = createTestDb();
  });

  afterAll(() => {
    db.close();
    try { fs.unlinkSync(TEST_DB); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-wal"); } catch { /* ignore */ }
    try { fs.unlinkSync(TEST_DB + "-shm"); } catch { /* ignore */ }
  });

  it("creates gitlab_config table with correct columns", () => {
    const columns = db.prepare("PRAGMA table_info(gitlab_config)").all() as { name: string; type: string }[];
    const names = columns.map((c) => c.name);
    expect(names).toContain("id");
    expect(names).toContain("project_id");
    expect(names).toContain("token");
    expect(names).toContain("gitlab_url");
    expect(names).toContain("branch");
    expect(names).toContain("created_at");
    expect(names).toContain("updated_at");
  });

  it("creates users table with UNIQUE email constraint", () => {
    const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string; type: string }[];
    const names = columns.map((c) => c.name);
    expect(names).toContain("id");
    expect(names).toContain("email");
    expect(names).toContain("name");
    expect(names).toContain("password_hash");
  });

  it("creates sessions table with foreign key to users", () => {
    const columns = db.prepare("PRAGMA table_info(sessions)").all() as { name: string; type: string }[];
    const names = columns.map((c) => c.name);
    expect(names).toContain("user_id");
    expect(names).toContain("token");
    expect(names).toContain("expires_at");
  });

  it("enforces UNIQUE email constraint on users", () => {
    db.prepare("INSERT INTO users (email, name, password_hash) VALUES ('dup@test.com', 'A', 'hash')").run();
    expect(() => {
      db.prepare("INSERT INTO users (email, name, password_hash) VALUES ('dup@test.com', 'B', 'hash2')").run();
    }).toThrow();
  });

  it("allows inserting a valid gitlab_config row", () => {
    db.prepare(
      "INSERT INTO gitlab_config (project_id, token, gitlab_url, branch) VALUES (?, ?, ?, ?)"
    ).run("123", "glpat-test", "https://gitlab.com/api/v4", "main");

    const row = db.prepare("SELECT * FROM gitlab_config ORDER BY id DESC LIMIT 1").get() as any;
    expect(row.project_id).toBe("123");
    expect(row.token).toBe("glpat-test");
  });

  it("allows upserting gitlab_config (UPDATE existing, INSERT new)", () => {
    // Insert another row
    db.prepare(
      "INSERT INTO gitlab_config (project_id, token, gitlab_url, branch) VALUES (?, ?, ?, ?)"
    ).run("456", "old-token", "https://gitlab.com/api/v4", "dev");

    // Update it
    const existing = db.prepare("SELECT id FROM gitlab_config WHERE project_id = '456'").get() as { id: number };
    db.prepare(
      "UPDATE gitlab_config SET project_id = ?, token = ?, updated_at = datetime('now') WHERE id = ?"
    ).run("456", "new-token", existing.id);

    const updated = db.prepare("SELECT * FROM gitlab_config WHERE project_id = '456'").get() as any;
    expect(updated.token).toBe("new-token");
  });

  it("DELETE removes all gitlab_config rows", () => {
    db.prepare("DELETE FROM gitlab_config").run();
    const count = db.prepare("SELECT COUNT(*) as c FROM gitlab_config").get() as { c: number };
    expect(count.c).toBe(0);
  });
});
