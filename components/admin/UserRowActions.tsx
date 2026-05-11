"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "ACTIVE" | "WARNED" | "SUSPENDED" | "BANNED";

export function UserRowActions({ userId, status }: { userId: string; status: Status }) {
  const isBanned = status === "BANNED" || status === "SUSPENDED";
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function call(action: "warn" | "ban" | "unban") {
    if (busy) return;
    const reason = action === "warn" ? prompt("Reason for warning?") : null;
    if (action === "warn" && !reason) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "warn" ? { reason } : {}),
      });
      const json = await res.json();
      if (!json.ok) alert(`Failed: ${json.reason ?? res.status}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => call("warn")}
        disabled={busy || isBanned}
        className="rounded-md border border-surface-line px-2.5 py-1 text-[12px] text-ink hover:bg-surface-alt disabled:opacity-40"
      >
        Warn
      </button>
      {isBanned ? (
        <button
          onClick={() => call("unban")}
          disabled={busy}
          className="rounded-md border border-surface-line bg-surface-alt px-2.5 py-1 text-[12px] text-ink hover:bg-surface disabled:opacity-40"
        >
          Unban
        </button>
      ) : (
        <button
          onClick={() => call("ban")}
          disabled={busy}
          className="rounded-md bg-red-600 px-2.5 py-1 text-[12px] text-white hover:bg-red-700 disabled:opacity-40"
        >
          Ban
        </button>
      )}
    </div>
  );
}
