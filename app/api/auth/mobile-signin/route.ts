import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalisePhoneIN, sha256 } from "@/lib/utils";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { signMobileToken } from "@/lib/mobile-auth";

// Mobile counterpart to the NextAuth credentials flow. Same OTP semantics +
// invite-code consumption as lib/auth.ts authorize() — keep these two
// functions behaviourally identical or sign-in will diverge across surfaces.

const Body = z.object({
  phone: z.string().min(10).max(20),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  const limit = rateLimit({ key: clientKey(req, "mobile-signin"), capacity: 10, refillPerSec: 1 / 6 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const phone = normalisePhoneIN(parsed.phone);
  if (!phone) return NextResponse.json({ ok: false, reason: "invalid_phone" }, { status: 400 });

  const codeHash = await sha256(parsed.code);
  const otp = await prisma.otpAttempt.findFirst({
    where: { phone, codeHash, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return NextResponse.json({ ok: false, reason: "invalid_code" }, { status: 401 });

  await prisma.otpAttempt.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  // Sign-in vs sign-up split — mirrors lib/auth.ts.
  const existing = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
  let userId: string;

  if (!existing) {
    if (!otp.inviteCode) {
      return NextResponse.json({ ok: false, reason: "invite_required" }, { status: 403 });
    }
    const invite = await prisma.inviteCode.findUnique({
      where: { code: otp.inviteCode },
      select: { id: true, isActive: true, usedBy: true },
    });
    if (!invite || !invite.isActive || invite.usedBy) {
      return NextResponse.json({ ok: false, reason: "invite_invalid" }, { status: 403 });
    }
    const created = await prisma.user.create({
      data: { phone, phoneVerified: true, inviteCode: otp.inviteCode },
    });
    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: { usedBy: created.id, usedAt: new Date() },
    });
    userId = created.id;
  } else {
    await prisma.user.update({ where: { phone }, data: { phoneVerified: true } });
    userId = existing.id;
  }

  const token = await signMobileToken(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      phone: true,
      city: true,
      plan: true,
      aadhaarVerified: true,
      faceVerified: true,
      profileComplete: true,
      status: true,
    },
  });

  return NextResponse.json({ ok: true, token, user });
}
