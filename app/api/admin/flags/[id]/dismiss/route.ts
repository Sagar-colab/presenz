import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adjustTrustScore, TRUST_DELTAS } from "@/lib/trust";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });

  const flag = await prisma.flag.findUnique({ where: { id }, select: { id: true, reportedBy: true, status: true } });
  if (!flag) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (flag.status !== "PENDING") return NextResponse.json({ ok: false, reason: "already_resolved" }, { status: 409 });

  await prisma.flag.update({
    where: { id: flag.id },
    data: { status: "DISMISSED", resolvedBy: adminId, resolvedAt: new Date(), action: "DISMISSED" },
  });

  // Penalise the false-reporter per spec.
  await adjustTrustScore(flag.reportedBy, TRUST_DELTAS.FLAG_REPORTER_FALSE, `FLAG_REPORTER_FALSE:${flag.id}`);

  return NextResponse.json({ ok: true });
}
