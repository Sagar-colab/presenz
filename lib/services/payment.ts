import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { PLAN_META, type PlanTier } from "@/lib/plans";

// Razorpay subscription wrapper. Degrades gracefully when env vars are
// missing: isConfigured() returns false and callers return a configured-no
// reason without throwing.

type RazorpayClient = {
  plans: {
    create: (opts: {
      period: "monthly";
      interval: 1;
      item: { name: string; amount: number; currency: "INR" };
    }) => Promise<{ id: string }>;
  };
  subscriptions: {
    create: (opts: {
      plan_id: string;
      total_count: number;
      customer_notify: 0 | 1;
      notes?: Record<string, string>;
    }) => Promise<{ id: string; status: string; short_url?: string }>;
    cancel: (subId: string, cancelAtPeriodEnd: boolean) => Promise<{ id: string; status: string }>;
  };
};

let client: RazorpayClient | null = null;

export function isConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

async function getClient(): Promise<RazorpayClient> {
  if (client) return client;
  if (!isConfigured()) throw new Error("razorpay not configured");
  const { default: Razorpay } = await import("razorpay");
  client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  }) as unknown as RazorpayClient;
  return client;
}

export async function createRazorpayPlan(tier: Exclude<PlanTier, "FREE">): Promise<string> {
  const meta = PLAN_META[tier];
  const rzp = await getClient();
  const plan = await rzp.plans.create({
    period: "monthly",
    interval: 1,
    item: { name: `Presenz · ${meta.label}`, amount: meta.priceInrPaise, currency: "INR" },
  });
  await prisma.razorpayPlan.upsert({
    where: { tier },
    create: { tier, razorpayPlanId: plan.id, amountInrPaise: meta.priceInrPaise },
    update: { razorpayPlanId: plan.id, amountInrPaise: meta.priceInrPaise },
  });
  return plan.id;
}

export async function createSubscription(opts: {
  userId: string;
  tier: Exclude<PlanTier, "FREE">;
}): Promise<{ subscriptionId: string; razorpaySubId: string; shortUrl?: string } | { error: string }> {
  if (!isConfigured()) return { error: "payments_not_configured" };

  const plan = await prisma.razorpayPlan.findUnique({ where: { tier: opts.tier } });
  if (!plan) return { error: "plan_not_provisioned" };

  const rzp = await getClient();
  const sub = await rzp.subscriptions.create({
    plan_id: plan.razorpayPlanId,
    total_count: 12,
    customer_notify: 1,
    notes: { userId: opts.userId, tier: opts.tier },
  });

  const dbSub = await prisma.subscription.upsert({
    where: { userId: opts.userId },
    create: {
      userId: opts.userId,
      plan: opts.tier,
      status: "PENDING",
      razorpaySubId: sub.id,
    },
    update: {
      plan: opts.tier,
      status: "PENDING",
      razorpaySubId: sub.id,
      cancelAtPeriodEnd: false,
    },
  });

  return { subscriptionId: dbSub.id, razorpaySubId: sub.id, shortUrl: sub.short_url };
}

export async function cancelSubscription(razorpaySubId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isConfigured()) return { ok: false, reason: "payments_not_configured" };
  try {
    const rzp = await getClient();
    await rzp.subscriptions.cancel(razorpaySubId, true);
    await prisma.subscription.update({
      where: { razorpaySubId },
      data: { cancelAtPeriodEnd: true },
    });
    return { ok: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "razorpay_error";
    return { ok: false, reason };
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}
