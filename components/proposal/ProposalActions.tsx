"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function ProposalActions({ proposalId, matchId }: { proposalId: string; matchId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "accept" | "pass" | "counter">(null);
  const [error, setError] = useState<string | null>(null);
  const [counterOpen, setCounterOpen] = useState(false);

  async function send(path: string, body?: unknown) {
    setError(null);
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const j = await r.json();
    if (!r.ok || !j.ok) {
      setError(prettyReason(j.reason ?? "unknown"));
      return null;
    }
    return j;
  }

  async function accept() {
    setBusy("accept");
    try {
      const j = await send(`/api/proposal/${proposalId}/accept`, { slot: 1 });
      if (j) router.push(`/chat/${matchId}`);
    } finally {
      setBusy(null);
    }
  }

  async function pass() {
    if (!confirm("Pass on this proposal? The match will close.")) return;
    setBusy("pass");
    try {
      const j = await send(`/api/proposal/${proposalId}/pass`);
      if (j) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <div className="grid gap-3">
        <Button
          size="lg"
          onClick={accept}
          loading={busy === "accept"}
          disabled={busy !== null}
          className="w-full bg-success hover:opacity-95"
        >
          Accept
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setCounterOpen(true)}
          disabled={busy !== null}
          className="w-full"
        >
          Suggest another time
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={pass}
          loading={busy === "pass"}
          disabled={busy !== null}
          className="w-full text-ink-muted"
        >
          Pass
        </Button>
      </div>
      {error && <p className="text-[13px] text-danger">{error}</p>}

      <CounterSheet
        open={counterOpen}
        onClose={() => setCounterOpen(false)}
        proposalId={proposalId}
      />
    </Card>
  );
}

function CounterSheet({
  open,
  onClose,
  proposalId,
}: {
  open: boolean;
  onClose: () => void;
  proposalId: string;
}) {
  const router = useRouter();
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minDateTime = useMemo(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  const valid = slot1.length > 0 && slot2.length > 0 && slot1 !== slot2;

  async function submit() {
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`/api/proposal/${proposalId}/counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeSlot1: new Date(slot1).toISOString(),
          timeSlot2: new Date(slot2).toISOString(),
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(prettyReason(j.reason ?? "unknown"));
        return;
      }
      onClose();
      router.push(`/proposal/${j.proposalId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => !submitting && onClose()}
      title="Suggest another time"
      description="Same date type and venue — just two new time slots."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Time slot 1"
            type="datetime-local"
            value={slot1}
            min={minDateTime}
            onChange={(e) => setSlot1(e.target.value)}
          />
          <Input
            label="Time slot 2"
            type="datetime-local"
            value={slot2}
            min={minDateTime}
            onChange={(e) => setSlot2(e.target.value)}
          />
        </div>
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid} loading={submitting}>
            Send counter
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

function prettyReason(r: string) {
  const map: Record<string, string> = {
    cannot_accept_own: "You can't accept your own proposal.",
    cannot_counter_own: "You can't counter your own proposal.",
    not_pending: "This proposal is no longer open.",
    match_closed: "The match has closed.",
    slot_in_past: "Pick a time in the future.",
    slots_identical: "Slot 1 and slot 2 should be different.",
    rate_limited: "Slow down a moment, then try again.",
  };
  return map[r] ?? "Something went wrong. Try again.";
}
