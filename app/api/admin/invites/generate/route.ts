import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { generateInviteCode } from "@/lib/invite";

const Body = z.object({ count: z.number().int().min(1).max(100).default(10) });

export async function POST(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });

  let parsed;
  try {
    parsed = Body.parse(await req.json().catch(() => ({})));
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const codes: string[] = [];
  // Generate one at a time so the unique constraint catches collisions and we
  // can retry. Collisions are astronomically rare with 30^8 keyspace.
  while (codes.length < parsed.count) {
    const code = generateInviteCode();
    try {
      await prisma.inviteCode.create({ data: { code, createdBy: adminId } });
      codes.push(code);
    } catch {
      // unique-violation → try again
    }
  }
  return NextResponse.json({ ok: true, codes });
}
