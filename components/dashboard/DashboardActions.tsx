"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProposeSheet } from "./ProposeSheet";

export function DashboardActions({
  matchId,
  otherName,
}: {
  matchId: string;
  otherName: string;
}) {
  const router = useRouter();
  const [proposing, setProposing] = useState(false);
  const [passing, setPassing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pass() {
    if (!confirm(`Pass on ${otherName}? You'll get a fresh match tomorrow.`)) return;
    setPassing(true);
    setError(null);
    try {
      const r = await fetch(`/api/match/${matchId}/pass`, { method: "POST" });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError("Couldn't process that. Try again.");
        return;
      }
      router.refresh();
    } finally {
      setPassing(false);
    }
  }

  return (
    <>
      <div className="mt-8 flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
        <Button
          variant="ghost"
          size="md"
          onClick={pass}
          loading={passing}
          disabled={passing || proposing}
          className="text-ink-muted"
        >
          Pass for today
        </Button>
        <Button size="lg" onClick={() => setProposing(true)} disabled={passing}>
          Propose a date
        </Button>
      </div>
      {error && <p className="mt-3 text-[13px] text-danger">{error}</p>}

      <ProposeSheet
        open={proposing}
        onClose={() => setProposing(false)}
        matchId={matchId}
        otherName={otherName}
      />
    </>
  );
}
