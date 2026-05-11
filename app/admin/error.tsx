"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[admin] segment error:", error, "digest=", error.digest);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="max-w-lg">
        <h1 className="text-[24px] font-semibold tracking-tightish text-ink">
          Something broke in the admin area
        </h1>
        <p className="mt-3 text-[14px] text-ink-muted">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="mt-1 text-[12px] text-ink-faint">
            Error ID: <code className="font-mono">{error.digest}</code> — include this when
            reporting.
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-[14px] text-white"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-md border border-surface-line px-4 py-2 text-[14px] text-ink"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
