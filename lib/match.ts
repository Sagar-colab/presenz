import { prisma } from "@/lib/db";
import type { Match, Plan } from "@prisma/client";
import { startOfTodayIST } from "@/lib/utils";
import { getDailyMatchCap } from "@/lib/plans";

const MATCH_WINDOW_MS = 72 * 60 * 60 * 1000;

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

// Returns today's most-recent match for the user (creates one if none exists
// yet today). Used by the dashboard initial load — gives every user at least
// one match attempt per day.
export async function findOrCreateTodaysMatch(userId: string): Promise<Match | null> {
  await sweepExpiry();
  const existing = await mostRecentMatchToday(userId);
  if (existing) return existing;
  return createMatchFor(userId);
}

// Paid-tier "find me another match today" path. Caps per User.plan via
// getDailyMatchCap(). Returns a structured error so the UI can show an
// upgrade prompt when the cap is reached.
export async function requestAnotherMatch(
  userId: string,
): Promise<{ match: Match } | { error: "cap_reached"; plan: Plan; cap: number } | { error: "no_candidate" } | { error: "ineligible" }> {
  await sweepExpiry();

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, status: true, aadhaarVerified: true, faceVerified: true, profileComplete: true },
  });
  if (!me) return { error: "ineligible" };
  if (me.status === "BANNED" || me.status === "SUSPENDED") return { error: "ineligible" };
  if (!me.aadhaarVerified || !me.faceVerified || !me.profileComplete) return { error: "ineligible" };

  const todayCount = await prisma.match.count({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      createdAt: { gte: startOfTodayIST() },
    },
  });
  const cap = getDailyMatchCap(me.plan);
  if (todayCount >= cap) {
    return { error: "cap_reached", plan: me.plan, cap };
  }

  const match = await createMatchFor(userId);
  if (!match) return { error: "no_candidate" };
  return { match };
}

async function mostRecentMatchToday(userId: string): Promise<Match | null> {
  return prisma.match.findFirst({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      createdAt: { gte: startOfTodayIST() },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function createMatchFor(userId: string): Promise<Match | null> {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!me || me.status === "BANNED" || me.status === "SUSPENDED") return null;
  if (!me.aadhaarVerified || !me.faceVerified || !me.profileComplete) return null;

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
