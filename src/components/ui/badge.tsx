import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900",
        secondary:
          "border-transparent bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
        destructive:
          "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
        outline: "text-foreground",
        tickets:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        attractions:
          "border-transparent bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
        dining:
          "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        hours:
          "border-transparent bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
        waitTimes:
          "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
        hotels:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        events:
          "border-transparent bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
