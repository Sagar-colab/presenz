"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Chip({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={!!selected}
      className={cn(
        "inline-flex h-9 items-center rounded-full px-3.5 text-[13.5px] font-medium tracking-tightish transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "bg-primary text-white"
          : "bg-white text-ink-soft hairline hover:bg-surface-alt",
      )}
    >
      {children}
    </button>
  );
}
