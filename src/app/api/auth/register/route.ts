import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { hashPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace("file:", "").replace(/"/g, "").trim()
  : path.join(process.cwd(), "dev.db");

const globalForRegister = globalThis as unknown as {
  registerDb: Database.Database | undefined;
};

function getDb(): Database.Database {
  const db = globalForRegister.registerDb ?? new Database(DB_PATH);
  if (!globalForRegister.registerDb) {
    db.pragma("journal_mode = WAL");
    globalForRegister.registerDb = db;
  }
  return db;
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 },
      );
    }

    const db = getDb();

    // Check if user already exists
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email) as { id: number } | undefined;

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const result = db
      .prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)")
      .run(email, name, passwordHash);

    const userId = result.lastInsertRowid as number;
    const sessionToken = await createSession(userId);

    const response = NextResponse.json({ success: true, user: { id: userId, email, name } });
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Registration failed:", message);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
