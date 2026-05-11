import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PlanCard } from "@/components/PlanCard";
import { SubscribeButton } from "@/components/SubscribeButton";
import { CancelSubscriptionButton } from "@/components/CancelSubscriptionButton";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { Plan } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const userId = await requireUserId();
  if (!userId) redirect("/onboarding");

  const [user, sub] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
    }),
  ]);

  const currentPlan: Plan = user?.plan ?? "FREE";

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tightish text-ink">Subscription</h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          You're on the{" "}
          <span className="font-medium text-ink">{currentPlan.toLowerCase()}</span> plan.
        </p>
        {sub?.status === "ACTIVE" && sub.cancelAtPeriodEnd && sub.currentPeriodEnd && (
          <p className="mt-2 text-[13px] text-amber-700">
            Cancelled — premium remains until {sub.currentPeriodEnd.toISOString().slice(0, 10)}.
          </p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <PlanCard
          tier="FREE"
          highlighted={currentPlan === "FREE"}
          footer={
            currentPlan === "FREE" ? (
              <p className="text-center text-[12px] text-ink-faint">Current plan</p>
            ) : null
          }
        />
        <PlanCard
          tier="PLUS"
          highlighted={currentPlan === "PLUS"}
          footer={
            currentPlan === "PLUS" ? (
              <p className="text-center text-[12px] text-ink-faint">Current plan</p>
            ) : (
              <SubscribeButton tier="PLUS" label="Upgrade to Presenz+" />
            )
          }
        />
        <PlanCard
          tier="CONCIERGE"
          highlighted={currentPlan === "CONCIERGE"}
          footer={
            currentPlan === "CONCIERGE" ? (
              <p className="text-center text-[12px] text-ink-faint">Current plan</p>
            ) : (
              <SubscribeButton tier="CONCIERGE" label="Upgrade to Concierge" variant="ghost" />
            )
          }
        />
      </div>

      {currentPlan !== "FREE" && sub?.status === "ACTIVE" && !sub.cancelAtPeriodEnd && (
        <div className="mt-8 flex justify-center">
          <CancelSubscriptionButton />
        </div>
      )}
    </AppShell>
  );
}
