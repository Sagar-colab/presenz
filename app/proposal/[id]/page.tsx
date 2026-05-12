import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, CardTitle, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Countdown } from "@/components/ui/Countdown";
import { DateTypeIcon, dateTypeLabel } from "@/components/ui/DateTypeIcon";
import { ProposalActions } from "@/components/proposal/ProposalActions";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant, sweepExpiry } from "@/lib/match";
import { formatSlot } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  if (!userId) redirect("/onboarding");

  await sweepExpiry();

  const proposal = await prisma.dateProposal.findUnique({
    where: { id: id },
    include: {
      match: true,
      author: { include: { profile: true } },
    },
  });
  if (!proposal) notFound();
  if (!isMatchParticipant(proposal.match, userId)) notFound();

  const isMine = proposal.proposedBy === userId;

  return (
    <AppShell>
      <header className="mb-6 flex items-center justify-between">
        <Link href={`/match/${proposal.matchId}`} className="text-[13px] text-ink-muted hover:text-ink">
          ← Match
        </Link>
        {proposal.match.status === "PENDING" && (
          <span className="text-[13px] text-ink-muted">
            <Countdown to={proposal.match.expiresAt} expiredLabel="Window closed" />
          </span>
        )}
      </header>

      <div className="space-y-6 fade-up">
        <ProposerCard
          author={{
            name: proposal.author.name,
            age: proposal.author.age,
            city: proposal.author.city,
            photo: proposal.author.profile?.photos?.[0] ?? null,
          }}
          isMine={isMine}
        />

        <ProposalDetails
          dateType={proposal.dateType}
          venue={proposal.venue}
          timeSlot1={proposal.timeSlot1}
          timeSlot2={proposal.timeSlot2}
        />

        <StatusCard
          status={proposal.status}
          matchStatus={proposal.match.status}
          matchId={proposal.matchId}
        />

        {proposal.status === "PENDING" && proposal.match.status === "PENDING" && !isMine && (
          <ProposalActions proposalId={proposal.id} matchId={proposal.matchId} />
        )}

        {proposal.status === "PENDING" && isMine && (
          <Card>
            <CardBody>
              You sent this proposal. Waiting for them to respond.
            </CardBody>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function ProposerCard({
  author,
  isMine,
}: {
  author: { name: string | null; age: number | null; city: string | null; photo: string | null };
  isMine: boolean;
}) {
  return (
    <Card className="flex items-center gap-4">
      <Avatar name={author.name} photo={author.photo} size="lg" />
      <div>
        <p className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
          {isMine ? "Your proposal" : "Proposal from"}
        </p>
        <h2 className="mt-0.5 text-[18px] font-semibold tracking-tightish text-ink">
          {author.name}{author.age ? `, ${author.age}` : ""}
        </h2>
        {author.city && <p className="text-[13px] text-ink-muted">{author.city}</p>}
      </div>
    </Card>
  );
}

function ProposalDetails({
  dateType,
  venue,
  timeSlot1,
  timeSlot2,
}: {
  dateType: import("@prisma/client").DateType;
  venue: string;
  timeSlot1: Date;
  timeSlot2: Date;
}) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <DateTypeIcon type={dateType} />
        </span>
        <div>
          <p className="text-[12.5px] uppercase tracking-[0.16em] text-ink-faint">Date type</p>
          <p className="text-[16px] font-medium text-ink">{dateTypeLabel(dateType)}</p>
        </div>
      </div>

      <div className="border-t border-surface-line pt-4">
        <p className="text-[12.5px] uppercase tracking-[0.16em] text-ink-faint">Venue</p>
        <p className="mt-1 text-[15.5px] text-ink">{venue}</p>
      </div>

      <div className="border-t border-surface-line pt-4">
        <p className="text-[12.5px] uppercase tracking-[0.16em] text-ink-faint">Time slots</p>
        <ul className="mt-2 space-y-1.5 text-[15px] text-ink">
          <li className="flex gap-3">
            <span className="text-ink-faint tabular-nums">1.</span>
            <span>{formatSlot(timeSlot1)}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-ink-faint tabular-nums">2.</span>
            <span>{formatSlot(timeSlot2)}</span>
          </li>
        </ul>
      </div>
    </Card>
  );
}

function StatusCard({
  status,
  matchStatus,
  matchId,
}: {
  status: import("@prisma/client").ProposalStatus;
  matchStatus: import("@prisma/client").MatchStatus;
  matchId: string;
}) {
  if (status === "ACCEPTED") {
    return (
      <Card className="bg-[#E8F4ED]" >
        <CardTitle className="text-success">Date confirmed</CardTitle>
        <CardBody className="mt-2 text-success">
          Chat is open — three messages until you meet.
        </CardBody>
        <Link
          href={`/chat/${matchId}`}
          className="mt-4 inline-flex h-11 items-center rounded-xl bg-success px-5 text-[14.5px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
        >
          Open chat →
        </Link>
      </Card>
    );
  }

  if (status === "PASSED" || matchStatus === "CLOSED") {
    return (
      <Card>
        <CardTitle>Proposal closed</CardTitle>
        <CardBody className="mt-2">
          This proposal didn't go ahead. We'll have a fresh match tomorrow.
        </CardBody>
      </Card>
    );
  }

  if (status === "COUNTERED") {
    return (
      <Card>
        <CardTitle>Time was countered</CardTitle>
        <CardBody className="mt-2">
          A new proposal was sent with different time slots. Check today's match for the latest.
        </CardBody>
      </Card>
    );
  }

  if (matchStatus === "EXPIRED") {
    return (
      <Card>
        <CardTitle>Window closed</CardTitle>
        <CardBody className="mt-2">
          This match expired before you both could agree on a time.
        </CardBody>
      </Card>
    );
  }

  return null;
}
