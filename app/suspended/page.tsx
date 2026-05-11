export const dynamic = "force-dynamic";

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="max-w-md text-center">
        <h1 className="text-[24px] font-semibold tracking-tightish text-ink">
          Your account has been suspended
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          Presenz requires every member to maintain a respectful, authentic presence. Your account is
          currently suspended pending review. If you believe this is in error, please contact
          support.
        </p>
        <a
          href="mailto:support@presenz.app"
          className="mt-6 inline-block text-[14px] text-primary hover:underline"
        >
          support@presenz.app
        </a>
      </div>
    </div>
  );
}
