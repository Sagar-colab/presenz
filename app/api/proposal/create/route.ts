import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant, sweepExpiry } from "@/lib/match";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const Body = z.object({
  matchId: z.string().min(1),
  dateType: z.enum(["COFFEE", "WALK", "MEAL", "ACTIVITY", "DRINK", "OTHER"]),
  venue: z.string().min(1).max(200),
  timeSlot1: z.string().datetime(),
  timeSlot2: z.string().datetime(),
  note: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "proposal-create"), capacity: 5, refillPerSec: 0.1 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  await sweepExpiry(parsed.matchId);

  const match = await prisma.match.findUnique({ where: { id: parsed.matchId } });
  if (!match) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (!isMatchParticipant(match, userId)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  if (match.status !== "PENDING") {
    return NextResponse.json({ ok: false, reason: "not_pending" }, { status: 409 });
  }

  // One active proposal per match — block if there's already a PENDING one.
  const existing = await prisma.dateProposal.findFirst({
    where: { matchId: match.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ ok: false, reason: "proposal_already_pending" }, { status: 409 });
  }

  // Time slots must be in the future and slot2 != slot1.
  const t1 = new Date(parsed.timeSlot1);
  const t2 = new Date(parsed.timeSlot2);
  const now = Date.now();
  if (t1.getTime() <= now || t2.getTime() <= now) {
    return NextResponse.json({ ok: false, reason: "slot_in_past" }, { status: 400 });
  }
  if (t1.getTime() === t2.getTime()) {
    return NextResponse.json({ ok: false, reason: "slots_identical" }, { status: 400 });
  }

  // Proposal note IS the first message — count it toward the 3-msg cap.
  const proposal = await prisma.$transaction(async (tx) => {
    const created = await tx.dateProposal.create({
      data: {
        matchId: match.id,
        proposedBy: userId,
        dateType: parsed.dateType,
        venue: parsed.venue,
        timeSlot1: t1,
        timeSlot2: t2,
        status: "PENDING",
      },
    });
    await tx.message.create({
      data: { matchId: match.id, senderId: userId, content: parsed.note },
    });
    return created;
  });

  return NextResponse.json({ ok: true, proposalId: proposal.id });
}
