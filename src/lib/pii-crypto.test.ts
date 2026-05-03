import { describe, it, expect } from "vitest";
import { encryptPII, decryptPII } from "./pii-crypto";

const KEY = "test-key-at-least-16-chars-long!";
const WRONG_KEY = "wrong-key-also-16-chars-long-xx!";

describe("pii-crypto", () => {
  it("round-trips plaintext with the correct key", () => {
    const plaintext = "1985-07-14";
    const encoded = encryptPII(plaintext, KEY);
    expect(encoded).not.toContain(plaintext);
    expect(decryptPII(encoded, KEY)).toBe(plaintext);
  });

  it("produces a different ciphertext on each call (fresh IV)", () => {
    const a = encryptPII("same-input", KEY);
    const b = encryptPII("same-input", KEY);
    expect(a).not.toBe(b);
  });

  it("fails decryption with a wrong key", () => {
    const encoded = encryptPII("secret", KEY);
    expect(() => decryptPII(encoded, WRONG_KEY)).toThrow();
  });

  it("refuses to encrypt when the key is missing or too short", () => {
    expect(() => encryptPII("x", "")).toThrow(/key/i);
    expect(() => encryptPII("x", "short")).toThrow(/key/i);
  });

  it("refuses to decrypt a malformed payload", () => {
    expect(() => decryptPII("not-real-base64", KEY)).toThrow();
    expect(() => decryptPII("YQ==", KEY)).toThrow();
  });
});
