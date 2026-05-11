import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalisePhoneIN } from "@/lib/utils";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const Body = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(10).max(20),
  city: z.string().min(1).max(80),
  reason: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const limit = rateLimit({ key: clientKey(req, "waitlist"), capacity: 5, refillPerSec: 1 / 60 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const phone = normalisePhoneIN(parsed.phone);
  if (!phone) return NextResponse.json({ ok: false, reason: "invalid_phone" }, { status: 400 });

  try {
    await prisma.waitlist.create({
      data: {
        name: parsed.name.trim(),
        phone,
        city: parsed.city.trim(),
        reason: parsed.reason?.trim() || null,
      },
    });
  } catch {
    // Most likely: unique phone violation — they've already signed up.
    return NextResponse.json({ ok: true, alreadyOnList: true });
  }
  return NextResponse.json({ ok: true });
}
