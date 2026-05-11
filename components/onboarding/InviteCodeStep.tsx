"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function InviteCodeStep({ onValid }: { onValid: (code: string) => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/onboarding/check-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const j = await res.json();
      if (j.ok) {
        onValid(code.trim().toUpperCase());
        return;
      }
      if (j.reason === "invalid") {
        setErr("That invite code doesn't look right. Check it and try again.");
        // Don't auto-redirect — let them try again or click the waitlist link.
      } else if (j.reason === "already_used") {
        setErr("This invite has already been used.");
      } else if (j.reason === "rate_limited") {
        setErr("Too many attempts. Wait a minute and try again.");
      } else {
        setErr("Something went wrong. Try again.");
      }
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-[22px] font-semibold tracking-tightish text-ink">
          Enter your invite code
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Presenz is currently invite-only in Bengaluru. If you have a code, enter it below.
        </p>
      </div>
      <input
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="ABCD1234"
        maxLength={16}
        className="w-full rounded-md border border-surface-line bg-surface px-3 py-3 text-center font-mono text-[18px] tracking-[0.15em] text-ink"
      />
      {err && <p className="text-[13px] text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={busy || code.length < 4}
        className="w-full rounded-md bg-primary px-4 py-3 text-[15px] font-medium text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {busy ? "Checking…" : "Continue"}
      </button>
      <p className="text-center text-[13px] text-ink-muted">
        Don't have a code?{" "}
        <Link href="/waitlist" className="text-primary hover:underline">
          Join the waitlist
        </Link>
      </p>
    </form>
  );
}
