import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function OnboardingShell({
  step,
  total,
  stepLabel,
  children,
}: {
  step: number;
  total: number;
  stepLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-surface-line bg-white">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Présenz home"><Logo /></Link>
          <Link href="/" className="text-[13px] text-ink-muted hover:text-ink">
            Save & exit
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10 md:py-14">
        <ProgressBar step={step} total={total} label={stepLabel} className="mb-10" />
        <div className="fade-up">{children}</div>
      </main>
    </div>
  );
}
