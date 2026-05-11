import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { PlanCard } from "@/components/PlanCard";
import { PLAN_META } from "@/lib/plans";

export const metadata = { title: "Pricing — Presenz" };

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is Presenz free?",
    a: "The Free plan gives you one verified match per day, forever. Premium tiers unlock more matches and concierge features.",
  },
  {
    q: "How does the matching work?",
    a: "We hand-curate matches based on intent, city, and compatibility — not endless swiping. Each match is verified (Aadhaar + face) before they appear in your feed.",
  },
  {
    q: "What is Concierge?",
    a: "A real human matchmaker who learns what you actually want, hand-picks introductions, and plans the date for you. White-glove from first message to coffee shop.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account and you'll keep premium features until the end of the current billing period — no refunds, no surprises.",
  },
  {
    q: "Do you operate outside Bengaluru?",
    a: "We're starting in Bengaluru. Other Indian cities open over the coming quarters — join the waitlist to be first.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Nav />
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-8 md:pt-20">
        <p className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">Pricing</p>
        <h1 className="mt-3 text-[36px] font-semibold tracking-tightish text-ink md:text-[48px]">
          Pay for matches that show up.
        </h1>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-ink-muted">
          No swiping subscriptions. No engagement traps. Three plans, one promise — every match is a
          verified person who meant to be on Presenz today.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          <PlanCard
            tier="FREE"
            footer={
              <Link
                href="/waitlist"
                className="block w-full rounded-md border border-surface-line px-4 py-2.5 text-center text-[14px] font-medium text-ink hover:bg-surface-alt"
              >
                Get invited
              </Link>
            }
          />
          <PlanCard
            tier="PLUS"
            highlighted
            footer={
              <Link
                href="/waitlist"
                className="block w-full rounded-md bg-primary px-4 py-2.5 text-center text-[14px] font-medium text-white hover:bg-primary-600"
              >
                Get invited
              </Link>
            }
          />
          <PlanCard
            tier="CONCIERGE"
            footer={
              <Link
                href="/waitlist"
                className="block w-full rounded-md border border-surface-line px-4 py-2.5 text-center text-[14px] font-medium text-ink hover:bg-surface-alt"
              >
                Get invited
              </Link>
            }
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-6 text-[14px] uppercase tracking-[0.14em] text-ink-faint">
          Compare features
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-surface-line">
          <table className="w-full text-[14px]">
            <thead className="bg-surface-alt text-left text-[12px] uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-4 py-3">&nbsp;</th>
                <th className="px-4 py-3">{PLAN_META.FREE.label}</th>
                <th className="px-4 py-3">{PLAN_META.PLUS.label}</th>
                <th className="px-4 py-3">{PLAN_META.CONCIERGE.label}</th>
              </tr>
            </thead>
            <tbody className="text-ink-soft">
              {[
                ["Matches per day", String(PLAN_META.FREE.dailyMatchCap), String(PLAN_META.PLUS.dailyMatchCap), String(PLAN_META.CONCIERGE.dailyMatchCap)],
                ["Verified profiles", "✓", "✓", "✓"],
                ["See who viewed you", "—", "✓", "✓"],
                ["Priority curation", "—", "✓", "✓"],
                ["Venue suggestions", "—", "✓", "✓"],
                ["Human matchmaker", "—", "—", "✓"],
                ["Date planning", "—", "—", "✓"],
                ["Exclusive events", "—", "—", "✓"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-surface-line">
                  {row.map((cell, i) => (
                    <td key={i} className={i === 0 ? "px-4 py-3 text-ink" : "px-4 py-3 text-ink-muted"}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-6 text-[14px] uppercase tracking-[0.14em] text-ink-faint">Questions</h2>
        <dl className="space-y-6">
          {FAQ.map(({ q, a }) => (
            <div key={q}>
              <dt className="text-[16px] font-medium text-ink">{q}</dt>
              <dd className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Footer />
    </main>
  );
}
