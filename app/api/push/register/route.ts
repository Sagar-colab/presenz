import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";

const Body = z.object({
  token: z.string().min(10).max(200),
  platform: z.enum(["ios", "android", "web"]),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  await prisma.pushToken.upsert({
    where: { token: parsed.token },
    create: { userId, token: parsed.token, platform: parsed.platform },
    update: { userId, platform: parsed.platform, lastSeenAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
