import { prisma } from "@/lib/db";
import { maskPhone } from "@/lib/admin";
import { FlagRowActions } from "@/components/admin/FlagRowActions";

export const dynamic = "force-dynamic";

export default async function AdminFlagsPage() {
  const flags = await prisma.flag.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      subject: { select: { id: true, name: true, phone: true, isBanned: true, trustScore: true } },
      reporter: { select: { id: true, name: true, phone: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-semibold tracking-tightish text-ink">Flag queue</h1>
      <div className="overflow-x-auto rounded-lg border border-surface-line">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-alt text-left text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            <tr>
              <th className="px-3 py-2">Reported user</th>
              <th className="px-3 py-2">Reporter</th>
              <th className="px-3 py-2">Reason</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.id} className="border-t border-surface-line align-top">
                <td className="px-3 py-2">
                  <div className="text-ink">{f.subject.name ?? "—"}</div>
                  <div className="text-[11px] text-ink-faint">{maskPhone(f.subject.phone)} · trust {f.subject.trustScore}</div>
                </td>
                <td className="px-3 py-2">
                  <div className="text-ink">{f.reporter.name ?? "—"}</div>
                  <div className="text-[11px] text-ink-faint">{maskPhone(f.reporter.phone)}</div>
                </td>
                <td className="px-3 py-2 text-ink-muted max-w-xs">{f.reason}</td>
                <td className="px-3 py-2 text-ink-muted">{f.createdAt.toISOString().slice(0, 10)}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[11px] text-ink-muted">{f.status}</span>
                  {f.action && <div className="mt-1 text-[11px] text-ink-faint">{f.action}</div>}
                </td>
                <td className="px-3 py-2">
                  {f.status === "OPEN" ? (
                    <FlagRowActions flagId={f.id} subjectId={f.subject.id} />
                  ) : (
                    <span className="text-[11px] text-ink-faint">resolved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {flags.length === 0 && (
          <div className="px-3 py-8 text-center text-[13px] text-ink-faint">No flags yet.</div>
        )}
      </div>
    </div>
  );
}
