import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "primary";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-alt text-ink-soft hairline",
  success: "bg-[#E8F4ED] text-success",
  warning: "bg-[#FBF1E0] text-warning",
  primary: "bg-primary-50 text-primary-700",
};

export function Badge({
  tone = "neutral",
  shape,
  children,
  className,
}: {
  tone?: Tone;
  shape?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {shape && <span aria-hidden>{shape}</span>}
      {children}
    </span>
  );
}
