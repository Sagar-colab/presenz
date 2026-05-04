"use client";

import { PROMPTS, type PromptKey } from "@/lib/prompts";
import { Textarea } from "@/components/ui/Textarea";
import { Chip } from "@/components/ui/Chip";
import type { ProfileDraft } from "./types";

const TARGET = 4;
const MAX_ANSWER = 280;

export function Step3Prompts({
  draft,
  set,
}: {
  draft: ProfileDraft;
  set: (patch: Partial<ProfileDraft>) => void;
}) {
  const selected = draft.selectedPrompts;
  const remaining = TARGET - selected.length;

  function toggle(key: PromptKey) {
    if (selected.includes(key)) {
      const next = selected.filter((k) => k !== key);
      const { [key]: _drop, ...rest } = draft.promptAnswers;
      set({ selectedPrompts: next, promptAnswers: rest });
    } else if (selected.length < TARGET) {
      set({ selectedPrompts: [...selected, key] });
    }
  }

  function setAnswer(key: PromptKey, value: string) {
    set({ promptAnswers: { ...draft.promptAnswers, [key]: value } });
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-[28px] tracking-tightish text-ink">Pick four prompts</h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Choose four that feel like you. Answer them like you'd tell a friend over coffee.
          {remaining > 0 ? (
            <> <span className="text-ink-soft">{remaining} more to choose.</span></>
          ) : (
            <> <span className="text-ink-soft">All four chosen.</span></>
          )}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <Chip
            key={p.key}
            selected={selected.includes(p.key)}
            disabled={!selected.includes(p.key) && selected.length >= TARGET}
            onClick={() => toggle(p.key)}
          >
            {p.label}
          </Chip>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="space-y-5 border-t border-surface-line pt-6">
          {selected.map((key) => {
            const prompt = PROMPTS.find((p) => p.key === key)!;
            return (
              <Textarea
                key={key}
                label={prompt.label}
                rows={3}
                maxLength={MAX_ANSWER}
                showCount
                placeholder="Your answer…"
                value={draft.promptAnswers[key] ?? ""}
                onChange={(e) => setAnswer(key, e.target.value)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export function isStep3Valid(d: ProfileDraft) {
  if (d.selectedPrompts.length !== TARGET) return false;
  return d.selectedPrompts.every((k) => (d.promptAnswers[k] ?? "").trim().length >= 1);
}
