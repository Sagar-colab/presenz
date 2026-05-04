import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-28 md:pb-28">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-[12.5px] uppercase tracking-[0.22em] text-ink-faint">
            Invitation-only · India
          </p>
          <h1 className="mt-5 text-[44px] leading-[1.04] tracking-tightish text-ink md:text-[64px]">
            Meet in person.
            <br />
            <span className="text-primary">Or not at all.</span>
          </h1>
          <p className="mt-6 max-w-prose text-[16.5px] leading-relaxed text-ink-soft md:text-[17.5px]">
            Présenz matches you with one real person a day. No endless swiping. No ghosting. Just a
            real date.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-[15px] font-medium text-white hover:bg-primary-600"
            >
              Request an invite
            </Link>
            <Link
              href="#how"
              className="inline-flex h-12 items-center rounded-xl bg-white px-5 text-[15px] font-medium text-ink hairline hover:bg-surface-alt"
            >
              How it works
            </Link>
          </div>
          <p className="mt-5 text-[13px] text-ink-faint">
            Verified by phone, Aadhaar, and a live face scan. We take care of who's real so you can
            take care of who's right.
          </p>
        </div>

        <div className="md:col-span-5">
          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="rounded-2xl bg-white hairline p-6 md:p-7">
        <div className="flex items-center justify-between">
          <span className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
            Today's match
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F4ED] px-2.5 py-1 text-[11.5px] font-medium text-success">
            <span aria-hidden>✓</span> Verified
          </span>
        </div>
        <div className="mt-5 aspect-[4/5] w-full rounded-xl bg-gradient-to-b from-[#EDEAF7] to-[#DDD6F1] hairline" />
        <div className="mt-5">
          <h3 className="text-[19px] font-semibold tracking-tightish text-ink">Anaïs, 29</h3>
          <p className="text-[13.5px] text-ink-muted">Bengaluru · Architect</p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
            "I'll always make time for a slow Sunday lunch and a long, unhurried walk after."
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-surface-line pt-4 text-[12.5px] text-ink-muted">
          <span>3 messages remaining</span>
          <span>Expires in 22h</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-primary-50 -z-10" aria-hidden />
    </div>
  );
}
