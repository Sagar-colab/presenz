import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { CheckinForm } from "@/components/checkin/CheckinForm";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { isMatchParticipant, otherUserId } from "@/lib/match";

export const dynamic = "force-dynamic";

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  if (!userId) redirect("/onboarding");

  const match = await prisma.match.findUnique({ where: { id: id } });
  if (!match) notFound();
  if (!isMatchParticipant(match, userId)) notFound();

  const otherId = otherUserId(match, userId);
  const other = await prisma.user.findUnique({ where: { id: otherId } });
  if (!other) notFound();

  const already = await prisma.dateRating.findUnique({
    where: { matchId_ratedBy: { matchId: match.id, ratedBy: userId } },
  });

  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-surface-line bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" aria-label="Presenz home"><Logo /></Link>
        </div>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-2xl items-center px-6 py-10">
        {already ? (
          <Card className="w-full text-center py-12">
            <p className="text-[12px] uppercase tracking-[0.2em] text-ink-faint">Already shared</p>
            <h1 className="mt-2 text-[22px] font-semibold tracking-tightish text-ink">
              Thank you.
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-muted">
              We've noted how it went. We'll use this to improve your matches.
            </p>
          </Card>
        ) : (
          <CheckinForm matchId={match.id} otherName={other.name ?? "your match"} />
        )}
      </main>
    </div>
  );
}
