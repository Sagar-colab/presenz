"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Live countdown that ticks once per minute. Shows "Expired" once past target.
export function Countdown({
  to,
  className,
  expiredLabel = "Expired",
}: {
  to: string | Date;
  className?: string;
  expiredLabel?: string;
}) {
  const target = typeof to === "string" ? new Date(to).getTime() : to.getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <span className={className}>—</span>;
  const ms = target - now;
  if (ms <= 0) return <span className={className}>{expiredLabel}</span>;

  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 24) {
    const days = Math.floor(h / 24);
    const remH = h % 24;
    return (
      <span className={cn("tabular-nums", className)}>
        {days}d {remH}h left
      </span>
    );
  }
  return (
    <span className={cn("tabular-nums", className)}>
      {h}h {m}m left
    </span>
  );
}
