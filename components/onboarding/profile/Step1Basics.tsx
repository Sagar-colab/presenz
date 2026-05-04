"use client";

import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import type { Gender, LookingFor, ProfileDraft } from "./types";

const genders: { value: Gender; label: string }[] = [
  { value: "FEMALE", label: "Woman" },
  { value: "MALE", label: "Man" },
  { value: "NONBINARY", label: "Non-binary" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const lookingFor: { value: LookingFor; label: string }[] = [
  { value: "WOMEN", label: "Women" },
  { value: "MEN", label: "Men" },
  { value: "EVERYONE", label: "Everyone" },
];

export function Step1Basics({
  draft,
  set,
}: {
  draft: ProfileDraft;
  set: (patch: Partial<ProfileDraft>) => void;
}) {
  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-[28px] tracking-tightish text-ink">The basics</h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Just enough to get you set up. You can edit any of this later.
        </p>
      </header>

      <Input
        label="Your name"
        placeholder="The name people call you"
        value={draft.name}
        onChange={(e) => set({ name: e.target.value })}
        maxLength={60}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Age"
          inputMode="numeric"
          placeholder="29"
          value={draft.age}
          onChange={(e) => set({ age: e.target.value.replace(/\D/g, "").slice(0, 2) })}
          maxLength={2}
        />
        <Input
          label="City"
          placeholder="Bengaluru"
          value={draft.city}
          onChange={(e) => set({ city: e.target.value })}
          maxLength={80}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-[13px] font-medium text-ink-soft">I am</legend>
        <div className="flex flex-wrap gap-2">
          {genders.map((g) => (
            <Chip key={g.value} selected={draft.gender === g.value} onClick={() => set({ gender: g.value })}>
              {g.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-[13px] font-medium text-ink-soft">Looking to meet</legend>
        <div className="flex flex-wrap gap-2">
          {lookingFor.map((l) => (
            <Chip key={l.value} selected={draft.lookingFor === l.value} onClick={() => set({ lookingFor: l.value })}>
              {l.label}
            </Chip>
          ))}
        </div>
      </fieldset>
    </section>
  );
}

export function isStep1Valid(d: ProfileDraft) {
  const age = Number(d.age);
  return (
    d.name.trim().length >= 1 &&
    age >= 18 &&
    age <= 99 &&
    d.city.trim().length >= 1 &&
    d.gender !== null &&
    d.lookingFor !== null
  );
}
