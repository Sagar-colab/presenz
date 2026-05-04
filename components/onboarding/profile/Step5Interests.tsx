"use client";

import { INTERESTS } from "@/lib/prompts";
import { Chip } from "@/components/ui/Chip";
import type { ProfileDraft } from "./types";

const MAX = 6;

export function Step5Interests({
  draft,
  set,
}: {
  draft: ProfileDraft;
  set: (patch: Partial<ProfileDraft>) => void;
}) {
  const selected = draft.interests;

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      set({ interests: selected.filter((t) => t !== tag) });
    } else if (selected.length < MAX) {
      set({ interests: [...selected, tag] });
    }
  }

  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-[28px] tracking-tightish text-ink">What you're into</h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Pick up to six. We use these gently — for matching context, not for keyword ranking.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((tag) => (
          <Chip
            key={tag}
            selected={selected.includes(tag)}
            disabled={!selected.includes(tag) && selected.length >= MAX}
            onClick={() => toggle(tag)}
          >
            {tag}
          </Chip>
        ))}
      </div>

      <p className="text-[12.5px] text-ink-faint tabular-nums">
        {selected.length} / {MAX}
      </p>
    </section>
  );
}

export function isStep5Valid(d: ProfileDraft) {
  return d.interests.length >= 1 && d.interests.length <= MAX;
}
