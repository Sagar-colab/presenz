import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { DateTypeIcon, dateTypeLabel } from "@/components/ui/DateTypeIcon";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant, otherUserId } from "@/lib/match";
import { formatSlot } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) redirect("/onboarding");

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) notFound();
  if (!isMatchParticipant(match, userId)) notFound();

  const otherId = otherUserId(match, userId);
  const [me, other, accepted, initialMessages] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
    prisma.user.findUnique({ where: { id: otherId }, include: { profile: true } }),
    prisma.dateProposal.findFirst({
      where: { matchId: match.id, status: "ACCEPTED" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.findMany({
      where: { matchId: match.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, senderId: true, content: true, createdAt: true },
    }),
  ]);

  if (!me || !other) notFound();
  if (match.status !== "ACTIVE" || !accepted) {
    return (
      <AppShell>
        <Card className="text-center py-12">
          <p className="text-[12px] uppercase tracking-[0.2em] text-ink-faint">Chat not open</p>
          <h2 className="mt-2 text-[20px] font-semibold tracking-tightish text-ink">
            Confirm a date first
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-muted">
            Chat opens once you and your match have agreed on a time.
          </p>
          <Link
            href={`/match/${match.id}`}
            className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-[14px] font-medium text-white transition-all hover:bg-primary-600 active:scale-[0.97]"
          >
            Back to match
          </Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-4">
        <Link href="/dashboard" className="text-[13px] text-ink-muted hover:text-ink">
          ← Today
        </Link>
      </header>

      <PinnedDateBar
        dateType={accepted.dateType}
        venue={accepted.venue}
        time={accepted.timeSlot1}
      />

      <ChatRoom
        matchId={match.id}
        meId={me.id}
        meName={me.name ?? "You"}
        mePhoto={me.profile?.photos?.[0] ?? null}
        otherName={other.name ?? "Match"}
        otherPhoto={other.profile?.photos?.[0] ?? null}
        initialMessages={initialMessages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </AppShell>
  );
}

function PinnedDateBar({
  dateType,
  venue,
  time,
}: {
  dateType: import("@prisma/client").DateType;
  venue: string;
  time: Date;
}) {
  return (
    <div className="mb-5 rounded-2xl bg-white hairline px-4 py-3.5 md:px-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <DateTypeIcon type={dateType} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] uppercase tracking-[0.16em] text-ink-faint">
            {dateTypeLabel(dateType)} · confirmed
          </p>
          <p className="mt-0.5 truncate text-[14.5px] text-ink">{venue}</p>
        </div>
        <p className="hidden text-right text-[13px] text-ink-muted md:block">{formatSlot(time)}</p>
      </div>
      <p className="mt-1.5 text-[12.5px] text-ink-muted md:hidden">{formatSlot(time)}</p>
    </div>
  );
}
