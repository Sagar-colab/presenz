import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { adjustTrustScore, TRUST_DELTAS } from "@/lib/trust";

const REASONS = ["fake_profile", "inappropriate_photos", "harassment", "spam", "other"] as const;

const Body = z.object({
  reportedUser: z.string().min(1),
  reason: z.enum(REASONS),
  detail: z.string().max(500).optional(),
});

const AUTO_SUSPEND_THRESHOLD = 3;

export async function POST(req: Request) {
  const reporterId = await requireUserId();
  if (!reporterId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "flag"), capacity: 5, refillPerSec: 1 / 60 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  if (parsed.reportedUser === reporterId) {
    return NextResponse.json({ ok: false, reason: "cannot_report_self" }, { status: 400 });
  }

  const subject = await prisma.user.findUnique({ where: { id: parsed.reportedUser }, select: { id: true } });
  if (!subject) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });

  await prisma.flag.create({
    data: {
      reportedUser: subject.id,
      reportedBy: reporterId,
      reason: parsed.detail ? `${parsed.reason}: ${parsed.detail}` : parsed.reason,
    },
  });

  await adjustTrustScore(subject.id, TRUST_DELTAS.FLAG_RECEIVED, `FLAG_RECEIVED:${reporterId}`);

  // Auto-suspend if the user has accumulated >= threshold OPEN flags.
  const openFlagCount = await prisma.flag.count({
    where: { reportedUser: subject.id, status: "OPEN" },
  });
  if (openFlagCount >= AUTO_SUSPEND_THRESHOLD) {
    await prisma.$transaction([
      prisma.user.update({ where: { id: subject.id }, data: { isBanned: true } }),
      prisma.trustEvent.create({
        data: { userId: subject.id, delta: 0, reason: `AUTO_SUSPEND:${openFlagCount}_flags` },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
