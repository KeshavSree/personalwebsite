// Prints the ADMIN_PASSWORD_HASH value for a password, so the plaintext never
// has to be stored anywhere.
//
//   node scripts/hash-password.mjs 'the-password'
//
// Then set the printed value as ADMIN_PASSWORD_HASH in .env.local (dev) and in
// the Vercel project's env vars (production).
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("usage: node scripts/hash-password.mjs '<password>'");
  process.exit(1);
}

const salt = randomBytes(16);
console.log(`scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`);
