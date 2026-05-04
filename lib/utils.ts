import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function maskAadhaar(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 12) return input;
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

export function normalisePhoneIN(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  // Accept 10-digit Indian mobile or +91 prefixed forms
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2))) {
    return `+${digits}`;
  }
  return null;
}

export function isValidAadhaar(input: string): boolean {
  // Accept any 12-digit string for the dev stub. Production should run Verhoeff checksum.
  return /^\d{12}$/.test(input.replace(/\D/g, ""));
}

export async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
