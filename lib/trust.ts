import { prisma } from "@/lib/db";

export const TRUST_DELTAS = {
  DATE_GREAT: 5,
  DATE_OKAY: 0,
  DATE_DIDNT_MEET: -10,
  FLAG_RECEIVED: -15,
  FLAG_REPORTER_FALSE: -5,
  WARNING_ISSUED: -20,
  AADHAAR_VERIFIED: 10,
  FACE_VERIFIED: 10,
} as const;

export type TrustReason = keyof typeof TRUST_DELTAS;

export type TrustLevel = "high" | "medium" | "low";

export function getTrustLevel(score: number): TrustLevel {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, n));
}

export async function adjustTrustScore(
  userId: string,
  delta: number,
  reason: string,
): Promise<{ before: number; after: number }> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { trustScore: true } });
    if (!user) throw new Error(`adjustTrustScore: user ${userId} not found`);
    const before = user.trustScore;
    const after = clamp(before + delta);
    const realDelta = after - before;
    await tx.user.update({ where: { id: userId }, data: { trustScore: after } });
    await tx.trustEvent.create({ data: { userId, delta: realDelta, reason } });
    return { before, after };
  });
}
