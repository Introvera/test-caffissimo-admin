import { cn } from "@/lib/utils";
import { OrderSource } from "@/types";

interface SourceBadgeProps {
  source: OrderSource;
  className?: string;
}

const sourceConfig: Record<
  OrderSource,
  { label: string; colors: string }
> = {
  pos: { label: "In Store", colors: "bg-teal-50 text-teal-600 dark:bg-teal-600/10" },
  ecommerce: { label: "E-Commerce", colors: "bg-blue-50 text-blue-500 dark:bg-blue-500/10" },
  uber_eats: { label: "Uber Eats", colors: "bg-slate-50 text-slate-500 dark:bg-slate-500/10" },
  doordash: { label: "DoorDash", colors: "bg-orange-50 text-orange-500 dark:bg-orange-500/10" },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const config = sourceConfig[source];

  return (
    <span className={cn("inline-block rounded-md px-2.5 py-1 text-xs font-medium", config.colors, className)}>
      {config.label}
    </span>
  );
}

export function getSourceLabel(source: OrderSource): string {
  return sourceConfig[source].label;
}
