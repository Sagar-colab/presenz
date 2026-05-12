import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant } from "@/lib/match";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const MAX_MESSAGES = 3;

const Body = z.object({ content: z.string().min(1).max(800) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "chat-message"), capacity: 10, refillPerSec: 0.5 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: id } });
  if (!match) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  if (!isMatchParticipant(match, userId)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  if (match.status !== "ACTIVE") {
    return NextResponse.json({ ok: false, reason: "chat_not_open" }, { status: 409 });
  }

  // Hard cap, server-side. Atomic create+count via transaction so two
  // concurrent posts can't both squeeze in past the limit.
  const result = await prisma.$transaction(async (tx) => {
    const used = await tx.message.count({ where: { matchId: match.id } });
    if (used >= MAX_MESSAGES) return { kind: "locked" as const };
    const msg = await tx.message.create({
      data: { matchId: match.id, senderId: userId, content: parsed.content },
    });
    return { kind: "ok" as const, msg, used: used + 1 };
  });

  if (result.kind === "locked") {
    return NextResponse.json({ ok: false, reason: "max_messages_reached" }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    message: result.msg,
    used: result.used,
    remaining: Math.max(0, MAX_MESSAGES - result.used),
    locked: result.used >= MAX_MESSAGES,
  });
}
