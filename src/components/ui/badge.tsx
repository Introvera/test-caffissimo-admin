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
        pos: "border-transparent bg-[#F4E1D2] text-[#6F4F37] dark:bg-[#403827] dark:text-[#E8BB9F]",
        ecommerce:
          "border-transparent bg-[#E7DED0] text-[#504A40] dark:bg-[#2E2A24] dark:text-[#C3B5A0]",
        uber: "border-transparent bg-[#F8F1E5] text-[#8C6B49] dark:bg-[#3B2C1B] dark:text-[#DFC794]",
        doordash:
          "border-transparent bg-[#E8BB9F] text-[#463020] dark:bg-[#463020] dark:text-[#E8BB9F]",
        success:
          "border-transparent bg-[#E7DED0] text-[#504A40] dark:bg-[#2E2A24] dark:text-[#C3B5A0]",
        warning:
          "border-transparent bg-[#F4E1D2] text-[#6F4F37] dark:bg-[#403827] dark:text-[#DFC794]",
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
