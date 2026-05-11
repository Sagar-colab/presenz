import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalisePhoneIN, sha256 } from "@/lib/utils";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getSmsService } from "@/lib/services/sms";

const Body = z.object({ phone: z.string().min(10).max(20) });

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

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await sha256(code);

  await prisma.otpAttempt.create({
    data: {
      phone,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
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
