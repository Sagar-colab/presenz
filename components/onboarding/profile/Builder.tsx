"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { emptyDraft, type ProfileDraft } from "./types";
import { Step1Basics, isStep1Valid } from "./Step1Basics";
import { Step2Intro, isStep2Valid } from "./Step2Intro";
import { Step3Prompts, isStep3Valid } from "./Step3Prompts";
import { Step4Photos, isStep4Valid } from "./Step4Photos";
import { Step5Interests, isStep5Valid } from "./Step5Interests";

const TOTAL = 5;
const stepLabels = [
  "The basics",
  "Your intro",
  "Pick four prompts",
  "Your photos",
  "What you're into",
];

export function ProfileBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<ProfileDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const valid = useMemo(() => {
    switch (step) {
      case 1: return isStep1Valid(draft);
      case 2: return isStep2Valid(draft);
      case 3: return isStep3Valid(draft);
      case 4: return isStep4Valid(draft);
      case 5: return isStep5Valid(draft);
      default: return false;
    }
  }, [step, draft]);

  async function finish() {
    setError(null);
    setSubmitting(true);
    try {
      const r = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          age: Number(draft.age),
          city: draft.city.trim(),
          gender: draft.gender,
          lookingFor: draft.lookingFor,
          intro: draft.intro.trim(),
          prompts: draft.selectedPrompts.map((key) => ({
            key,
            answer: (draft.promptAnswers[key] ?? "").trim(),
          })),
          photos: draft.photos,
          interests: draft.interests,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError("We couldn't save your profile. Check each step.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (step < TOTAL) setStep(step + 1);
    else finish();
  }
  function back() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-surface-line bg-white">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Présenz home"><Logo /></Link>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-[13px] text-ink-muted hover:text-ink"
          >
            Save & exit
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10 md:py-14">
        <ProgressBar
          step={step}
          total={TOTAL}
          label={`${stepLabels[step - 1]} · Step ${step} of ${TOTAL}`}
          className="mb-10"
        />
        <div className="fade-up" key={step}>
          {step === 1 && <Step1Basics draft={draft} set={set} />}
          {step === 2 && <Step2Intro draft={draft} set={set} />}
          {step === 3 && <Step3Prompts draft={draft} set={set} />}
          {step === 4 && <Step4Photos draft={draft} set={set} />}
          {step === 5 && <Step5Interests draft={draft} set={set} />}
        </div>

        {error && <p className="mt-6 text-[13.5px] text-danger">{error}</p>}

        <div className="mt-10 flex items-center justify-between border-t border-surface-line pt-6">
          <Button variant="ghost" onClick={back} disabled={step === 1 || submitting}>
            ← Back
          </Button>
          <Button onClick={next} disabled={!valid || submitting} loading={submitting}>
            {step < TOTAL ? "Continue" : "Finish profile"}
          </Button>
        </div>
      </main>
    </div>
  );
}
