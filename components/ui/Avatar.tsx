import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<Size, string> = {
  sm: "h-8 w-8 text-[12px]",
  md: "h-12 w-12 text-[15px]",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export function Avatar({
  name,
  photo,
  size = "md",
  className,
}: {
  name?: string | null;
  photo?: string | null;
  size?: Size;
  className?: string;
}) {
  const initial = (name ?? "").trim().slice(0, 1).toUpperCase() || "P";

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name ?? "Profile photo"}
        className={cn(
          "rounded-full object-cover hairline",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary-50 font-semibold text-primary-700 hairline",
        sizeClasses[size],
        className,
      )}
      aria-label={name ?? "Avatar"}
    >
      {initial}
    </div>
  );
}
