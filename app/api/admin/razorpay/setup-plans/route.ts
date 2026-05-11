import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { createRazorpayPlan, isConfigured } from "@/lib/services/payment";

// One-shot: creates the Razorpay Plan objects for PLUS and CONCIERGE if they
// don't already exist, and stores their plan_ids in the RazorpayPlan table.
// Idempotent — safe to call repeatedly.

export async function POST() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });

  if (!isConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "razorpay_env_missing", need: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] },
      { status: 503 },
    );
  }

  const existing = await prisma.razorpayPlan.findMany({ select: { tier: true, razorpayPlanId: true } });
  const haveTiers = new Set(existing.map((p) => p.tier));

  const created: { tier: string; razorpayPlanId: string }[] = [];
  for (const tier of ["PLUS", "CONCIERGE"] as const) {
    if (haveTiers.has(tier)) continue;
    const planId = await createRazorpayPlan(tier);
    created.push({ tier, razorpayPlanId: planId });
  }

  const all = await prisma.razorpayPlan.findMany({ select: { tier: true, razorpayPlanId: true, amountInrPaise: true } });
  return NextResponse.json({ ok: true, created, plans: all });
}
