import { NextResponse } from "next/server";
import { FALLBACK_RESUME_PATH, getLatestResumeUrl } from "@/lib/resumeStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The canonical resume link. Redirects to the newest uploaded PDF in blob
// storage, or to the committed fallback when nothing has been uploaded yet.
// next.config.ts also rewrites the older /resume.pdf URL here, so links already
// shared in the wild keep resolving to the current resume.
export async function GET(req: Request) {
  const latest = await getLatestResumeUrl();
  const target = latest ?? new URL(FALLBACK_RESUME_PATH, req.url).toString();
  const res = NextResponse.redirect(target, 307);
  res.headers.set("Cache-Control", "public, max-age=0, s-maxage=60, must-revalidate");
  return res;
}
