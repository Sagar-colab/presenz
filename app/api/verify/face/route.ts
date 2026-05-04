import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getFaceService } from "@/lib/services/face";

const Body = z.object({ selfie: z.string().startsWith("data:image/").max(8 * 1024 * 1024) });

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "face"), capacity: 5, refillPerSec: 1 / 60 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const svc = getFaceService();
  const result = await svc.livenessAndMatch(parsed.selfie);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { faceVerified: true, trustScore: { increment: 30 } },
  });

  return NextResponse.json({ ok: true, livenessScore: result.livenessScore, matchScore: result.matchScore });
}
