import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant } from "@/lib/match";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "match-pass"), capacity: 10, refillPerSec: 0.2 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (!isMatchParticipant(match, userId)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  if (match.status !== "PENDING") {
    return NextResponse.json({ ok: false, reason: "not_pending" }, { status: 409 });
  }

  await prisma.match.update({
    where: { id: match.id },
    data: { status: "CLOSED" },
  });
  return NextResponse.json({ ok: true });
}
