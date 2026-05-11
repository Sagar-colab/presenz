"use client";

import { useState } from "react";

const REASONS = [
  { value: "fake_profile", label: "Fake profile" },
  { value: "inappropriate_photos", label: "Inappropriate photos" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
] as const;

export function ReportProfileModal({ reportedUser }: { reportedUser: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("fake_profile");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/flag/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedUser, reason, detail: detail.trim() || undefined }),
      });
      const json = await res.json();
      if (!json.ok) {
        alert(`Could not submit report: ${json.reason ?? res.status}`);
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[12.5px] text-ink-faint hover:text-ink underline underline-offset-2"
      >
        Report this profile
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
            {done ? (
              <>
                <h2 className="text-[18px] font-semibold text-ink">Report received</h2>
                <p className="mt-2 text-[14px] text-ink-muted">
                  Our team will review this profile. Thank you for keeping Presenz safe.
                </p>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => {
                      setOpen(false);
                      setDone(false);
                      setDetail("");
                    }}
                    className="rounded-md bg-primary px-4 py-2 text-[14px] text-white"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[18px] font-semibold text-ink">Report this profile</h2>
                <p className="mt-1 text-[13px] text-ink-muted">Reports are confidential.</p>
                <div className="mt-4 space-y-2">
                  {REASONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-2 text-[14px] text-ink">
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Anything you want us to know (optional)"
                  maxLength={500}
                  rows={3}
                  className="mt-3 w-full rounded-md border border-surface-line bg-surface px-3 py-2 text-[14px] text-ink"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-surface-line px-4 py-2 text-[14px] text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={busy}
                    className="rounded-md bg-red-600 px-4 py-2 text-[14px] text-white disabled:opacity-40"
                  >
                    {busy ? "Sending…" : "Submit report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
