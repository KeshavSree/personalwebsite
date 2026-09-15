import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  clearRateLimit,
  createSessionToken,
  rateLimit,
  verifyCredentials,
} from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request) {
  const key = clientKey(req);
  const limit = rateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let username = "";
  let password = "";
  try {
    const body = await req.json();
    username = typeof body.username === "string" ? body.username : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  let ok = false;
  try {
    ok = verifyCredentials(username, password);
  } catch (err) {
    // Misconfigured env — surface it in the server log, stay vague to the client.
    console.error("[admin-login] configuration error:", err);
    return NextResponse.json({ error: "Login is not configured." }, { status: 500 });
  }

  // One generic message for every failure: never reveal which field was wrong.
  if (!ok) {
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  clearRateLimit(key);
  const { token, maxAgeSeconds } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  });
  return res;
}
