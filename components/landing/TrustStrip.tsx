const items = [
  { label: "Phone verified", shape: "✓" },
  { label: "Aadhaar verified", shape: "✓" },
  { label: "Live face match", shape: "✓" },
  { label: "Manually moderated", shape: "○" },
];

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-4 pt-2">
      <div className="rounded-2xl hairline bg-surface-alt px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-[13px] text-ink-soft">
          <span className="text-[12px] uppercase tracking-[0.2em] text-ink-faint">
            Every member, every time
          </span>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {items.map((i) => (
              <li key={i.label} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="text-primary">{i.shape}</span>
                {i.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
