import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { createSubscription } from "@/lib/services/payment";

const Body = z.object({ tier: z.enum(["PLUS", "CONCIERGE"]) });

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "pay-create"), capacity: 5, refillPerSec: 1 / 60 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const result = await createSubscription({ userId, tier: parsed.tier });
  if ("error" in result) {
    return NextResponse.json({ ok: false, reason: result.error }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    subscriptionId: result.subscriptionId,
    razorpaySubId: result.razorpaySubId,
    shortUrl: result.shortUrl,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
