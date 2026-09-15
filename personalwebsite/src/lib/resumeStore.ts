// The live resume lives in Vercel Blob so it can be swapped from the browser
// without a redeploy.
//
// It is written to ONE fixed pathname, overwritten in place. The obvious
// alternative — upload under a timestamp and have the read side list() the
// prefix and pick the newest — does not work: Blob's list index is eventually
// consistent, so for tens of seconds after an upload a list() still reports the
// previous file as newest, and /resume keeps serving the old resume at exactly
// the moment it has to be right. (Measured against production: ~90s.) Reading a
// known pathname with head() is immediately consistent, as is fetching the URL,
// so the fixed path is both correct and one API call cheaper.
//
// Every upload is also copied to an immutable timestamped archive path, so
// replacing the resume never destroys the previous one.
//
// public/resume-base.pdf is the committed fallback, served whenever nothing has
// been uploaded yet or the store is unreachable — so /resume always resolves to
// a real PDF even with no env vars configured (local dev, a fresh clone).
import { BlobNotFoundError, head, put } from "@vercel/blob";

export const RESUME_PATHNAME = "resume.pdf";
export const ARCHIVE_PREFIX = "resume-archive/";
export const FALLBACK_RESUME_PATH = "/resume-base.pdf";

/** URL of the current resume, or null to use the committed fallback. */
export async function getLatestResumeUrl(): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const blob = await head(RESUME_PATHNAME);
    // Overwriting the fixed path does purge the blob CDN, but the purge takes a
    // moment to reach every edge — long enough to have served a stale PDF once
    // in testing. uploadedAt changes on every upload and head() reports it with
    // immediate consistency, so tagging the URL with it gives each version its
    // own cache key and no edge can hand back the previous file.
    return `${blob.url}?v=${blob.uploadedAt.getTime()}`;
  } catch (err) {
    // Nothing uploaded yet is the expected state on a fresh store, not an error.
    if (err instanceof BlobNotFoundError) return null;
    // A blob outage must not take the resume link down.
    console.error("[resume] blob head failed:", err);
    return null;
  }
}

export async function uploadResume(file: Blob): Promise<string> {
  // Archive first: if the overwrite below fails, the new file is still kept.
  await put(`${ARCHIVE_PREFIX}${Date.now()}.pdf`, file, {
    access: "public",
    contentType: "application/pdf",
  });
  const { url } = await put(RESUME_PATHNAME, file, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/pdf",
    // Floored at 60s by the platform, which is why the read side cache-busts
    // with ?v= rather than relying on this.
    cacheControlMaxAge: 0,
  });
  return url;
}
