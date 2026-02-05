import { Badge } from "@/components/ui/badge";
import { OrderSource } from "@/types";
import { Store, Globe, Car } from "lucide-react";

interface SourceBadgeProps {
  source: OrderSource;
  className?: string;
}

const sourceConfig: Record<
  OrderSource,
  { label: string; variant: "pos" | "ecommerce" | "uber" | "doordash"; icon: React.ElementType }
> = {
  pos: { label: "POS", variant: "pos", icon: Store },
  ecommerce: { label: "E-Commerce", variant: "ecommerce", icon: Globe },
  uber_eats: { label: "Uber Eats", variant: "uber", icon: Car },
  doordash: { label: "DoorDash", variant: "doordash", icon: Car },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

export function getSourceLabel(source: OrderSource): string {
  return sourceConfig[source].label;
}
