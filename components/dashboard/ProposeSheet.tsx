"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { DATE_TYPE_OPTIONS, DateTypeIcon } from "@/components/ui/DateTypeIcon";
import { cn } from "@/lib/utils";
import type { DateType } from "@prisma/client";

export function ProposeSheet({
  open,
  onClose,
  matchId,
  otherName,
}: {
  open: boolean;
  onClose: () => void;
  matchId: string;
  otherName: string;
}) {
  const router = useRouter();
  const [dateType, setDateType] = useState<DateType | null>(null);
  const [venue, setVenue] = useState("");
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minDateTime = useMemo(() => {
    // 1 hour from now, formatted for <input type=datetime-local>.
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  const valid =
    dateType !== null &&
    venue.trim().length > 0 &&
    slot1.length > 0 &&
    slot2.length > 0 &&
    slot1 !== slot2 &&
    note.trim().length > 0 &&
    note.length <= 100;

  async function submit() {
    if (!valid || !dateType) return;
    setError(null);
    setSubmitting(true);
    try {
      const r = await fetch("/api/proposal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          dateType,
          venue: venue.trim(),
          timeSlot1: new Date(slot1).toISOString(),
          timeSlot2: new Date(slot2).toISOString(),
          note: note.trim(),
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(prettyReason(j.reason ?? "unknown"));
        return;
      }
      setConfirmed(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    if (submitting) return;
    if (confirmed) {
      onClose();
      router.refresh();
    } else {
      onClose();
    }
  }

  if (confirmed) {
    return (
      <Sheet open={open} onClose={close}>
        <div className="py-2 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F4ED] text-success text-2xl">
            ✓
          </div>
          <h2 className="text-[22px] font-semibold tracking-tightish text-ink">
            Your proposal is out there
          </h2>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">
            We'll let {otherName} know. They have until your match window closes to respond.
          </p>
          <Button size="lg" className="mt-6 w-full" onClick={close}>
            Back to today
          </Button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Propose a date"
      description={`Pick something simple — ${otherName} can suggest another time if needed.`}
    >
      <div className="space-y-7">
        <fieldset>
          <legend className="text-[13px] font-medium text-ink-soft">What kind of date?</legend>
          <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-5">
            {DATE_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDateType(opt.value)}
                aria-pressed={dateType === opt.value}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-4 transition-all duration-150 active:scale-[0.97]",
                  dateType === opt.value
                    ? "bg-primary text-white"
                    : "bg-white text-ink-soft hairline hover:bg-surface-alt",
                )}
              >
                <DateTypeIcon type={opt.value} className="h-6 w-6" />
                <span className="text-[12.5px] font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <Input
          label="Venue"
          placeholder="Suggest a place"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          maxLength={200}
        />

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

        <Textarea
          label="Add a note"
          rows={2}
          maxLength={100}
          showCount
          placeholder="One line. This is your first message."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          hint="Counts as message 1 of 3."
        />

        {error && <p className="text-[13px] text-danger">{error}</p>}

        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Button variant="ghost" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={submit}
            disabled={!valid}
            loading={submitting}
            className="md:min-w-[180px]"
          >
            Send proposal
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

function prettyReason(r: string) {
  const map: Record<string, string> = {
    proposal_already_pending: "There's already a proposal in motion for this match.",
    not_pending: "This match is no longer open.",
    slot_in_past: "Pick a time in the future.",
    slots_identical: "Slot 1 and slot 2 should be different.",
    rate_limited: "Slow down a moment, then try again.",
  };
  return map[r] ?? "Something went wrong. Try again.";
}
