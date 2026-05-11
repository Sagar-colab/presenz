import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { cancelSubscription } from "@/lib/services/payment";

export async function POST() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { razorpaySubId: true, status: true },
  });
  if (!sub?.razorpaySubId) return NextResponse.json({ ok: false, reason: "no_subscription" }, { status: 404 });
  if (sub.status !== "ACTIVE" && sub.status !== "PENDING") {
    return NextResponse.json({ ok: false, reason: "not_cancellable" }, { status: 409 });
  }

  const result = await cancelSubscription(sub.razorpaySubId);
  if (!result.ok) return NextResponse.json({ ok: false, reason: result.reason }, { status: 502 });

  return NextResponse.json({ ok: true });
}
