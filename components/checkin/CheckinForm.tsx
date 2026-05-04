"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Rating = 1 | 2 | 3;

const options: { value: Rating; label: string; tone: string }[] = [
  { value: 3, label: "It was great", tone: "bg-[#E8F4ED] text-success hover:bg-[#DBEEE2]" },
  { value: 2, label: "It was okay", tone: "bg-[#FBF1E0] text-warning hover:bg-[#F5E7CC]" },
  { value: 1, label: "We didn't meet", tone: "bg-surface-alt text-ink-soft hover:bg-white" },
];

export function CheckinForm({ matchId, otherName }: { matchId: string; otherName: string }) {
  const [submitting, setSubmitting] = useState<Rating | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(rating: Rating) {
    setSubmitting(rating);
    setError(null);
    try {
      const r = await fetch(`/api/checkin/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        if (j.reason === "already_checked_in") {
          setDone(true);
          return;
        }
        setError("Couldn't save that. Try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(null);
    }
  }

  if (done) {
    return (
      <Card className="w-full text-center py-12 fade-up">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F4ED] text-success text-2xl">
          ✓
        </div>
        <h1 className="text-[22px] font-semibold tracking-tightish text-ink">Thank you.</h1>
        <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-muted">
          We'll use this to improve your matches.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full p-8 md:p-10 fade-up">
      <p className="text-[12px] uppercase tracking-[0.2em] text-ink-faint">Quiet check-in</p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-tightish text-ink md:text-[30px]">
        How did it go with {otherName}?
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
        Just one tap. We won't tell {otherName} what you chose — this is for us, to make your next
        match better.
      </p>

      <div className="mt-7 flex flex-col gap-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => submit(o.value)}
            disabled={submitting !== null}
            className={cn(
              "flex h-14 items-center justify-between rounded-xl px-5 text-[15.5px] font-medium hairline transition-all duration-150 active:scale-[0.98]",
              o.tone,
              submitting !== null && submitting !== o.value && "opacity-60",
            )}
          >
            <span>{o.label}</span>
            {submitting === o.value ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <span aria-hidden className="text-current/60">→</span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-[13px] text-danger">{error}</p>}
    </Card>
  );
}
