// The live resume lives in Vercel Blob so it can be swapped from the browser
// without a redeploy. Each upload is written under resume/<timestamp>.pdf rather
// than overwriting one path: the newest upload wins, older ones stay as history,
// and every version keeps its own immutable CDN URL (no stale-cache problem).
//
// public/resume-base.pdf is the committed fallback, served whenever the blob
// store is empty or unreachable — so /resume always resolves to a real PDF even
// with no env vars configured (local dev, a fresh clone, a failed upload).
import { list, put } from "@vercel/blob";

export const RESUME_PREFIX = "resume/";
export const FALLBACK_RESUME_PATH = "/resume-base.pdf";

const CACHE_TTL_MS = 60_000;
let cached: { url: string | null; at: number } | null = null;

/** URL of the most recently uploaded resume, or null to use the fallback. */
export async function getLatestResumeUrl(): Promise<string | null> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.url;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  let url: string | null = null;
  try {
    const { blobs } = await list({ prefix: RESUME_PREFIX });
    const newest = blobs.reduce<(typeof blobs)[number] | null>(
      (best, b) => (!best || b.uploadedAt > best.uploadedAt ? b : best),
      null,
    );
    url = newest?.url ?? null;
  } catch (err) {
    // A blob outage must not take the resume link down — fall back to the
    // committed PDF instead of erroring.
    console.error("[resume] blob list failed:", err);
    return null;
  }

  cached = { url, at: Date.now() };
  return url;
}

export async function uploadResume(file: Blob): Promise<string> {
  const { url } = await put(`${RESUME_PREFIX}${Date.now()}.pdf`, file, {
    access: "public",
    contentType: "application/pdf",
  });
  cached = { url, at: Date.now() }; // the new upload is live immediately
  return url;
}
