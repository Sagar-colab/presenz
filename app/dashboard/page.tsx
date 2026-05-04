import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";

export const metadata = { title: "Dashboard — Presenz" };

export default function DashboardStubPage() {
  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-surface-line bg-white">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <Link href="/settings" className="text-[13px] text-ink-muted hover:text-ink">
            Settings
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-14">
        <Card>
          <CardTitle>You're in.</CardTitle>
          <CardBody className="mt-2">
            Your profile is saved. Daily matching, the chat, and admin tools come online next.
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
