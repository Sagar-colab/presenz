import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAuthState } from "@/lib/admin";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/flags", label: "Flags" },
  { href: "/admin/log", label: "Moderation log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const state = await getAdminAuthState();

  if (state.kind === "anon") {
    redirect("/onboarding");
  }

  if (state.kind === "authed_not_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="max-w-md text-center">
          <h1 className="text-[24px] font-semibold tracking-tightish text-ink">Access denied</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            This area is for Presenz administrators. If you believe you should have access, contact
            support.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-[14px] text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

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
