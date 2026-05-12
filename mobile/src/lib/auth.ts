import { apiCall } from "./api";
import { clearAuthToken, getAuthToken, setAuthToken } from "./storage";

export type MobileUser = {
  id: string;
  name: string | null;
  phone: string;
  city: string | null;
  plan: "FREE" | "PLUS" | "CONCIERGE";
  aadhaarVerified: boolean;
  faceVerified: boolean;
  profileComplete: boolean;
  status: "ACTIVE" | "WARNED" | "SUSPENDED" | "BANNED";
};

// /api/otp/send — mobile passes inviteCode just like the web onboarding flow.
export async function sendOtp(opts: { phone: string; inviteCode?: string }) {
  return apiCall<{ expiresInMs: number; maxAttempts: number }>("POST", "/api/otp/send", opts);
}

// /api/onboarding/check-invite — preflight before sending OTP, so we can show
// "join the waitlist" before the user types their phone.
export async function checkInvite(code: string) {
  return apiCall<Record<string, never>>("POST", "/api/onboarding/check-invite", { code });
}

// /api/auth/mobile-signin — verifies the OTP, returns { token, user }. Token
// is persisted to secure-store and attached to every subsequent request by
// the axios interceptor in api.ts.
export async function signInWithOtp(phone: string, code: string) {
  const res = await apiCall<{ token: string; user: MobileUser }>(
    "POST",
    "/api/auth/mobile-signin",
    { phone, code },
  );
  if (res.ok) {
    await setAuthToken(res.token);
  }
  return res;
}

export async function signOut(): Promise<void> {
  await clearAuthToken();
}

export async function hasStoredSession(): Promise<boolean> {
  return (await getAuthToken()) !== null;
}
