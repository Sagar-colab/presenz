import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const Body = z.object({ flagId: z.string().optional() }).default({});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });

  let parsed;
  try {
    parsed = Body.parse(await req.json().catch(() => ({})));
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { status: "BANNED" } }),
    prisma.trustEvent.create({ data: { userId: user.id, delta: 0, reason: `BAN_ISSUED:${adminId}` } }),
  ]);

  if (parsed.flagId) {
    await prisma.flag.update({
      where: { id: parsed.flagId },
      data: { status: "RESOLVED", resolvedBy: adminId, resolvedAt: new Date(), action: "BANNED" },
    });
  }

  return NextResponse.json({ ok: true });
}
