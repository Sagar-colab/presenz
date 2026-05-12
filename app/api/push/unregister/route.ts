import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";

const Body = z.object({ token: z.string().min(10).max(200) });

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  // Only delete the token if it belongs to the authenticated user — defends
  // against a leaked token being used to unregister someone else's device.
  await prisma.pushToken.deleteMany({ where: { token: parsed.token, userId } });

  return NextResponse.json({ ok: true });
}
