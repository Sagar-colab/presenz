import { Counter } from "./Counter";
import { Reveal } from "./Reveal";

const stats = [
  { value: 2400, suffix: "+", label: "Verified users" },
  { value: 100, suffix: "%", label: "Real identities" },
  { value: 0, suffix: "", label: "Fake profiles" },
] as const;

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-4 pt-2">
      <Reveal>
        <div className="rounded-2xl hairline bg-white px-6 py-10 md:px-10 md:py-14">
          <p className="text-center text-[12px] uppercase tracking-[0.22em] text-ink-faint">
            Why people trust Presenz
          </p>
          <div className="mt-9 grid gap-10 text-center md:grid-cols-3">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 120}>
                <div>
                  <p className="text-[44px] font-semibold leading-none tracking-tightish text-ink md:text-[56px]">
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-3 text-[13.5px] uppercase tracking-[0.16em] text-ink-muted">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
