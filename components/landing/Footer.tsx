import Link from "next/link";

const socials = [
  { label: "Instagram", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Email", href: "mailto:hello@presenz.app" },
];

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-16 pt-24">
      {/* Soft purple gradient accent strip */}
      <div
        aria-hidden
        className="mx-auto mb-10 h-[3px] w-full max-w-md rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(83,74,183,0.55) 50%, transparent 100%)",
        }}
      />
      <div className="rounded-2xl hairline bg-white p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] uppercase tracking-[0.18em] text-ink-faint">Presenz</p>
            <p className="mt-2 max-w-prose text-[15.5px] leading-relaxed text-ink-soft">
              We built this for people who want to meet, not message. One match a day. Three
              messages. Then a real date.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-ink-muted">
            <Link href="/about" className="transition-colors hover:text-ink">About</Link>
            <Link href="/safety" className="transition-colors hover:text-ink">Safety</Link>
            <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
            <Link href="/contact" className="transition-colors hover:text-ink">Contact</Link>
          </div>
        </div>

        {/* Socials */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-surface-line pt-6">
          {socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-3.5 py-1.5 text-[12.5px] text-ink-muted hairline transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-ink"
            >
              <span>{s.label}</span>
              <span aria-hidden className="text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-surface-line pt-5 text-[12.5px] text-ink-faint">
          <span>© {new Date().getFullYear()} Presenz</span>
          <span>Made in India · Verified humans only</span>
        </div>
      </div>
    </footer>
  );
}
