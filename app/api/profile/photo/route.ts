import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getModerationService } from "@/lib/services/moderation";
import { getUploadService } from "@/lib/services/upload";

const Body = z.object({ dataUrl: z.string().startsWith("data:image/").max(8 * 1024 * 1024) });

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "photo"), capacity: 8, refillPerSec: 1 / 30 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const mod = getModerationService();
  const verdict = await mod.scanImage(parsed.dataUrl);
  if (!verdict.ok) {
    return NextResponse.json({ ok: false, reason: `blocked_${verdict.reason}` }, { status: 422 });
  }

  const upload = getUploadService();
  const result = await upload.uploadDataUrl(parsed.dataUrl, `profiles/${userId}`);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 502 });
  }

  return NextResponse.json({ ok: true, url: result.url });
}
