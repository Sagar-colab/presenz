import { cn } from "@/lib/utils";
import type { DateType } from "@prisma/client";

// Maps Prisma DateType enum → human label + minimal stroke icon.
export const DATE_TYPE_OPTIONS: { value: DateType; label: string }[] = [
  { value: "COFFEE", label: "Coffee" },
  { value: "WALK", label: "Walk" },
  { value: "MEAL", label: "Dinner" },
  { value: "ACTIVITY", label: "Gallery" },
  { value: "DRINK", label: "Drinks" },
];

export function dateTypeLabel(t: DateType): string {
  return DATE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;
}

export function DateTypeIcon({ type, className }: { type: DateType; className?: string }) {
  const common = cn("h-6 w-6", className);
  const stroke = "currentColor";

  switch (type) {
    case "COFFEE":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" className={common}>
          <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" />
          <path d="M16 11h2a2 2 0 0 1 0 4h-2" />
          <path d="M8 4c0 1.5 1 1.5 1 3M11 4c0 1.5 1 1.5 1 3" />
        </svg>
      );
    case "WALK":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <circle cx="13" cy="4.5" r="1.7" />
          <path d="M9 21l3-6 3 3 3-1" />
          <path d="M11 9l3-2 4 3-2 4-3-1-3 6" />
        </svg>
      );
    case "MEAL":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" className={common}>
          <path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10" />
          <path d="M16 3c-1.5 0-2.5 2-2.5 4.5S14.5 12 16 12v9" />
        </svg>
      );
    case "ACTIVITY":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 16l5-5 4 4 3-3 4 4" />
          <circle cx="9" cy="9" r="1.4" fill={stroke} />
        </svg>
      );
    case "DRINK":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M6 4h12l-1.5 7a4 4 0 0 1-4 3.2h-1A4 4 0 0 1 7.5 11L6 4z" />
          <path d="M12 14.5V20M9 20h6" />
        </svg>
      );
    default:
      return null;
  }
}
