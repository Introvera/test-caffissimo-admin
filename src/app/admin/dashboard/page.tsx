"use client";

import { useMemo } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Store,
  Globe,
  Car,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, isWithinInterval, parseISO, eachDayOfInterval, startOfDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { SourceBadge } from "@/components/shared/source-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore, canAccessAllBranches } from "@/stores/app-store";
import { orders, externalSalesEntries, branches, products, auditLogs } from "@/data/seed";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Order, OrderSource } from "@/types";

// Chart palette
const COLORS = ["#099699", "#06B6D4", "#64748B", "#94A3B8"];

export default function DashboardPage() {
  const { dateRange, selectedBranchId, currentRole } = useAppStore();

  // Filter orders by date range and branch
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = parseISO(order.createdAt);
      const inDateRange = isWithinInterval(orderDate, {
        start: startOfDay(dateRange.from),
        end: dateRange.to,
      });
      const inBranch = !selectedBranchId || order.branchId === selectedBranchId;
      return inDateRange && inBranch;
    });
  }, [dateRange, selectedBranchId]);

  // Filter external sales
  const filteredExternalSales = useMemo(() => {
    return externalSalesEntries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      const inDateRange = isWithinInterval(entryDate, {
        start: startOfDay(dateRange.from),
        end: dateRange.to,
      });
      const inBranch = !selectedBranchId || entry.branchId === selectedBranchId;
      return inDateRange && inBranch;
    });
  }, [dateRange, selectedBranchId]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const completedOrders = filteredOrders.filter((o) => o.status !== "cancelled");
    const cancelledOrders = filteredOrders.filter((o) => o.status === "cancelled");

    const posSales = completedOrders
      .filter((o) => o.source === "pos")
      .reduce((sum, o) => sum + o.total, 0);

    const ecomSales = completedOrders
      .filter((o) => o.source === "ecommerce")
      .reduce((sum, o) => sum + o.total, 0);

    const uberOrderSales = completedOrders
      .filter((o) => o.source === "uber_eats")
      .reduce((sum, o) => sum + o.total, 0);

    const doordashOrderSales = completedOrders
      .filter((o) => o.source === "doordash")
      .reduce((sum, o) => sum + o.total, 0);

    const uberExternalSales = filteredExternalSales
      .filter((e) => e.platform === "uber_eats")
      .reduce((sum, e) => sum + e.totalSales, 0);

    const doordashExternalSales = filteredExternalSales
      .filter((e) => e.platform === "doordash")
      .reduce((sum, e) => sum + e.totalSales, 0);

    const uberTotalSales = uberOrderSales + uberExternalSales;
    const doordashTotalSales = doordashOrderSales + doordashExternalSales;
    const totalSales = posSales + ecomSales + uberTotalSales + doordashTotalSales;

    const orderCount = completedOrders.length;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    return {
      totalSales,
      posSales,
      ecomSales,
      uberTotalSales,
      doordashTotalSales,
      orderCount,
      cancelledCount: cancelledOrders.length,
      avgOrderValue,
    };
  }, [filteredOrders, filteredExternalSales]);

  // Sales trend data
  const salesTrendData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = filteredOrders.filter(
        (o) =>
          format(parseISO(o.createdAt), "yyyy-MM-dd") === dayStr &&
          o.status !== "cancelled"
      );
      const dayExternal = filteredExternalSales.filter((e) => e.date === dayStr);

      const pos = dayOrders.filter((o) => o.source === "pos").reduce((s, o) => s + o.total, 0);
      const ecom = dayOrders.filter((o) => o.source === "ecommerce").reduce((s, o) => s + o.total, 0);
      const uber = dayOrders.filter((o) => o.source === "uber_eats").reduce((s, o) => s + o.total, 0) +
        dayExternal.filter((e) => e.platform === "uber_eats").reduce((s, e) => s + e.totalSales, 0);
      const doordash = dayOrders.filter((o) => o.source === "doordash").reduce((s, o) => s + o.total, 0) +
        dayExternal.filter((e) => e.platform === "doordash").reduce((s, e) => s + e.totalSales, 0);

      return {
        date: format(day, "MMM d"),
        POS: pos,
        "E-Commerce": ecom,
        "Uber Eats": uber,
        DoorDash: doordash,
        total: pos + ecom + uber + doordash,
      };
    });
  }, [dateRange, filteredOrders, filteredExternalSales]);

  // Sales by source for pie chart - using visible colors for both light/dark mode
  const salesBySource = useMemo(() => {
    return [
      { name: "POS", value: kpis.posSales, color: "#099699" },
      { name: "E-Commerce", value: kpis.ecomSales, color: "#06B6D4" },
      { name: "Uber Eats", value: kpis.uberTotalSales, color: "#64748B" },
      { name: "DoorDash", value: kpis.doordashTotalSales, color: "#94A3B8" },
    ].filter((s) => s.value > 0);
  }, [kpis]);

  // Top products
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; sales: number; count: number }> = {};

    filteredOrders
      .filter((o) => o.status !== "cancelled")
      .forEach((order) => {
        order.items.forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { name: item.productName, sales: 0, count: 0 };
          }
          productSales[item.productId].sales += item.totalPrice;
          productSales[item.productId].count += item.quantity;
        });
      });

    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredOrders]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const recentOrders = [...orders]
      .filter((o) => !selectedBranchId || o.branchId === selectedBranchId)
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        type: "order" as const,
        title: `Order ${o.orderNumber}`,
        subtitle: `${formatCurrency(o.total)} • ${o.items.length} items`,
        source: o.source,
        status: o.status,
        timestamp: o.createdAt,
      }));

    const recentLogs = auditLogs
      .filter((l) => !selectedBranchId || l.branchId === selectedBranchId)
      .slice(0, 3)
      .map((l) => ({
        id: l.id,
        type: "log" as const,
        title: l.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        subtitle: `by ${l.userName}`,
        timestamp: l.createdAt,
      }));

    return [...recentOrders, ...recentLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [selectedBranchId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          selectedBranchId
            ? `${branches.find((b) => b.id === selectedBranchId)?.name} Overview`
            : "Franchise Overview"
        }
      />

      {/* KPI + Sales Trend (left) | Sales by Source (right, full height) */}
      <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
        {/* KPI Cards — 4x1 */}
        <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
          <KPICard
            title="Total Sales"
            value={kpis.totalSales}
            isCurrency
            icon={DollarSign}
            trend={{ value: 12.5, label: "vs last period" }}
            featured
          />
          <KPICard
            title="Orders"
            value={kpis.orderCount}
            icon={ShoppingCart}
            subtitle={`${kpis.cancelledCount} cancelled`}
          />
          <KPICard
            title="Avg Order"
            value={kpis.avgOrderValue}
            isCurrency
            icon={TrendingUp}
          />
          <KPICard
            title="Products Sold"
            value={filteredOrders
              .filter((o) => o.status !== "cancelled")
              .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)}
            icon={Package}
          />
        </div>

        {/* Sales by Source — spans both rows */}
        <Card className="lg:row-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Sales by Source</CardTitle>
            <CardDescription>Revenue distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesBySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {salesBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    wrapperStyle={{ zIndex: 9999 }}
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 9%)",
                      color: "hsl(0 0% 98%)",
                      border: "1px solid hsl(0 0% 20%)",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                      padding: "8px 12px",
                    }}
                    labelStyle={{ color: "hsl(0 0% 65%)" }}
                    itemStyle={{ color: "hsl(0 0% 98%)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {salesBySource.map((source) => (
                <div key={source.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span>{source.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(source.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Trend — below KPI cards */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Daily sales by source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#099699" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#099699" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    wrapperStyle={{ zIndex: 9999 }}
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 9%)",
                      color: "hsl(0 0% 98%)",
                      border: "1px solid hsl(0 0% 20%)",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                      padding: "8px 12px",
                    }}
                    labelStyle={{ color: "hsl(0 0% 65%)" }}
                    itemStyle={{ color: "hsl(0 0% 98%)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#099699"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best sellers by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="grid grid-cols-[20px_1fr_80px_100px] gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                <span>#</span>
                <span>Product</span>
                <span className="text-right">Sold</span>
                <span className="text-right">Revenue</span>
              </div>
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="grid grid-cols-[20px_1fr_80px_100px] gap-3 items-center py-2.5 border-b last:border-0"
                >
                  <span className="text-xs text-muted-foreground">{index + 1}</span>
                  <span className="text-sm font-medium truncate">{product.name}</span>
                  <span className="text-sm text-right text-muted-foreground">{product.count}</span>
                  <span className="text-sm text-right font-medium">{formatCurrency(product.sales)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest orders and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] overflow-y-auto pr-2">
              {(() => {
                // Group activities by date
                const grouped: Record<string, typeof recentActivity> = {};
                recentActivity.forEach((a) => {
                  const day = format(parseISO(a.timestamp), "EEE, MMM d yyyy");
                  if (!grouped[day]) grouped[day] = [];
                  grouped[day].push(a);
                });

                return Object.entries(grouped).map(([date, items]) => (
                  <div key={date} className="mb-6 last:mb-0">
                    <p className="text-xs font-medium text-muted-foreground mb-3 pl-10">{date}</p>
                    <div className="relative">
                      {/* Vertical line — centered on the circles */}
                      <div className="absolute left-[13px] top-0 bottom-0 w-px bg-primary/20" />

                      {items.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 py-3">
                          {/* Circle */}
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 z-10">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-[11px] text-muted-foreground leading-none">
                              {format(parseISO(activity.timestamp), "MMM d 'at' hh:mmaaa")}
                            </p>
                            <p className="text-sm mt-1 leading-snug">
                              <span className="font-semibold text-primary underline decoration-primary/30 underline-offset-2">
                                {activity.type === "order" ? activity.title : activity.subtitle?.replace("by ", "")}
                              </span>
                              {" "}
                              <span className="font-medium">
                                {activity.type === "order"
                                  ? activity.subtitle
                                  : activity.title.toLowerCase()}
                              </span>
                            </p>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
