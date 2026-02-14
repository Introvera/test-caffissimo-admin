"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
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
  featured?: boolean;
  sparkline?: number[];
  className?: string;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 40;
  const w = 80;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polygon points={areaPoints} fill={color} opacity={0.15} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isCurrency = false,
  isLoading = false,
  featured = false,
  sparkline,
  className,
}: KPICardProps) {
  const displayValue = isCurrency && typeof value === "number" 
    ? formatCurrency(value) 
    : value;

  if (isLoading) {
    return (
      <div className={cn("rounded-lg border bg-card p-4", className)}>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-28 mt-2" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "rounded-lg border p-4 relative overflow-hidden",
          featured
            ? "bg-[#232323] text-white border-[#232323]"
            : "bg-card text-card-foreground",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className={cn(
              "flex items-center gap-1.5",
              featured ? "text-white/60" : "text-muted-foreground"
            )}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">{title}</span>
            </div>
            <p className="text-xl font-semibold tracking-tight mt-2">{displayValue}</p>
            <div className="mt-1.5">
              {trend ? (
                <span
                  className={cn(
                    "flex items-center text-[11px] font-medium",
                    featured
                      ? trend.value >= 0 ? "text-emerald-400" : "text-red-400"
                      : trend.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                  )}
                >
                  {trend.value >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(trend.value)}%
                  {trend.label && (
                    <span className={cn(
                      "ml-1",
                      featured ? "text-white/40" : "text-muted-foreground"
                    )}>
                      {trend.label}
                    </span>
                  )}
                </span>
              ) : (
                <p className={cn(
                  "text-[11px]",
                  featured ? "text-white/40" : "text-muted-foreground"
                )}>
                  {subtitle || "\u00A0"}
                </p>
              )}
            </div>
          </div>
          {sparkline && sparkline.length > 1 && (
            <MiniSparkline
              data={sparkline}
              color={featured ? "#099699" : "#099699"}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
