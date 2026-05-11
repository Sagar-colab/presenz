import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/services/payment";
import type { Plan, SubscriptionStatus } from "@prisma/client";

// Razorpay subscription webhook handler.
// https://razorpay.com/docs/webhooks/payloads/subscriptions/
//
// The User.plan denormalised cache is updated here (and only here) so the
// app's hot path stays a single User read.

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    // eslint-disable-next-line no-console
    console.warn("[razorpay-webhook] signature verification failed");
    return NextResponse.json({ ok: false, reason: "bad_signature" }, { status: 400 });
  }

  let event: { event: string; payload?: { subscription?: { entity?: { id?: string; current_end?: number; status?: string; notes?: { userId?: string; tier?: string } } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_payload" }, { status: 400 });
  }

  const sub = event.payload?.subscription?.entity;
  const razorpaySubId = sub?.id;
  if (!razorpaySubId) {
    // eslint-disable-next-line no-console
    console.log(`[razorpay-webhook] event=${event.event} ignored (no subscription id)`);
    return NextResponse.json({ ok: true, ignored: true });
  }

  const dbSub = await prisma.subscription.findUnique({
    where: { razorpaySubId },
    select: { id: true, userId: true, plan: true },
  });
  if (!dbSub) {
    // eslint-disable-next-line no-console
    console.warn(`[razorpay-webhook] event=${event.event} no DB subscription for ${razorpaySubId}`);
    return NextResponse.json({ ok: true, ignored: true });
  }

  const currentEndDate = sub.current_end ? new Date(sub.current_end * 1000) : undefined;

  let nextStatus: SubscriptionStatus | undefined;
  let userPlan: Plan | undefined;

  switch (event.event) {
    case "subscription.activated":
    case "subscription.charged":
      nextStatus = "ACTIVE";
      userPlan = dbSub.plan;
      break;
    case "subscription.cancelled":
    case "subscription.halted":
      nextStatus = "CANCELLED";
      // Keep paid plan until period end (cancel_at_period_end behaviour).
      // We only downgrade User.plan when the subscription actually expires.
      break;
    case "subscription.completed":
    case "subscription.expired":
      nextStatus = "EXPIRED";
      userPlan = "FREE";
      break;
    case "subscription.pending":
      nextStatus = "PENDING";
      break;
    default:
      // eslint-disable-next-line no-console
      console.log(`[razorpay-webhook] event=${event.event} no handler — ignored`);
      return NextResponse.json({ ok: true, ignored: true });
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: dbSub.id },
      data: {
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(currentEndDate ? { currentPeriodEnd: currentEndDate } : {}),
      },
    }),
    ...(userPlan
      ? [prisma.user.update({ where: { id: dbSub.userId }, data: { plan: userPlan } })]
      : []),
  ]);

  // eslint-disable-next-line no-console
  console.log(`[razorpay-webhook] event=${event.event} sub=${razorpaySubId} status=${nextStatus} userPlan=${userPlan ?? "unchanged"}`);
  return NextResponse.json({ ok: true });
}
