import { prisma } from "@/lib/db";
import { maskPhone } from "@/lib/admin";
import { GenerateInvitesButton } from "@/components/admin/GenerateInvitesButton";

export const dynamic = "force-dynamic";

export default async function AdminInvitesPage() {
  const codes = await prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      usedByUser: { select: { name: true, phone: true } },
      creator: { select: { name: true } },
    },
  });

  const unused = codes.filter((c) => !c.usedBy).length;
  const used = codes.length - unused;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tightish text-ink">Invite codes</h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {unused} unused · {used} used · {codes.length} total
          </p>
        </div>
        <GenerateInvitesButton />
      </div>
      <div className="overflow-x-auto rounded-lg border border-surface-line">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-alt text-left text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Created by</th>
              <th className="px-3 py-2">Used by</th>
              <th className="px-3 py-2">Used at</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-t border-surface-line">
                <td className="px-3 py-2 font-mono text-ink">{c.code}</td>
                <td className="px-3 py-2 text-ink-muted">{c.createdAt.toISOString().slice(0, 10)}</td>
                <td className="px-3 py-2 text-ink-muted">{c.creator?.name ?? "admin"}</td>
                <td className="px-3 py-2">
                  {c.usedByUser ? (
                    <>
                      <div className="text-ink">{c.usedByUser.name ?? "—"}</div>
                      <div className="text-[11px] text-ink-faint">{maskPhone(c.usedByUser.phone)}</div>
                    </>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-ink-muted">
                  {c.usedAt ? c.usedAt.toISOString().slice(0, 10) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 && (
          <div className="px-3 py-8 text-center text-[13px] text-ink-faint">
            No invite codes yet. Click "Generate" to create some.
          </div>
        )}
      </div>
    </div>
  );
}
