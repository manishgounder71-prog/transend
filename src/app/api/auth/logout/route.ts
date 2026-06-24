import { NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Read session cookie from the Cookie header
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionToken = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
      ?.split("=")[1];

    if (sessionToken) {
      deleteSession(sessionToken);
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Immediately expire
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
