import { cn } from "@/lib/utils";

/** Fixed, non-interactive film-grain overlay. Place inside a relative parent. */
export const Grain = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={cn("brand-grain pointer-events-none absolute inset-0", className)}
  />
);
