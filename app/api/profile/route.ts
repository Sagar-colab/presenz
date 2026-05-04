import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { INTERESTS, PROMPTS } from "@/lib/prompts";

const Gender = z.enum(["MALE", "FEMALE", "NONBINARY", "PREFER_NOT_TO_SAY"]);
const LookingFor = z.enum(["MEN", "WOMEN", "EVERYONE"]);

const promptKeys = PROMPTS.map((p) => p.key) as [string, ...string[]];
const interestSet = new Set<string>(INTERESTS);

const PromptEntry = z.object({
  key: z.enum(promptKeys),
  answer: z.string().min(1).max(500),
});

const Body = z.object({
  name: z.string().min(1).max(60),
  age: z.number().int().min(18).max(99),
  city: z.string().min(1).max(80),
  gender: Gender,
  lookingFor: LookingFor,
  intro: z.string().min(1).max(300),
  prompts: z.array(PromptEntry).length(4),
  photos: z.array(z.string().url().or(z.string().startsWith("/uploads/"))).min(3).max(6),
  interests: z.array(z.string()).max(6),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "profile-save"), capacity: 10, refillPerSec: 1 / 10 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: "bad_request", detail: err instanceof z.ZodError ? err.issues : null },
      { status: 400 },
    );
  }

  const promptKeySet = new Set(parsed.prompts.map((p) => p.key));
  if (promptKeySet.size !== 4) {
    return NextResponse.json({ ok: false, reason: "duplicate_prompts" }, { status: 400 });
  }

  const cleanInterests = parsed.interests.filter((i) => interestSet.has(i));

  const [p1, p2, p3, p4] = parsed.prompts;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.name,
        age: parsed.age,
        city: parsed.city,
        gender: parsed.gender,
        lookingFor: parsed.lookingFor,
        profileComplete: true,
        trustScore: { increment: 20 },
      },
    }),
    prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        intro: parsed.intro,
        prompt1Key: p1!.key, prompt1: p1!.answer,
        prompt2Key: p2!.key, prompt2: p2!.answer,
        prompt3Key: p3!.key, prompt3: p3!.answer,
        prompt4Key: p4!.key, prompt4: p4!.answer,
        photos: parsed.photos,
        interests: cleanInterests,
      },
      update: {
        intro: parsed.intro,
        prompt1Key: p1!.key, prompt1: p1!.answer,
        prompt2Key: p2!.key, prompt2: p2!.answer,
        prompt3Key: p3!.key, prompt3: p3!.answer,
        prompt4Key: p4!.key, prompt4: p4!.answer,
        photos: parsed.photos,
        interests: cleanInterests,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
