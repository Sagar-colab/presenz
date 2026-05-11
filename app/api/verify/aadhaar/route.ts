import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isValidAadhaar } from "@/lib/utils";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getAadhaarService } from "@/lib/services/aadhaar";
import { adjustTrustScore, TRUST_DELTAS } from "@/lib/trust";

const Body = z.object({ aadhaar: z.string().min(12).max(20) });

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "aadhaar"), capacity: 5, refillPerSec: 1 / 60 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  if (!isValidAadhaar(parsed.aadhaar)) {
    return NextResponse.json({ ok: false, reason: "invalid_format" }, { status: 400 });
  }

  const svc = getAadhaarService();
  const result = await svc.verify(parsed.aadhaar);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 400 });
  }

  const before = await prisma.user.findUnique({
    where: { id: userId },
    select: { aadhaarVerified: true },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { aadhaarVerified: true, aadhaarLast4: result.last4 },
  });
  if (!before?.aadhaarVerified) {
    await adjustTrustScore(userId, TRUST_DELTAS.AADHAAR_VERIFIED, "AADHAAR_VERIFIED");
  }

  return NextResponse.json({ ok: true, last4: result.last4 });
}
