const steps = [
  {
    n: "01",
    title: "Verify yourself",
    body: "Phone number, Aadhaar, and a quick face scan. Three minutes. Once.",
  },
  {
    n: "02",
    title: "Build a real profile",
    body: "A short intro, four prompts, a few photos. Written in your own voice.",
  },
  {
    n: "03",
    title: "One match a day",
    body: "We choose carefully. You'll see one person, with one full day to decide.",
  },
  {
    n: "04",
    title: "Three messages, then meet",
    body: "Pick a venue and time. Message just enough to know. Then meet in person.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-[12.5px] uppercase tracking-[0.22em] text-ink-faint">How it works</p>
        <h2 className="mt-3 text-[32px] tracking-tightish text-ink md:text-[40px]">
          Built for people who'd rather meet than message.
        </h2>
        <p className="mt-4 max-w-prose text-[16px] leading-relaxed text-ink-soft">
          Presenz is shaped by a single belief: chemistry happens in person. Everything we do is in
          service of getting you to a good first date.
        </p>
      </div>
      <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-surface-line hairline md:grid-cols-2">
        {steps.map((s) => (
          <li key={s.n} className="bg-white p-7 md:p-8">
            <div className="flex items-baseline gap-3">
              <span className="text-[12.5px] tabular-nums tracking-[0.18em] text-primary-700">
                {s.n}
              </span>
              <h3 className="text-[18px] font-semibold tracking-tightish text-ink">{s.title}</h3>
            </div>
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
