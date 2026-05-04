import { cn } from "@/lib/utils";

export function ProgressBar({
  step,
  total,
  className,
  label,
}: {
  step: number;
  total: number;
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (step / total) * 100));
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12.5px] uppercase tracking-[0.14em] text-ink-faint">
          {label ?? `Step ${step} of ${total}`}
        </span>
        <span className="text-[12.5px] tabular-nums text-ink-muted">{Math.round(pct)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
        className="h-1 w-full rounded-full bg-surface-alt overflow-hidden hairline"
      >
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
