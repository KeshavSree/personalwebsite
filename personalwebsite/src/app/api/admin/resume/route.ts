import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { uploadResume } from "@/lib/resumeStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel caps a serverless request body at 4.5MB; stay under it and reject
// early so an oversized file fails with a clear message instead of a 413 page.
const MAX_BYTES = 4 * 1024 * 1024;
const PDF_MAGIC = "%PDF-";

export async function POST(req: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get("file");
    file = entry instanceof File ? entry : null;
  } catch {
    return NextResponse.json({ error: "Malformed upload." }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "PDF must be under 4MB." }, { status: 413 });
  }

  // Trust the bytes, not the filename or the browser-reported MIME type.
  const head = new Uint8Array(await file.slice(0, PDF_MAGIC.length).arrayBuffer());
  if (new TextDecoder().decode(head) !== PDF_MAGIC) {
    return NextResponse.json({ error: "That file is not a PDF." }, { status: 415 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage is not configured on this deployment." },
      { status: 500 },
    );
  }

  try {
    await uploadResume(file);
  } catch (err) {
    console.error("[admin-resume] upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
