import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leadingAdornment, className, id, ...rest }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-ink-soft">
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex items-center rounded-xl bg-white hairline transition-colors",
            "focus-within:shadow-[inset_0_0_0_1px_var(--primary)]",
            error && "shadow-[inset_0_0_0_1px_theme(colors.danger)]",
          )}
        >
          {leadingAdornment && (
            <span className="pl-3.5 text-ink-muted text-[15px]">{leadingAdornment}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full bg-transparent px-3.5 text-[15px] text-ink placeholder:text-ink-faint outline-none",
              leadingAdornment && "pl-2",
              className,
            )}
            {...rest}
          />
        </div>
        {(hint || error) && (
          <p className={cn("text-[12.5px]", error ? "text-danger" : "text-ink-muted")}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
