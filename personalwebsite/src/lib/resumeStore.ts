// The live resume lives in Vercel Blob so it can be swapped from the browser
// without a redeploy.
//
// Getting "the newest upload is served immediately" right took three tries,
// because two different parts of Blob are eventually consistent in opposite
// ways. Both were measured against the live store:
//
//   1. list() lags. Upload under a timestamped path and pick the newest by
//      list(), and for ~90s the scan still reports the PREVIOUS file as newest.
//   2. Overwriting one fixed path lags too, in the CDN rather than the index.
//      A public blob is served with `cache-control: public, max-age=60`, the
//      overwrite's purge does not reach every edge at once, and the CDN ignores
//      the query string — a cache-busting ?v= still came back HIT, age=40 with
//      the old bytes.
//
// What IS immediately consistent is head() on a known pathname. So: every
// upload writes the PDF to its own immutable path, which no edge can have
// cached because that URL has never existed before, and a tiny pointer blob at
// a fixed path records which one is current. The pointer carries the version in
// its contentType — metadata, which head() reports immediately — rather than in
// its body, which would be CDN-cached like any other blob content.
//
// The PDF is written before the pointer, so a failure between the two leaves the
// pointer naming the previous upload: an older resume, never a broken link.
//
// public/resume-base.pdf is the committed fallback, served whenever nothing has
// been uploaded yet or the store is unreachable — so /resume always resolves to
// a real PDF even with no env vars configured (local dev, a fresh clone).
import { BlobNotFoundError, head, put } from "@vercel/blob";

const POINTER_PATHNAME = "resume-current";
const VERSION_PREFIX = "resume-v/";
const VERSION_RE = /;\s*v=(\d+)/;

export const FALLBACK_RESUME_PATH = "/resume-base.pdf";

function versionedUrl(pointerUrl: string, version: string): string {
  return new URL(`/${VERSION_PREFIX}${version}.pdf`, pointerUrl).toString();
}

/** URL of the current resume, or null to use the committed fallback. */
export async function getLatestResumeUrl(): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const pointer = await head(POINTER_PATHNAME);
    const version = pointer.contentType?.match(VERSION_RE)?.[1];
    if (!version) {
      console.error("[resume] pointer has no version:", pointer.contentType);
      return null;
    }
    return versionedUrl(pointer.url, version);
  } catch (err) {
    // Nothing uploaded yet is the expected state on a fresh store, not an error.
    if (err instanceof BlobNotFoundError) return null;
    // A blob outage must not take the resume link down.
    console.error("[resume] blob head failed:", err);
    return null;
  }
}

export async function uploadResume(file: Blob): Promise<string> {
  const version = String(Date.now());
  const { url } = await put(`${VERSION_PREFIX}${version}.pdf`, file, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true, // only ever true for a same-millisecond re-upload
    contentType: "application/pdf",
  });
  // Publish it only once the bytes are in place.
  await put(POINTER_PATHNAME, version, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: `text/plain; v=${version}`,
  });
  return url;
}
