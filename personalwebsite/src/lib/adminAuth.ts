// Server-only auth for the single admin account behind the secret mosaic tile
// on /about. There is exactly one user; credentials live in env vars, never in
// the repo:
//
//   ADMIN_USERNAME       the login name, compared in constant time
//   ADMIN_PASSWORD_HASH  scrypt:<saltHex>:<hashHex>  (see scripts/hash-password.mjs)
//   AUTH_SECRET          random 32+ byte hex, signs the session cookie
//
// The password is never stored or logged — only its scrypt hash is kept, and a
// login compares hashes with timingSafeEqual so a wrong password costs the same
// time as a right one. A successful login mints an HMAC-signed session token; the
// server keeps no session table, it just re-verifies the signature per request.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ks_admin_session";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2h — long enough to upload, short enough to be safe
const SCRYPT_KEYLEN = 64;

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/** Constant-time string compare that does not leak length via early return. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Hash a password for storage. Used by scripts/hash-password.mjs. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  // Colon-separated, not "$"-separated: a "$" inside a .env value is read as a
  // variable reference and silently expanded away.
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyCredentials(username: string, password: string): boolean {
  const stored = env("ADMIN_PASSWORD_HASH");
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) {
    throw new Error("ADMIN_PASSWORD_HASH is malformed (expected scrypt:salt:hash)");
  }
  // Always run the KDF, even when the username is wrong, so both failures cost
  // the same wall-clock time and the response cannot be used to enumerate users.
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  const passwordOk = timingSafeEqual(expected, actual);
  const usernameOk = safeEqual(username, env("ADMIN_USERNAME"));
  return passwordOk && usernameOk;
}

function sign(payload: string): string {
  return createHmac("sha256", env("AUTH_SECRET")).update(payload).digest("base64url");
}

export function createSessionToken(): { token: string; maxAgeSeconds: number } {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return { token: `${exp}.${sign(exp)}`, maxAgeSeconds: SESSION_TTL_MS / 1000 };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  const expected = sign(exp);
  if (expected.length !== sig.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  return Number(exp) > Date.now();
}

// ── Login rate limiting ────────────────────────────────────────────────────
// Per-instance and in-memory: it resets on redeploy and is not shared across
// serverless instances, so it is a speed bump against guessing, not a hard
// guarantee. Good enough for a one-account door that nothing links to.
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearRateLimit(key: string): void {
  attempts.delete(key);
}
