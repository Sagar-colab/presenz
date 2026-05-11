import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { normaliseInviteCode } from "@/lib/invite";

const Body = z.object({ code: z.string().min(4).max(16) });

export async function POST(req: Request) {
  const limit = rateLimit({ key: clientKey(req, "invite-check"), capacity: 10, refillPerSec: 1 / 12 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const code = normaliseInviteCode(parsed.code);
  const invite = await prisma.inviteCode.findUnique({
    where: { code },
    select: { isActive: true, usedBy: true },
  });

  if (!invite || !invite.isActive) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 404 });
  }
  if (invite.usedBy) {
    return NextResponse.json({ ok: false, reason: "already_used" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
