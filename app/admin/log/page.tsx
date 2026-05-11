import { prisma } from "@/lib/db";
import { maskPhone } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Moderation log derives from two sources:
// 1. TrustEvent rows whose reason matches an admin-initiated action.
// 2. Flag rows that have been resolved (resolvedBy + resolvedAt set).
const ADMIN_REASONS = ["WARNING_ISSUED", "BAN_ISSUED", "UNBAN_ISSUED"];

export default async function AdminLogPage() {
  const [events, resolvedFlags] = await Promise.all([
    prisma.trustEvent.findMany({
      where: { reason: { in: ADMIN_REASONS } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, phone: true } } },
    }),
    prisma.flag.findMany({
      where: { resolvedBy: { not: null } },
      orderBy: { resolvedAt: "desc" },
      take: 100,
      include: {
        subject: { select: { name: true, phone: true } },
        resolver: { select: { name: true, phone: true } },
      },
    }),
  ]);

  type Row = { when: Date; what: string; who: string; target: string; note: string };
  const rows: Row[] = [
    ...events.map((e) => ({
      when: e.createdAt,
      what: e.reason,
      who: "admin",
      target: `${e.user.name ?? "—"} (${maskPhone(e.user.phone)})`,
      note: `Δtrust ${e.delta}`,
    })),
    ...resolvedFlags.map((f) => ({
      when: f.resolvedAt ?? f.createdAt,
      what: `FLAG_${f.action ?? f.status}`,
      who: f.resolver?.name ?? "admin",
      target: `${f.subject.name ?? "—"} (${maskPhone(f.subject.phone)})`,
      note: f.reason.slice(0, 80),
    })),
  ].sort((a, b) => b.when.getTime() - a.when.getTime());

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-semibold tracking-tightish text-ink">Moderation log</h1>
      <div className="overflow-x-auto rounded-lg border border-surface-line">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-alt text-left text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Admin</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-surface-line">
                <td className="px-3 py-2 text-ink-muted">{r.when.toISOString().slice(0, 19).replace("T", " ")}</td>
                <td className="px-3 py-2 text-ink">{r.what}</td>
                <td className="px-3 py-2 text-ink-muted">{r.who}</td>
                <td className="px-3 py-2 text-ink-muted">{r.target}</td>
                <td className="px-3 py-2 text-ink-muted">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="px-3 py-8 text-center text-[13px] text-ink-faint">No actions logged yet.</div>
        )}
      </div>
    </div>
  );
}
