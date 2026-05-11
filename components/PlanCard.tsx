import { PLAN_META, type PlanTier } from "@/lib/plans";

export function PlanCard({
  tier,
  highlighted,
  footer,
}: {
  tier: PlanTier;
  highlighted?: boolean;
  footer?: React.ReactNode;
}) {
  const meta = PLAN_META[tier];
  return (
    <div
      className={
        "flex flex-col rounded-2xl border p-6 " +
        (highlighted
          ? "border-primary bg-surface shadow-lg ring-1 ring-primary/30"
          : "border-surface-line bg-surface")
      }
    >
      <div className="text-[12px] uppercase tracking-[0.14em] text-ink-faint">{meta.label}</div>
      <div className="mt-3 text-[28px] font-semibold tracking-tightish text-ink">
        {meta.priceInrDisplay}
      </div>
      <p className="mt-1 text-[13px] text-ink-muted">{meta.tagline}</p>
      <ul className="mt-5 space-y-2 text-[14px] leading-relaxed text-ink-soft">
        {meta.features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="mt-1 text-[11px] text-primary">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
}
