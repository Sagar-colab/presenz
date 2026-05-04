"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Modal on desktop, bottom-sheet on mobile. Dismiss on backdrop click + Esc.
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-t-2xl bg-white p-6 hairline fade-up md:rounded-2xl md:max-h-[85vh] md:overflow-y-auto",
          "max-h-[90vh] overflow-y-auto",
          className,
        )}
      >
        {(title || description) && (
          <header className="mb-5">
            {title && (
              <h2 className="text-[20px] font-semibold tracking-tightish text-ink">{title}</h2>
            )}
            {description && (
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{description}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
