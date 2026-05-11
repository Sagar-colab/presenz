"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, city, reason: reason.trim() || undefined }),
      });
      const j = await res.json();
      if (!j.ok) {
        setErr(j.reason === "invalid_phone" ? "Please enter a valid Indian mobile number." : "Could not save. Try again.");
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-surface-line bg-surface-alt p-6 text-center">
        <h2 className="text-[20px] font-semibold text-ink">You're on the list.</h2>
        <p className="mt-2 text-[14px] text-ink-muted">
          We'll text you when an invite opens up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Your name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full rounded-md border border-surface-line bg-surface px-3 py-2.5 text-[15px] text-ink"
        />
      </Field>
      <Field label="Phone (with +91)">
        <input
          required
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98XXXXXXXX"
          className="w-full rounded-md border border-surface-line bg-surface px-3 py-2.5 text-[15px] text-ink"
        />
      </Field>
      <Field label="City">
        <input
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={80}
          className="w-full rounded-md border border-surface-line bg-surface px-3 py-2.5 text-[15px] text-ink"
        />
      </Field>
      <Field label="Why you want to join (optional)">
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          className="w-full rounded-md border border-surface-line bg-surface px-3 py-2.5 text-[15px] text-ink"
        />
      </Field>
      {err && <p className="text-[13px] text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-primary px-4 py-3 text-[15px] font-medium text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Request an invite"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
