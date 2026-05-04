import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

const steps = [
  {
    n: "01",
    title: "Verify yourself",
    body: "Phone number, Aadhaar, and a quick face scan. Three minutes. Once.",
    iconBg: "bg-primary-50 text-primary-700",
  },
  {
    n: "02",
    title: "Build a real profile",
    body: "A short intro, four prompts, a few photos. Written in your own voice.",
    iconBg: "bg-[#E8F4ED] text-success",
  },
  {
    n: "03",
    title: "One match a day",
    body: "We choose carefully. You'll see one person, with one full day to decide.",
    iconBg: "bg-[#FBF1E0] text-warning",
  },
  {
    n: "04",
    title: "Three messages, then meet",
    body: "Pick a venue and time. Message just enough to know. Then meet in person.",
    iconBg: "bg-[#FDE8EC] text-[#B3261E]",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-[12.5px] uppercase tracking-[0.22em] text-ink-faint">How it works</p>
          <h2 className="mt-3 text-[32px] tracking-tightish text-ink md:text-[40px]">
            Built for people who'd rather meet than message.
          </h2>
          <p className="mt-4 max-w-prose text-[16px] leading-relaxed text-ink-soft">
            Presenz is shaped by a single belief: chemistry happens in person. Everything we do is
            in service of getting you to a good first date.
          </p>
        </div>
      </Reveal>

      <ol className="mt-14 max-w-3xl">
        {steps.map((s, i) => {
          const isLast = i === steps.length - 1;
          return (
            <Reveal key={s.n} delay={i * 140}>
              <li className={cn("flex gap-5", !isLast && "pb-8")}>
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold tracking-[0.06em] tabular-nums text-[13px]",
                      s.iconBg,
                    )}
                  >
                    {s.n}
                  </div>
                  {!isLast && (
                    <div
                      aria-hidden
                      className="mt-1 w-0 flex-1 border-l-2 border-dotted border-surface-line"
                    />
                  )}
                </div>
                <div className="pt-1.5 pb-1">
                  <h3 className="text-[19px] font-semibold tracking-tightish text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-prose text-[15.5px] leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
