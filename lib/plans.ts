import type { Plan } from "@prisma/client";

export type PlanTier = Plan;

export interface PlanMeta {
  tier: PlanTier;
  label: string;
  priceInrPaise: number;
  priceInrDisplay: string;
  dailyMatchCap: number;
  activeProposalCap: number;
  features: string[];
  tagline: string;
}

export const PLAN_META: Record<PlanTier, PlanMeta> = {
  FREE: {
    tier: "FREE",
    label: "Free",
    priceInrPaise: 0,
    priceInrDisplay: "₹0",
    dailyMatchCap: 1,
    activeProposalCap: 1,
    features: ["1 match per day", "1 active proposal", "Aadhaar + face verification"],
    tagline: "Start meeting verified people.",
  },
  PLUS: {
    tier: "PLUS",
    label: "Presenz+",
    priceInrPaise: 79900,
    priceInrDisplay: "₹799 / month",
    dailyMatchCap: 3,
    activeProposalCap: 3,
    features: [
      "Up to 3 matches per day",
      "See who viewed your profile",
      "Priority curation",
      "Venue suggestions for your dates",
    ],
    tagline: "For people serious about meeting in real life.",
  },
  CONCIERGE: {
    tier: "CONCIERGE",
    label: "Concierge",
    priceInrPaise: 249900,
    priceInrDisplay: "₹2,499 / month",
    dailyMatchCap: 5,
    activeProposalCap: 5,
    features: [
      "Human matchmaker, hand-picked introductions",
      "Up to 5 matches per day",
      "Date planning by Presenz team",
      "Exclusive members-only events",
      "White-glove onboarding",
    ],
    tagline: "Outsource the matching. Show up.",
  },
};

export function getDailyMatchCap(plan: PlanTier): number {
  return PLAN_META[plan].dailyMatchCap;
}

export function isPaidPlan(plan: PlanTier): boolean {
  return plan !== "FREE";
}
