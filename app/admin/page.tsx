import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalUsers, verifiedUsers, activeMatchesToday, proposalsSent, datesConfirmed, flaggedAccounts] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { aadhaarVerified: true, faceVerified: true } }),
    prisma.match.count({ where: { status: "ACTIVE", createdAt: { gte: startOfDay } } }),
    prisma.dateProposal.count(),
    prisma.dateProposal.count({ where: { status: "ACCEPTED" } }),
    prisma.user.count({ where: { flagsReceived: { some: { status: "OPEN" } } } }),
  ]);

  const stats: { label: string; value: number }[] = [
    { label: "Total users", value: totalUsers },
    { label: "Verified", value: verifiedUsers },
    { label: "Active matches today", value: activeMatchesToday },
    { label: "Proposals sent", value: proposalsSent },
    { label: "Dates confirmed", value: datesConfirmed },
    { label: "Flagged accounts", value: flaggedAccounts },
  ];

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-semibold tracking-tightish text-ink">Overview</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-surface-line bg-surface-alt p-4">
            <div className="text-[12px] uppercase tracking-[0.12em] text-ink-faint">{s.label}</div>
            <div className="mt-2 text-[28px] font-semibold text-ink">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
