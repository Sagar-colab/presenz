"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FlagRowActions({ flagId, subjectId }: { flagId: string; subjectId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function dismiss() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/flags/${flagId}/dismiss`, { method: "POST" });
      const json = await res.json();
      if (!json.ok) alert(`Failed: ${json.reason ?? res.status}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function warnSubject() {
    if (busy) return;
    const reason = prompt("Reason for warning?");
    if (!reason) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${subjectId}/warn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, flagId }),
      });
      const json = await res.json();
      if (!json.ok) alert(`Failed: ${json.reason ?? res.status}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function banSubject() {
    if (busy) return;
    if (!confirm("Ban this user?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${subjectId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagId }),
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
        onClick={dismiss}
        disabled={busy}
        className="rounded-md border border-surface-line px-2.5 py-1 text-[12px] text-ink hover:bg-surface-alt disabled:opacity-40"
      >
        Dismiss
      </button>
      <button
        onClick={warnSubject}
        disabled={busy}
        className="rounded-md border border-surface-line px-2.5 py-1 text-[12px] text-ink hover:bg-surface-alt disabled:opacity-40"
      >
        Warn
      </button>
      <button
        onClick={banSubject}
        disabled={busy}
        className="rounded-md bg-red-600 px-2.5 py-1 text-[12px] text-white hover:bg-red-700 disabled:opacity-40"
      >
        Ban
      </button>
    </div>
  );
}
