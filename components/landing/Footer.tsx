import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-16 pt-24">
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
            <Link href="/about" className="hover:text-ink">About</Link>
            <Link href="/safety" className="hover:text-ink">Safety</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/contact" className="hover:text-ink">Contact</Link>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-surface-line pt-5 text-[12.5px] text-ink-faint">
          <span>© {new Date().getFullYear()} Presenz</span>
          <span>Made in India · Verified humans only</span>
        </div>
      </div>
    </footer>
  );
}
