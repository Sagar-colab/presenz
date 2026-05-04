import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

// Top bar for all signed-in pages. Calm and minimal — Presenz logo left,
// dashboard + settings on the right.
export function AppShell({
  children,
  maxWidth = "narrow",
}: {
  children: React.ReactNode;
  maxWidth?: "narrow" | "wide";
}) {
  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-surface-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" aria-label="Presenz home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-4 text-[13px] text-ink-muted">
            <Link href="/dashboard" className="transition-colors hover:text-ink">
              Today
            </Link>
            <Link href="/settings" className="transition-colors hover:text-ink">
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main
        className={cn(
          "mx-auto px-6 py-8 md:py-12",
          maxWidth === "narrow" ? "max-w-2xl" : "max-w-3xl",
        )}
      >
        {children}
      </main>
    </div>
  );
}
