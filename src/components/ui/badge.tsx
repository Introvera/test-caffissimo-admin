import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        pos: "border-transparent bg-[#099699]/8 text-[#099699] dark:bg-[#099699]/15 dark:text-[#5cd5d7]",
        ecommerce:
          "border-transparent bg-[#0891b2]/8 text-[#0891b2] dark:bg-[#0891b2]/15 dark:text-[#67d3f5]",
        uber: "border-transparent bg-[#64748b]/8 text-[#64748b] dark:bg-[#64748b]/15 dark:text-[#b0b8c4]",
        doordash:
          "border-transparent bg-[#6b7280]/8 text-[#6b7280] dark:bg-[#6b7280]/15 dark:text-[#b5b5b5]",
        success:
          "border-transparent bg-[#10b981]/8 text-[#0d9668] dark:bg-[#10b981]/15 dark:text-[#5cd5c8]",
        warning:
          "border-transparent bg-[#f59e0b]/10 text-[#b47b09] dark:bg-[#f59e0b]/15 dark:text-[#fbbf24]",
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
