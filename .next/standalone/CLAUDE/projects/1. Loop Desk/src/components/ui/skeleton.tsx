import { cn } from "@/lib/utils";

function Skeleton({
  className,
  shimmer = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md",
        shimmer
          ? "shimmer" // Uses the shimmer class from globals.css
          : "animate-pulse bg-secondary dark:bg-gray-700",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
