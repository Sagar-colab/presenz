"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type Status = "idle" | "pending" | "verified" | "error";

export function AadhaarStep() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [last4, setLast4] = useState<string | null>(null);

  const formatted = useMemo(() => formatAadhaarLive(raw), [raw]);
  const masked = useMemo(() => maskLive(raw), [raw]);

  const isComplete = raw.replace(/\D/g, "").length === 12;

  async function submit() {
    setStatus("pending");
    setError(null);
    try {
      const r = await fetch("/api/verify/aadhaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: raw.replace(/\D/g, "") }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setStatus("error");
        setError(prettyReason(j.reason ?? "unknown"));
        return;
      }
      setLast4(j.last4);
      setStatus("verified");
    } catch {
      setStatus("error");
      setError("Network error. Try again.");
    }
  }

  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-[28px] tracking-tightish text-ink">Verify your Aadhaar</h1>
          {status === "verified" ? (
            <Badge tone="success" shape="✓">Verified</Badge>
          ) : status === "pending" ? (
            <Badge tone="warning" shape="○">Verifying…</Badge>
          ) : null}
        </div>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          We use Aadhaar through DigiLocker to confirm you're a real person. Your full number is
          never stored — we keep only the last four digits.
        </p>
      </header>

      <Input
        label="Aadhaar number"
        inputMode="numeric"
        autoComplete="off"
        placeholder="XXXX XXXX XXXX"
        value={status === "verified" && last4 ? `XXXX-XXXX-${last4}` : formatted}
        onChange={(e) => setRaw(e.target.value)}
        maxLength={14}
        disabled={status === "verified" || status === "pending"}
        error={error ?? undefined}
        hint={status === "verified" ? `Stored as XXXX-XXXX-${last4}` : `Shown as: ${masked}`}
        className="tracking-[0.2em]"
      />

      <div className="rounded-xl bg-surface-alt hairline p-4 text-[13px] leading-relaxed text-ink-muted">
        <strong className="text-ink-soft">Why we ask:</strong> verified identity is the foundation
        of trust on Presenz. Every member completes this step. Your Aadhaar is sent over a TLS
        connection to UIDAI / DigiLocker and is never stored on our servers.
      </div>

      {status === "verified" ? (
        <Button size="lg" className="w-full" onClick={() => router.push("/verify/face")}>
          Continue to face scan
        </Button>
      ) : (
        <Button
          size="lg"
          className="w-full"
          loading={status === "pending"}
          disabled={!isComplete}
          onClick={submit}
        >
          Verify Aadhaar
        </Button>
      )}
    </section>
  );
}

function formatAadhaarLive(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function maskLive(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 12);
  if (digits.length === 0) return "XXXX-XXXX-XXXX";
  if (digits.length < 12) return `XXXX-XXXX-${digits.padStart(4, "X").slice(-4)}`;
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

function prettyReason(r: string) {
  const map: Record<string, string> = {
    invalid_format: "Aadhaar must be 12 digits.",
    rate_limited: "Too many attempts. Wait a moment.",
    unauthorized: "Your session expired. Sign in again.",
  };
  return map[r] ?? "We couldn't verify that. Try again.";
}
