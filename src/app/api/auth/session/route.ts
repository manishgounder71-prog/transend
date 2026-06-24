import { NextResponse } from "next/server";
import { getSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Read session cookie from the Cookie header
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionToken = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
      ?.split("=")[1];

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const session = getSession(sessionToken);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
