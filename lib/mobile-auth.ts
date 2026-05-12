import { SignJWT, jwtVerify } from "jose";

// Mobile JWT — issued by /api/auth/mobile-signin, presented as
// Authorization: Bearer <token> on subsequent calls. Reuses NEXTAUTH_SECRET as
// the signing key so there's only one secret to manage. 30-day TTL matches
// the NextAuth session maxAge for parity with the web app.

const ISSUER = "presenz";
const AUDIENCE = "presenz-mobile";
const TTL_SECONDS = 60 * 60 * 24 * 30;

function getSecret(): Uint8Array {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is not set — cannot sign mobile tokens");
  return new TextEncoder().encode(s);
}

export async function signMobileToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + TTL_SECONDS)
    .sign(getSecret());
}

export async function verifyMobileToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
