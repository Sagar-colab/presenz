import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";

// Auth source of truth for every protected route. Tries bearer first (mobile),
// falls back to NextAuth cookie (web). Adding bearer here means all existing
// /api/* and server-component callsites accept mobile tokens transparently —
// no per-route changes needed.

export async function requireUserId(): Promise<string | null> {
  const h = await headers();
  const auth = h.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const uid = await verifyMobileToken(auth.slice(7).trim());
    if (uid) return uid;
  }

  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}
