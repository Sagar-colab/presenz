"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelSubscriptionButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function cancel() {
    if (busy) return;
    if (!confirm("Cancel your subscription? You'll keep premium until the current period ends.")) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/payments/cancel", { method: "POST" });
      const j = await res.json();
      if (!j.ok) alert(`Could not cancel: ${j.reason ?? res.status}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={cancel}
      disabled={busy}
      className="text-[13px] text-ink-muted underline-offset-2 hover:underline disabled:opacity-40"
    >
      {busy ? "Cancelling…" : "Cancel subscription"}
    </button>
  );
}
