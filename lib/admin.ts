import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AdminAuthState =
  | { kind: "admin"; uid: string }
  | { kind: "authed_not_admin"; uid: string }
  | { kind: "anon" };

export async function getAdminAuthState(): Promise<AdminAuthState> {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) {
    // eslint-disable-next-line no-console
    console.warn("[admin] access denied: no session");
    return { kind: "anon" };
  }
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { isAdmin: true } });
  if (!user?.isAdmin) {
    // eslint-disable-next-line no-console
    console.warn(`[admin] access denied: uid=${uid} isAdmin=false`);
    return { kind: "authed_not_admin", uid };
  }
  return { kind: "admin", uid };
}

// Back-compat helper kept for the existing admin API routes that just need
// "am I admin, yes/no" — returns the uid only when authenticated as admin.
export async function requireAdmin(): Promise<string | null> {
  const state = await getAdminAuthState();
  return state.kind === "admin" ? state.uid : null;
}

export function maskPhone(phone: string): string {
  return phone.length > 4 ? `${phone.slice(0, 3)}***${phone.slice(-4)}` : "***";
}
