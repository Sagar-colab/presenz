import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { requestAnotherMatch } from "@/lib/match";

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const limit = rateLimit({ key: clientKey(req, "match-request"), capacity: 6, refillPerSec: 1 / 30 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  const result = await requestAnotherMatch(userId);
  if ("match" in result) {
    return NextResponse.json({ ok: true, matchId: result.match.id });
  }
  if (result.error === "cap_reached") {
    return NextResponse.json(
      { ok: false, reason: "cap_reached", plan: result.plan, cap: result.cap },
      { status: 402 },
    );
  }
  if (result.error === "no_candidate") {
    return NextResponse.json({ ok: false, reason: "no_candidate" }, { status: 200 });
  }
  return NextResponse.json({ ok: false, reason: "ineligible" }, { status: 403 });
}
