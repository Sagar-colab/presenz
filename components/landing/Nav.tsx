import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Nav() {
  return (
    <header className="w-full">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-5">
        <Link href="/" aria-label="Presenz home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-[14px]">
          <Link
            href="/onboarding"
            className="rounded-xl px-3.5 py-2 text-ink-soft transition-all duration-150 hover:bg-surface-alt active:scale-[0.97]"
          >
            Sign in
          </Link>
          <Link
            href="/onboarding"
            className="rounded-xl bg-primary px-4 py-2 text-white transition-all duration-150 hover:bg-primary-600 active:scale-[0.97]"
          >
            Get invite
          </Link>
        </nav>
      </div>
    </header>
  );
}
