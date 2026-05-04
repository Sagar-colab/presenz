import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant } from "@/lib/match";

const MAX_MESSAGES = 3;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (!isMatchParticipant(match, userId)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { matchId: params.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, senderId: true, content: true, createdAt: true },
  });

  return NextResponse.json({
    ok: true,
    messages,
    used: messages.length,
    remaining: Math.max(0, MAX_MESSAGES - messages.length),
    locked: messages.length >= MAX_MESSAGES,
  });
}
