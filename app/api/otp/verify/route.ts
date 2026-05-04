import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalisePhoneIN, sha256 } from "@/lib/utils";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const Body = z.object({
  phone: z.string().min(10).max(20),
  code: z.string().regex(/^\d{6}$/),
});

const MAX_ATTEMPTS = 3;

export async function POST(req: Request) {
  const ip = rateLimit({ key: clientKey(req, "otp-verify"), capacity: 10, refillPerSec: 1 / 6 });
  if (!ip.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const phone = normalisePhoneIN(parsed.phone);
  if (!phone) return NextResponse.json({ ok: false, reason: "invalid_phone" }, { status: 400 });

  // Latest unconsumed attempt for this phone
  const attempt = await prisma.otpAttempt.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!attempt) return NextResponse.json({ ok: false, reason: "no_active_otp" }, { status: 400 });

  if (attempt.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ ok: false, reason: "expired" }, { status: 400 });
  }

  if (attempt.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ ok: false, reason: "locked_out" }, { status: 423 });
  }

  const codeHash = await sha256(parsed.code);
  if (codeHash !== attempt.codeHash) {
    const updated = await prisma.otpAttempt.update({
      where: { id: attempt.id },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_code",
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - updated.attempts),
      },
      { status: 401 },
    );
  }

  // Verified — caller now signs in via NextAuth Credentials provider with the same code,
  // which marks the row consumedAt. We don't mark it here so the credentials path can validate.
  return NextResponse.json({ ok: true });
}
