"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  isCurrency?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isCurrency = false,
  isLoading = false,
  className,
}: KPICardProps) {
  const displayValue = isCurrency && typeof value === "number" 
    ? formatCurrency(value) 
    : value;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-32 mt-3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className={cn("overflow-hidden h-full", className)}>
        <CardContent className="px-3 py-3 h-full flex flex-col">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] truncate">{title}</span>
          </div>
          <p className="text-base font-semibold tracking-tight mt-1.5">{displayValue}</p>
          <div className="mt-auto pt-1">
            {trend ? (
              <span
                className={cn(
                  "flex items-center text-[10px] font-medium",
                  trend.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                )}
              >
                {trend.value >= 0 ? (
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                )}
                {Math.abs(trend.value)}%
              </span>
            ) : subtitle ? (
              <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
            ) : (
              <span className="text-[10px] invisible">—</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
