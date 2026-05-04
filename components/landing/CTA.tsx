import Link from "next/link";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-ink p-10 md:p-14 text-white">
          {/* Subtle drifting accent inside the dark card */}
          <div
            aria-hidden
            className="drift-a pointer-events-none absolute -top-24 right-[-10%] h-[360px] w-[360px] rounded-full blur-3xl"
            style={{ background: "rgba(83, 74, 183, 0.45)" }}
          />
          <div className="relative">
            <p className="text-[12.5px] uppercase tracking-[0.22em] text-white/60">
              Presenz · Invitation only
            </p>
            <h2 className="mt-4 max-w-3xl text-[32px] tracking-tightish md:text-[40px]">
              Less app. More date.
            </h2>
            <p className="mt-3 max-w-prose text-[15.5px] leading-relaxed text-white/75">
              We open membership in small batches by city. Add yourself to the list — we'll let you
              know the moment yours is open.
            </p>
            <div className="mt-7">
              <Link
                href="/onboarding"
                className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-[15px] font-medium text-ink transition-all duration-200 hover:bg-surface-alt active:scale-[0.97]"
              >
                Request an invite
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
