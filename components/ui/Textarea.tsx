import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, showCount, className, id, value, maxLength, ...rest }, ref) => {
    const inputId = id ?? React.useId();
    const len = typeof value === "string" ? value.length : 0;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-ink-soft">
            {label}
          </label>
        )}
        <div
          className={cn(
            "rounded-xl bg-white hairline transition-colors",
            "focus-within:shadow-[inset_0_0_0_1px_var(--primary)]",
            error && "shadow-[inset_0_0_0_1px_theme(colors.danger)]",
          )}
        >
          <textarea
            ref={ref}
            id={inputId}
            value={value}
            maxLength={maxLength}
            className={cn(
              "block w-full resize-none rounded-xl bg-transparent p-3.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint outline-none",
              className,
            )}
            {...rest}
          />
        </div>
        <div className="flex justify-between text-[12.5px]">
          <span className={cn(error ? "text-danger" : "text-ink-muted")}>{error ?? hint}</span>
          {showCount && maxLength != null && (
            <span className="text-ink-faint tabular-nums">{len}/{maxLength}</span>
          )}
        </div>
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
