import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant, sweepExpiry, otherUserId } from "@/lib/match";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const proposal = await prisma.dateProposal.findUnique({
    where: { id: params.id },
    include: { match: true, author: { include: { profile: true } } },
  });
  if (!proposal) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (!isMatchParticipant(proposal.match, userId)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }

  await sweepExpiry(proposal.matchId);

  const otherId = otherUserId(proposal.match, userId);
  const other = await prisma.user.findUnique({ where: { id: otherId }, include: { profile: true } });

  return NextResponse.json({
    ok: true,
    proposal: {
      id: proposal.id,
      matchId: proposal.matchId,
      proposedBy: proposal.proposedBy,
      isMine: proposal.proposedBy === userId,
      dateType: proposal.dateType,
      venue: proposal.venue,
      timeSlot1: proposal.timeSlot1,
      timeSlot2: proposal.timeSlot2,
      status: proposal.status,
      createdAt: proposal.createdAt,
      author: {
        id: proposal.author.id,
        name: proposal.author.name,
        age: proposal.author.age,
        city: proposal.author.city,
        photos: proposal.author.profile?.photos ?? [],
      },
      other: other && {
        id: other.id,
        name: other.name,
        photos: other.profile?.photos ?? [],
      },
    },
  });
}
