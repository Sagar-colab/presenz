import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adjustTrustScore, TRUST_DELTAS } from "@/lib/trust";
import { getSmsService } from "@/lib/services/sms";

const Body = z.object({ reason: z.string().min(2).max(200), flagId: z.string().optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, phone: true } });
  if (!user) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });

  await adjustTrustScore(user.id, TRUST_DELTAS.WARNING_ISSUED, `WARNING_ISSUED:${adminId}:${parsed.reason.slice(0, 60)}`);

  if (parsed.flagId) {
    await prisma.flag.update({
      where: { id: parsed.flagId },
      data: { status: "RESOLVED", resolvedBy: adminId, resolvedAt: new Date(), action: "WARNED" },
    });
  }

  await prisma.user.update({ where: { id: user.id }, data: { status: "WARNED" } });

  const sms = getSmsService();
  await sms.sendWarning(user.phone, parsed.reason);

  return NextResponse.json({ ok: true });
}
