import { prisma } from "@/lib/db";
import type { Match } from "@prisma/client";

const MATCH_WINDOW_MS = 72 * 60 * 60 * 1000;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Auto-expire any past-deadline matches/proposals on read so the UI never
// has to special-case stale rows.
export async function sweepExpiry(matchId?: string) {
  const now = new Date();
  await prisma.match.updateMany({
    where: {
      ...(matchId ? { id: matchId } : {}),
      status: { in: ["PENDING", "ACTIVE"] },
      expiresAt: { lt: now },
    },
    data: { status: "EXPIRED" },
  });
}

// Returns today's match for the user (creates one if none exists yet today).
// "1 per day" is enforced by checking if any match was created today —
// regardless of status — so passing on today's match doesn't unlock another.
export async function findOrCreateTodaysMatch(userId: string): Promise<Match | null> {
  await sweepExpiry();

  const today = startOfToday();
  const existing = await prisma.match.findFirst({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      createdAt: { gte: today },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!me || me.status === "BANNED" || me.status === "SUSPENDED") return null;
  if (!me.aadhaarVerified || !me.faceVerified || !me.profileComplete) return null;

  // All users we've ever been matched with — exclude from future matching.
  const prior = await prisma.match.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    select: { user1Id: true, user2Id: true },
  });
  const excluded = new Set<string>([userId]);
  for (const m of prior) {
    excluded.add(m.user1Id);
    excluded.add(m.user2Id);
  }

  const candidate = await prisma.user.findFirst({
    where: {
      id: { notIn: Array.from(excluded) },
      aadhaarVerified: true,
      faceVerified: true,
      profileComplete: true,
      status: "ACTIVE",
      city: me.city ?? undefined,
      ...compatibility(me),
    },
    orderBy: { trustScore: "desc" },
  });
  if (!candidate) return null;

  // Sort IDs so the unique [user1Id, user2Id] constraint is order-independent.
  const [u1, u2] = [userId, candidate.id].sort();
  return prisma.match.create({
    data: {
      user1Id: u1,
      user2Id: u2,
      status: "PENDING",
      expiresAt: new Date(Date.now() + MATCH_WINDOW_MS),
    },
  });
}

// Soft compatibility: respect lookingFor when both sides have set it.
function compatibility(me: { gender: string | null; lookingFor: string | null }) {
  if (!me.lookingFor || me.lookingFor === "EVERYONE") return {};
  if (me.lookingFor === "MEN") return { gender: "MALE" as const };
  if (me.lookingFor === "WOMEN") return { gender: "FEMALE" as const };
  return {};
}

export function otherUserId(match: { user1Id: string; user2Id: string }, viewerId: string): string {
  return match.user1Id === viewerId ? match.user2Id : match.user1Id;
}

export function isMatchParticipant(match: { user1Id: string; user2Id: string }, viewerId: string): boolean {
  return match.user1Id === viewerId || match.user2Id === viewerId;
}
