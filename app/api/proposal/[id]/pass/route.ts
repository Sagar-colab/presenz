import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant } from "@/lib/match";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "proposal-pass"), capacity: 5, refillPerSec: 0.2 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  const proposal = await prisma.dateProposal.findUnique({
    where: { id: id },
    include: { match: true },
  });
  if (!proposal) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (!isMatchParticipant(proposal.match, userId)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  if (proposal.proposedBy === userId) {
    return NextResponse.json({ ok: false, reason: "cannot_pass_own" }, { status: 409 });
  }
  if (proposal.status !== "PENDING") {
    return NextResponse.json({ ok: false, reason: "not_pending" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.dateProposal.update({
      where: { id: proposal.id },
      data: { status: "PASSED" },
    }),
    prisma.match.update({
      where: { id: proposal.matchId },
      data: { status: "CLOSED" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
