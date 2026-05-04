import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { findOrCreateTodaysMatch, otherUserId } from "@/lib/match";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "match-today"), capacity: 30, refillPerSec: 1 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  const match = await findOrCreateTodaysMatch(userId);
  if (!match) return NextResponse.json({ ok: true, match: null });

  const otherId = otherUserId(match, userId);
  const other = await prisma.user.findUnique({
    where: { id: otherId },
    include: { profile: true },
  });

  return NextResponse.json({
    ok: true,
    match: {
      id: match.id,
      status: match.status,
      expiresAt: match.expiresAt,
      createdAt: match.createdAt,
      other: other && {
        id: other.id,
        name: other.name,
        age: other.age,
        city: other.city,
        photos: other.profile?.photos ?? [],
      },
    },
  });
}
