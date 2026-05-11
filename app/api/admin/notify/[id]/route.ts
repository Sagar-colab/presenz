import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { getSmsService } from "@/lib/services/sms";

const Body = z.object({ reason: z.string().min(2).max(200) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { phone: true } });
  if (!user) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });

  const sms = getSmsService();
  const result = await sms.sendWarning(user.phone, parsed.reason);
  if (!result.ok) return NextResponse.json({ ok: false, reason: result.reason }, { status: 502 });
  return NextResponse.json({ ok: true });
}
