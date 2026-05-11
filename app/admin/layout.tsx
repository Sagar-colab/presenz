import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/flags", label: "Flags" },
  { href: "/admin/log", label: "Moderation log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminId = await requireAdmin();
  if (!adminId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      <aside className="w-full bg-[#0b0b0c] text-zinc-100 md:w-60 md:min-h-screen">
        <div className="px-5 py-5 text-[15px] font-semibold tracking-tight">Presenz · Admin</div>
        <nav className="flex flex-row gap-1 overflow-x-auto px-3 pb-3 text-[14px] md:flex-col md:px-3 md:pb-5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-2 text-zinc-300 hover:bg-white/5 hover:text-white whitespace-nowrap"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
