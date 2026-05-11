import crypto from "node:crypto";

// 8-char codes from an alphabet that omits ambiguous characters
// (0/O, 1/I/L) to make them readable when typed off a phone or printed.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateInviteCode(): string {
  const buf = crypto.randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[buf[i]! % ALPHABET.length];
  return out;
}

export function normaliseInviteCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
