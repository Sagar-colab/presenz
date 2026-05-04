"use client";

import { Textarea } from "@/components/ui/Textarea";
import type { ProfileDraft } from "./types";

export function Step2Intro({
  draft,
  set,
}: {
  draft: ProfileDraft;
  set: (patch: Partial<ProfileDraft>) => void;
}) {
  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-[28px] tracking-tightish text-ink">Your intro</h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          A short paragraph in your own voice. We'd rather have one true sentence than a polished
          paragraph of nothing.
        </p>
      </header>

      <Textarea
        label="About you"
        rows={6}
        maxLength={300}
        showCount
        placeholder="Write in your own voice — who are you off-screen?"
        value={draft.intro}
        onChange={(e) => set({ intro: e.target.value })}
      />
    </section>
  );
}

export function isStep2Valid(d: ProfileDraft) {
  return d.intro.trim().length >= 20 && d.intro.length <= 300;
}
