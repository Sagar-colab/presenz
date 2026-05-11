import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireAdmin(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return null;
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { isAdmin: true } });
  return user?.isAdmin ? uid : null;
}

export function maskPhone(phone: string): string {
  return phone.length > 4 ? `${phone.slice(0, 3)}***${phone.slice(-4)}` : "***";
}
