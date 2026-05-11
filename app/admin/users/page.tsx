import { prisma } from "@/lib/db";
import { maskPhone } from "@/lib/admin";
import { getTrustLevel } from "@/lib/trust";
import { UserRowActions } from "@/components/admin/UserRowActions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      phone: true,
      city: true,
      aadhaarVerified: true,
      faceVerified: true,
      trustScore: true,
      isBanned: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-semibold tracking-tightish text-ink">Users</h1>
      <div className="overflow-x-auto rounded-lg border border-surface-line">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-alt text-left text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Verified</th>
              <th className="px-3 py-2">Trust</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const level = getTrustLevel(u.trustScore);
              const verified = u.aadhaarVerified && u.faceVerified;
              return (
                <tr key={u.id} className="border-t border-surface-line">
                  <td className="px-3 py-2 text-ink">{u.name ?? <span className="text-ink-faint">—</span>}</td>
                  <td className="px-3 py-2 text-ink-muted">{maskPhone(u.phone)}</td>
                  <td className="px-3 py-2 text-ink-muted">{u.city ?? "—"}</td>
                  <td className="px-3 py-2">{verified ? "✓" : "○"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        level === "high"
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-800"
                          : level === "medium"
                            ? "rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800"
                            : "rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-800"
                      }
                    >
                      {u.trustScore} · {level}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ink-muted">{u.createdAt.toISOString().slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    {u.isBanned ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-800">banned</span>
                    ) : (
                      <span className="text-ink-muted">active</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <UserRowActions userId={u.id} isBanned={u.isBanned} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="px-3 py-8 text-center text-[13px] text-ink-faint">No users yet.</div>
        )}
      </div>
    </div>
  );
}
