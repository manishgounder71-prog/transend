import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace("file:", "").replace(/"/g, "").trim()
  : path.join(process.cwd(), "dev.db");

const globalForDb = globalThis as unknown as {
  db: Database.Database | undefined;
};

function getDb(): Database.Database {
  const db =
    globalForDb.db ??
    new Database(DB_PATH, {
      /* verbose: console.log */
    });

  if (!globalForDb.db) {
    db.pragma("journal_mode = WAL");
    globalForDb.db = db;
  }

  return db;
}

export function initDb(): void {
  const db = getDb();
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
}

export interface GitLabConfigRow {
  id: number;
  project_id: string;
  token: string;
  gitlab_url: string;
  branch: string;
  created_at: string;
  updated_at: string;
}

export function getGitLabConfig(): GitLabConfigRow | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM gitlab_config ORDER BY id DESC LIMIT 1")
    .get() as GitLabConfigRow | undefined;
  return row ?? null;
}

export function upsertGitLabConfig(
  projectId: string,
  token: string,
  gitlabUrl: string,
  branch: string
): void {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM gitlab_config ORDER BY id DESC LIMIT 1")
    .get() as { id: number } | undefined;

  if (existing) {
    db.prepare(
      `UPDATE gitlab_config SET project_id = ?, token = ?, gitlab_url = ?, branch = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(projectId, token, gitlabUrl, branch, existing.id);
  } else {
    db.prepare(
      `INSERT INTO gitlab_config (project_id, token, gitlab_url, branch) VALUES (?, ?, ?, ?)`
    ).run(projectId, token, gitlabUrl, branch);
  }
}

export function deleteGitLabConfig(): void {
  const db = getDb();
  db.prepare("DELETE FROM gitlab_config").run();
}

// Initialize on import in dev to ensure the table exists
if (process.env.NODE_ENV !== "production" || process.env.DATABASE_URL) {
  try {
    initDb();
  } catch {
    // DB might not be available during build
  }
}
