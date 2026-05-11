import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata = { title: "Waitlist — Presenz" };

export default function WaitlistPage() {
  return (
    <main className="min-h-screen bg-surface px-6 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-[28px] font-semibold tracking-tightish text-ink">
          Presenz is invite-only.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          We're starting small in Bengaluru — every member is hand-curated and verified. Drop your
          details and we'll reach out when we open the next batch.
        </p>
        <div className="mt-8">
          <WaitlistForm />
        </div>
      </div>
    </main>
  );
}
