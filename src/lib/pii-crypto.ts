import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;
const SCRYPT_SALT = "rrf-pii-v1"; // constant salt — key material itself is the secret

function deriveKey(secret: string): Buffer {
  if (!secret || secret.length < 16) {
    throw new Error(
      "PII_ENCRYPTION_KEY is missing or too short (require >= 16 chars)",
    );
  }
  return scryptSync(secret, SCRYPT_SALT, KEY_BYTES);
}

/**
 * Encrypt plaintext with AES-256-GCM.
 * Output is a base64 string: iv (12b) || tag (16b) || ciphertext
 *
 * Used as the application-layer wrapper that runs BEFORE the value reaches
 * the Supabase-backed repository. The DB stores it as bytea; pgcrypto-based
 * decryption in SQL (employment_decrypt) is the admin path, application-
 * layer decryption here is the fallback for the in-memory repo used in
 * unit tests.
 */
export function encryptPII(plaintext: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decryptPII(encoded: string, secret: string): string {
  const key = deriveKey(secret);
  const buf = Buffer.from(encoded, "base64");
  if (buf.length < IV_BYTES + TAG_BYTES + 1) {
    throw new Error("decryptPII: payload too short");
  }
  const iv = buf.subarray(0, IV_BYTES);
  const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = buf.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString("utf8");
}
