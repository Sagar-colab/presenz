import Link from "next/link";

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-2xl bg-ink p-10 md:p-14 text-white">
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
            className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-[15px] font-medium text-ink hover:bg-surface-alt"
          >
            Request an invite
          </Link>
        </div>
      </div>
    </section>
  );
}
