import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: { label: "Pending", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-500", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500" },
  preparing: { label: "Preparing", bg: "bg-amber-50 dark:bg-amber-600/10", text: "text-amber-600", dot: "bg-amber-600" },
  ready: { label: "Ready", bg: "bg-blue-50 dark:bg-blue-600/10", text: "text-blue-600", dot: "bg-blue-600" },
  completed: { label: "Completed", bg: "bg-emerald-50 dark:bg-emerald-600/10", text: "text-emerald-600", dot: "bg-emerald-600" },
  cancelled: { label: "Cancelled", bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium", config.bg, config.text, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}

export function getStatusLabel(status: OrderStatus): string {
  return statusConfig[status].label;
}
