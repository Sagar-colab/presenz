import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant } from "@/lib/match";
import { rateLimit, clientKey } from "@/lib/rate-limit";

// 3 = great, 2 = okay, 1 = didn't meet. Trust score deltas are private —
// never returned to the user.
const Body = z.object({ rating: z.union([z.literal(1), z.literal(2), z.literal(3)]) });

const TRUST_DELTA = { 1: -5, 2: 0, 3: 8 } as const;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "checkin"), capacity: 5, refillPerSec: 0.1 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (!isMatchParticipant(match, userId)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }

  const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
  const delta = TRUST_DELTA[parsed.rating];

  try {
    await prisma.$transaction([
      prisma.dateRating.create({
        data: { matchId: match.id, ratedBy: userId, rating: parsed.rating },
      }),
      // Both users' trust scores nudged based on the rater's view.
      prisma.user.update({
        where: { id: otherUserId },
        data: { trustScore: { increment: delta } },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { trustScore: { increment: parsed.rating === 1 ? -2 : 1 } },
      }),
      prisma.match.update({
        where: { id: match.id },
        data: { status: "CLOSED" },
      }),
    ]);
  } catch {
    // Most likely: unique([matchId, ratedBy]) violation — already checked in.
    return NextResponse.json({ ok: false, reason: "already_checked_in" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
