import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant, sweepExpiry } from "@/lib/match";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const Body = z.object({
  timeSlot1: z.string().datetime(),
  timeSlot2: z.string().datetime(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "proposal-counter"), capacity: 5, refillPerSec: 0.1 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const t1 = new Date(parsed.timeSlot1);
  const t2 = new Date(parsed.timeSlot2);
  const now = Date.now();
  if (t1.getTime() <= now || t2.getTime() <= now) {
    return NextResponse.json({ ok: false, reason: "slot_in_past" }, { status: 400 });
  }
  if (t1.getTime() === t2.getTime()) {
    return NextResponse.json({ ok: false, reason: "slots_identical" }, { status: 400 });
  }

  await sweepExpiry();

  const proposal = await prisma.dateProposal.findUnique({
    where: { id: params.id },
    include: { match: true },
  });
  if (!proposal) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (!isMatchParticipant(proposal.match, userId)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  if (proposal.proposedBy === userId) {
    return NextResponse.json({ ok: false, reason: "cannot_counter_own" }, { status: 409 });
  }
  if (proposal.status !== "PENDING") {
    return NextResponse.json({ ok: false, reason: "not_pending" }, { status: 409 });
  }

  // Mark original as COUNTERED, create a new PENDING proposal authored by counter-er,
  // keeping the venue + dateType (only the time changes).
  const created = await prisma.$transaction(async (tx) => {
    await tx.dateProposal.update({
      where: { id: proposal.id },
      data: { status: "COUNTERED" },
    });
    return tx.dateProposal.create({
      data: {
        matchId: proposal.matchId,
        proposedBy: userId,
        dateType: proposal.dateType,
        venue: proposal.venue,
        timeSlot1: t1,
        timeSlot2: t2,
        status: "PENDING",
      },
    });
  });

  return NextResponse.json({ ok: true, proposalId: created.id });
}
