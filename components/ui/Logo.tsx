import { cn } from "@/lib/utils";

export function Logo({ className, dotColor }: { className?: string; dotColor?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1 font-semibold tracking-tight", className)}>
      <span className="text-ink">Presenz</span>
      <span
        aria-hidden
        className="h-1.5 w-1.5 self-center rounded-full"
        style={{ background: dotColor ?? "var(--primary)" }}
      />
    </span>
  );
}
