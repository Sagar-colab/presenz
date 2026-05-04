import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Countdown } from "@/components/ui/Countdown";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant, otherUserId, sweepExpiry } from "@/lib/match";
import { PROMPTS } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) redirect("/onboarding");

  await sweepExpiry(params.id);

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) notFound();
  if (!isMatchParticipant(match, userId)) notFound();

  if (match.status === "ACTIVE") {
    redirect(`/chat/${match.id}`);
  }

  const otherId = otherUserId(match, userId);
  const other = await prisma.user.findUnique({
    where: { id: otherId },
    include: { profile: true },
  });
  if (!other) notFound();

  const activeProposal = await prisma.dateProposal.findFirst({
    where: { matchId: match.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const prompts = collectPrompts(other.profile);

  return (
    <AppShell>
      <header className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-[13px] text-ink-muted hover:text-ink">
          ← Today
        </Link>
        <span className="text-[13px] text-ink-muted">
          <Countdown to={match.expiresAt} expiredLabel="Window closed" />
        </span>
      </header>

      {match.status === "EXPIRED" || match.status === "CLOSED" ? (
        <Card className="text-center py-12">
          <CardTitle>
            {match.status === "EXPIRED" ? "That window closed" : "This match is closed"}
          </CardTitle>
          <CardBody className="mx-auto mt-3 max-w-md">
            We'll have a fresh match for you tomorrow.
          </CardBody>
        </Card>
      ) : (
        <div className="fade-up">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-alt">
              {other.profile?.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={other.profile.photos[0]}
                  alt={other.name ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl text-ink-faint">
                  {(other.name ?? "P").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="absolute right-4 top-4">
                <Badge tone="success" shape="✓" className="verify-pulse">Verified</Badge>
              </div>
            </div>
            <div className="space-y-6 p-6 md:p-7">
              <header>
                <h1 className="text-[26px] font-semibold tracking-tightish text-ink">
                  {other.name}{other.age ? `, ${other.age}` : ""}
                </h1>
                {other.city && <p className="mt-1 text-[14px] text-ink-muted">{other.city}</p>}
              </header>

              {other.profile?.intro && (
                <p className="text-[15.5px] leading-relaxed text-ink-soft">
                  {other.profile.intro}
                </p>
              )}

              {prompts.length > 0 && (
                <ul className="space-y-4 border-t border-surface-line pt-5">
                  {prompts.map((p) => (
                    <li key={p.key}>
                      <p className="text-[12.5px] uppercase tracking-[0.14em] text-ink-faint">
                        {p.label}
                      </p>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{p.answer}</p>
                    </li>
                  ))}
                </ul>
              )}

              {other.profile?.interests && other.profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-surface-line pt-5">
                  {other.profile.interests.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-alt px-3 py-1 text-[12.5px] text-ink-muted hairline"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {activeProposal ? (
            <div className="mt-6 text-center">
              <Link
                href={`/proposal/${activeProposal.id}`}
                className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-[15px] font-medium text-white transition-all duration-150 hover:bg-primary-600 active:scale-[0.97]"
              >
                View proposal →
              </Link>
            </div>
          ) : (
            <DashboardActions matchId={match.id} otherName={other.name ?? "them"} />
          )}
        </div>
      )}
    </AppShell>
  );
}

function collectPrompts(profile: {
  prompt1Key: string | null; prompt1: string | null;
  prompt2Key: string | null; prompt2: string | null;
  prompt3Key: string | null; prompt3: string | null;
  prompt4Key: string | null; prompt4: string | null;
} | null) {
  if (!profile) return [];
  const pairs = [
    [profile.prompt1Key, profile.prompt1],
    [profile.prompt2Key, profile.prompt2],
    [profile.prompt3Key, profile.prompt3],
    [profile.prompt4Key, profile.prompt4],
  ] as const;
  return pairs.flatMap(([key, answer]) => {
    if (!key || !answer) return [];
    const label = PROMPTS.find((p) => p.key === key)?.label ?? key;
    return [{ key, label, answer }];
  });
}
