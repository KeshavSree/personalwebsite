import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lets the modal skip the login form when a valid session cookie is already set.
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  let authenticated = false;
  try {
    authenticated = verifySessionToken(token);
  } catch {
    authenticated = false;
  }
  return NextResponse.json({ authenticated });
}
