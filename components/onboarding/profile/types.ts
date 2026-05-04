import type { PromptKey } from "@/lib/prompts";

export type Gender = "MALE" | "FEMALE" | "NONBINARY" | "PREFER_NOT_TO_SAY";
export type LookingFor = "MEN" | "WOMEN" | "EVERYONE";

export type ProfileDraft = {
  name: string;
  age: string;
  city: string;
  gender: Gender | null;
  lookingFor: LookingFor | null;
  intro: string;
  promptAnswers: Partial<Record<PromptKey, string>>;
  selectedPrompts: PromptKey[]; // order matters — first 4
  photos: string[]; // urls already uploaded
  interests: string[];
};

export const emptyDraft: ProfileDraft = {
  name: "",
  age: "",
  city: "",
  gender: null,
  lookingFor: null,
  intro: "",
  promptAnswers: {},
  selectedPrompts: [],
  photos: [],
  interests: [],
};
