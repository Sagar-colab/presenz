"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RequestAnotherMatchButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ reason: string; cap?: number } | null>(null);
  const router = useRouter();

  async function go() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/match/request-another", { method: "POST" });
      const j = await res.json();
      if (j.ok) {
        router.refresh();
        return;
      }
      setErr({ reason: j.reason, cap: j.cap });
    } finally {
      setBusy(false);
    }
  }

  if (err?.reason === "cap_reached") {
    return (
      <div className="mt-4 rounded-xl border border-surface-line bg-surface-alt p-4 text-center">
        <p className="text-[13.5px] text-ink-soft">
          You've used your {err.cap} {err.cap === 1 ? "match" : "matches"} for today.
        </p>
        <Link
          href="/settings/subscription"
          className="mt-2 inline-block text-[13px] text-primary hover:underline"
        >
          Unlock more with Presenz+ →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 text-center">
      <button
        onClick={go}
        disabled={busy}
        className="text-[13px] text-ink-muted underline-offset-2 hover:underline hover:text-ink disabled:opacity-40"
      >
        {busy ? "Finding…" : "Find me another match"}
      </button>
      {err && err.reason === "no_candidate" && (
        <p className="mt-2 text-[12.5px] text-ink-faint">
          No more matches available right now. Check back tomorrow.
        </p>
      )}
      {err && err.reason !== "no_candidate" && err.reason !== "cap_reached" && (
        <p className="mt-2 text-[12.5px] text-red-600">Something went wrong: {err.reason}</p>
      )}
    </div>
  );
}
