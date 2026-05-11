import { prisma } from "@/lib/db";
import { maskPhone } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const rows = await prisma.waitlist.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-semibold tracking-tightish text-ink">Waitlist</h1>
      <div className="overflow-x-auto rounded-lg border border-surface-line">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-alt text-left text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Reason</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Invited</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} className="border-t border-surface-line align-top">
                <td className="px-3 py-2 text-ink">{w.name}</td>
                <td className="px-3 py-2 text-ink-muted">{maskPhone(w.phone)}</td>
                <td className="px-3 py-2 text-ink-muted">{w.city}</td>
                <td className="px-3 py-2 text-ink-muted max-w-xs">{w.reason ?? "—"}</td>
                <td className="px-3 py-2 text-ink-muted">{w.createdAt.toISOString().slice(0, 10)}</td>
                <td className="px-3 py-2 text-ink-muted">
                  {w.invitedAt ? w.invitedAt.toISOString().slice(0, 10) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="px-3 py-8 text-center text-[13px] text-ink-faint">No one on the waitlist yet.</div>
        )}
      </div>
    </div>
  );
}
