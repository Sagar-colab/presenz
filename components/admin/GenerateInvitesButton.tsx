"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateInvitesButton() {
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(10);
  const router = useRouter();

  async function generate() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/invites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const j = await res.json();
      if (!j.ok) alert(`Could not generate: ${j.reason ?? res.status}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={100}
        value={count}
        onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
        className="w-20 rounded-md border border-surface-line bg-surface px-2 py-1.5 text-[13px] text-ink"
      />
      <button
        onClick={generate}
        disabled={busy}
        className="rounded-md bg-primary px-3 py-1.5 text-[13px] text-white disabled:opacity-50"
      >
        {busy ? "Generating…" : `Generate ${count}`}
      </button>
    </div>
  );
}
