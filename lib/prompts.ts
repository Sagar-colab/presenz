// The 12 prompts users pick 4 from. Stable keys so we can analyse aggregates later
// without depending on copy.

export const PROMPTS = [
  { key: "no_compromise", label: "I'll never compromise on..." },
  { key: "perfect_first_date", label: "My idea of a perfect first date..." },
  { key: "people_dont_know", label: "The thing people don't know about me..." },
  { key: "looking_for", label: "I'm looking for someone who..." },
  { key: "obsessed_with", label: "Currently obsessed with..." },
  { key: "mornings", label: "My mornings look like..." },
  { key: "dealbreaker", label: "A dealbreaker for me is..." },
  { key: "show_love", label: "I show love by..." },
  { key: "made_me_laugh", label: "The last thing that made me laugh..." },
  { key: "proudest", label: "I'm proudest of..." },
  { key: "working_on", label: "Right now I'm working on..." },
  { key: "always_make_time", label: "One thing I'll always make time for..." },
] as const;

export type PromptKey = (typeof PROMPTS)[number]["key"];

export const INTERESTS = [
  "Books",
  "Hiking",
  "Cinema",
  "Food",
  "Travel",
  "Music",
  "Art",
  "Fitness",
  "Gaming",
  "Cooking",
  "Yoga",
  "Coffee",
] as const;

export type Interest = (typeof INTERESTS)[number];
