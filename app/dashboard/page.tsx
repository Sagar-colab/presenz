import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Countdown } from "@/components/ui/Countdown";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { RequestAnotherMatchButton } from "@/components/dashboard/RequestAnotherMatchButton";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { findOrCreateTodaysMatch, otherUserId } from "@/lib/match";
import { PROMPTS } from "@/lib/prompts";

export const metadata = { title: "Today — Presenz" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await requireUserId();
  if (!userId) redirect("/onboarding");

  const me = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!me) redirect("/onboarding");
  if (!me.aadhaarVerified) redirect("/verify/aadhaar");
  if (!me.faceVerified) redirect("/verify/face");
  if (!me.profileComplete) redirect("/profile/create");

  const match = await findOrCreateTodaysMatch(userId);

  // No candidate found in our city today → curating empty state.
  if (!match) {
    return (
      <AppShell>
        <CuratingState city={me.city} />
      </AppShell>
    );
  }

  const otherId = otherUserId(match, userId);
  const other = await prisma.user.findUnique({
    where: { id: otherId },
    include: { profile: true },
  });

  // Match is live — fetch the existing proposal (if any) to decide where to send the user next.
  const activeProposal = await prisma.dateProposal.findFirst({
    where: { matchId: match.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  if (match.status === "ACTIVE") {
    redirect(`/chat/${match.id}`);
  }

  return (
    <AppShell>
      {match.status === "EXPIRED" ? (
        <ComeBackTomorrow expired />
      ) : match.status === "CLOSED" ? (
        <ComeBackTomorrow />
      ) : !other ? (
        <CuratingState city={me.city} />
      ) : (
        <div className="fade-up">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] text-ink-faint">
                Today's match
              </p>
              <p className="mt-1 text-[14px] text-ink-muted">
                <Countdown to={match.expiresAt} expiredLabel="Window closed" />
              </p>
            </div>
            {activeProposal && (
              <Link
                href={`/proposal/${activeProposal.id}`}
                className="text-[13px] text-primary underline-offset-4 hover:underline"
              >
                View proposal →
              </Link>
            )}
          </header>

          <MatchProfile
            other={{
              id: other.id,
              name: other.name,
              age: other.age,
              city: other.city,
              photo: other.profile?.photos?.[0] ?? null,
              intro: other.profile?.intro ?? null,
              prompts: collectPrompts(other.profile),
              interests: other.profile?.interests ?? [],
            }}
          />

          {!activeProposal && (
            <DashboardActions matchId={match.id} otherName={other.name ?? "them"} />
          )}

          <RequestAnotherMatchButton />
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

function MatchProfile({
  other,
}: {
  other: {
    id: string;
    name: string | null;
    age: number | null;
    city: string | null;
    photo: string | null;
    intro: string | null;
    prompts: { key: string; label: string; answer: string }[];
    interests: string[];
  };
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-alt">
        {other.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={other.photo} alt={other.name ?? ""} className="h-full w-full object-cover" />
        ) : (
          <Avatar name={other.name} size="xl" className="!h-full !w-full !rounded-none text-5xl" />
        )}
        <div className="absolute right-4 top-4">
          <Badge tone="success" shape="✓" className="verify-pulse">Verified</Badge>
        </div>
      </div>
      <div className="space-y-6 p-6 md:p-7">
        <header>
          <h2 className="text-[24px] font-semibold tracking-tightish text-ink">
            {other.name}{other.age ? `, ${other.age}` : ""}
          </h2>
          {other.city && (
            <p className="mt-1 text-[14px] text-ink-muted">{other.city}</p>
          )}
        </header>

        {other.intro && (
          <p className="text-[15.5px] leading-relaxed text-ink-soft">{other.intro}</p>
        )}

        {other.prompts.length > 0 && (
          <ul className="space-y-4 border-t border-surface-line pt-5">
            {other.prompts.map((p) => (
              <li key={p.key}>
                <p className="text-[12.5px] uppercase tracking-[0.14em] text-ink-faint">
                  {p.label}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{p.answer}</p>
              </li>
            ))}
          </ul>
        )}

        {other.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-surface-line pt-5">
            {other.interests.map((tag) => (
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
  );
}

function CuratingState({ city }: { city: string | null }) {
  return (
    <div className="fade-up">
      <Card className="text-center py-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <span className="h-3 w-3 rounded-full bg-primary pulse-ring" aria-hidden />
        </div>
        <CardTitle>Your match is being curated</CardTitle>
        <CardBody className="mx-auto mt-3 max-w-md">
          We're carefully choosing the right person for you in {city ?? "your city"}. Check back
          later today — most matches arrive by evening.
        </CardBody>
      </Card>
    </div>
  );
}

function ComeBackTomorrow({ expired = false }: { expired?: boolean }) {
  return (
    <div className="fade-up">
      <Card className="text-center py-12">
        <CardTitle>{expired ? "That window closed" : "Come back tomorrow"}</CardTitle>
        <CardBody className="mx-auto mt-3 max-w-md">
          {expired
            ? "This match expired without a date being set. We'll send you a fresh match tomorrow."
            : "You've seen today's match. We'll send a fresh one tomorrow — one a day, always carefully chosen."}
        </CardBody>
      </Card>
    </div>
  );
}
