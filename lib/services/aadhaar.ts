// DigiLocker / UIDAI integration point. Stubbed in dev — returns a verified result
// after a short delay so the UI flow can be built end-to-end without a sandbox account.

export interface AadhaarService {
  verify(aadhaarNumber: string, otp?: string): Promise<
    | { ok: true; last4: string; photoUrl?: string }
    | { ok: false; reason: string }
  >;
}

class StubAadhaarService implements AadhaarService {
  async verify(aadhaarNumber: string) {
    await new Promise((r) => setTimeout(r, 1200));
    const digits = aadhaarNumber.replace(/\D/g, "");
    if (digits.length !== 12) return { ok: false as const, reason: "invalid format" };
    return { ok: true as const, last4: digits.slice(-4) };
  }
}

class DigiLockerAadhaarService implements AadhaarService {
  async verify(_aadhaarNumber: string) {
    // Real DigiLocker / Karza / Signzy call goes here.
    // Out of scope for this build — fail closed if invoked.
    return { ok: false as const, reason: "live aadhaar provider not configured" };
  }
}

export function getAadhaarService(): AadhaarService {
  const live = process.env.DIGILOCKER_CLIENT_ID && process.env.DIGILOCKER_CLIENT_SECRET;
  return live ? new DigiLockerAadhaarService() : new StubAadhaarService();
}
