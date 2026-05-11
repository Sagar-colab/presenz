import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { isBanned: false } }),
    prisma.trustEvent.create({ data: { userId: user.id, delta: 0, reason: `UNBAN_ISSUED:${adminId}` } }),
  ]);

  return NextResponse.json({ ok: true });
}
