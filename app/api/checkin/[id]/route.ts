import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant } from "@/lib/match";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { adjustTrustScore, TRUST_DELTAS } from "@/lib/trust";

// 3 = great, 2 = okay, 1 = didn't meet. Trust deltas are private — never returned.
const Body = z.object({ rating: z.union([z.literal(1), z.literal(2), z.literal(3)]) });

const RATING_TO_DELTA = {
  1: TRUST_DELTAS.DATE_DIDNT_MEET,
  2: TRUST_DELTAS.DATE_OKAY,
  3: TRUST_DELTAS.DATE_GREAT,
} as const;

const RATING_TO_REASON = {
  1: "DATE_DIDNT_MEET",
  2: "DATE_OKAY",
  3: "DATE_GREAT",
} as const;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (!isMatchParticipant(match, userId)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }

  const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;

  try {
    await prisma.$transaction([
      prisma.dateRating.create({
        data: { matchId: match.id, ratedBy: userId, rating: parsed.rating },
      }),
      prisma.match.update({ where: { id: match.id }, data: { status: "CLOSED" } }),
    ]);
  } catch {
    return NextResponse.json({ ok: false, reason: "already_checked_in" }, { status: 409 });
  }

  // Trust adjustments happen outside the rating transaction so the rating still
  // sticks if the trust write hits a transient issue.
  await adjustTrustScore(otherUserId, RATING_TO_DELTA[parsed.rating], RATING_TO_REASON[parsed.rating]);

  return NextResponse.json({ ok: true });
}
