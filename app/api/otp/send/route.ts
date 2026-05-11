import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalisePhoneIN, sha256 } from "@/lib/utils";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getSmsService } from "@/lib/services/sms";
import { normaliseInviteCode } from "@/lib/invite";

const Body = z.object({
  phone: z.string().min(10).max(20),
  inviteCode: z.string().min(4).max(16).optional(),
});

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;

export async function POST(req: Request) {
  const ip = rateLimit({ key: clientKey(req, "otp-send"), capacity: 5, refillPerSec: 1 / 60 });
  if (!ip.ok) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const phone = normalisePhoneIN(parsed.phone);
  if (!phone) {
    return NextResponse.json({ ok: false, reason: "invalid_phone" }, { status: 400 });
  }

  // Per-phone limit: 5 sends / hour
  const perPhone = rateLimit({ key: `otp-send-phone:${phone}`, capacity: 5, refillPerSec: 5 / 3600 });
  if (!perPhone.ok) {
    return NextResponse.json(
      { ok: false, reason: "phone_rate_limited", retryAfterMs: perPhone.retryAfterMs },
      { status: 429 },
    );
  }

  // Invite-only beta: existing users may sign in without a code, but new
  // accounts must present a valid+unused invite. Validating here lets us
  // attach the code to the OtpAttempt so the auth callback can consume it
  // atomically with user creation.
  const existingUser = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
  let storedInviteCode: string | null = null;
  if (!existingUser) {
    if (!parsed.inviteCode) {
      return NextResponse.json({ ok: false, reason: "invite_required" }, { status: 400 });
    }
    const code = normaliseInviteCode(parsed.inviteCode);
    const invite = await prisma.inviteCode.findUnique({
      where: { code },
      select: { isActive: true, usedBy: true },
    });
    if (!invite || !invite.isActive) {
      return NextResponse.json({ ok: false, reason: "invite_invalid" }, { status: 400 });
    }
    if (invite.usedBy) {
      return NextResponse.json({ ok: false, reason: "invite_used" }, { status: 409 });
    }
    storedInviteCode = code;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await sha256(code);

  await prisma.otpAttempt.create({
    data: {
      phone,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      inviteCode: storedInviteCode,
    },
  });

  const sms = getSmsService();
  const result = await sms.sendOtp(phone, code);
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.error(`[otp/send] sms_failed phone=${phone.slice(0, 3)}***${phone.slice(-4)} reason=${result.reason}`);
    return NextResponse.json({ ok: false, reason: "sms_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, expiresInMs: OTP_TTL_MS, maxAttempts: MAX_ATTEMPTS });
}
