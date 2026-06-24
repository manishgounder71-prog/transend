import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { verifyPassword, createSession, cleanupExpiredSessions, SESSION_COOKIE } from "@/lib/auth";

const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace("file:", "").replace(/"/g, "").trim()
  : path.join(process.cwd(), "dev.db");

const globalForLogin = globalThis as unknown as {
  loginDb: Database.Database | undefined;
};

function getDb(): Database.Database {
  const db = globalForLogin.loginDb ?? new Database(DB_PATH);
  if (!globalForLogin.loginDb) {
    db.pragma("journal_mode = WAL");
    globalForLogin.loginDb = db;
  }
  return db;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const db = getDb();

    const user = db
      .prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?")
      .get(email) as { id: number; email: string; name: string; password_hash: string } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const sessionToken = await createSession(user.id);

    // Clean up expired sessions on successful login
    cleanupExpiredSessions();

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

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
    console.error("Login failed:", message);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
