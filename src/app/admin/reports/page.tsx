"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { parseISO, isWithinInterval, startOfDay, format, eachDayOfInterval } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { useAppStore, canAccessAdmin } from "@/stores/app-store";
import { orders, externalSalesEntries, branches } from "@/data/seed";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { dateRange, selectedBranchId, currentRole } = useAppStore();
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = parseISO(order.createdAt);
      const inDateRange = isWithinInterval(orderDate, {
        start: startOfDay(dateRange.from),
        end: dateRange.to,
      });
      const inBranch = !selectedBranchId || order.branchId === selectedBranchId;
      const matchesSource = sourceFilter === "all" || order.source === sourceFilter;
      const matchesPayment = paymentFilter === "all" || order.paymentMethod === paymentFilter;

      return inDateRange && inBranch && matchesSource && matchesPayment && order.status !== "cancelled";
    });
  }, [dateRange, selectedBranchId, sourceFilter, paymentFilter]);

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

  // Daily summary data
  const dailySummary = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = filteredOrders.filter(
        (o) => format(parseISO(o.createdAt), "yyyy-MM-dd") === dayStr
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
        fullDate: dayStr,
        POS: pos,
        "E-Commerce": ecom,
        "Uber Eats": uber,
        DoorDash: doordash,
        total: pos + ecom + uber + doordash,
        orders: dayOrders.length,
      };
    });
  }, [dateRange, filteredOrders, filteredExternalSales]);

  // Branch comparison data
  const branchComparison = useMemo(() => {
    return branches.map((branch) => {
      const branchOrders = filteredOrders.filter((o) => o.branchId === branch.id);
      const branchExternal = filteredExternalSales.filter((e) => e.branchId === branch.id);

      const totalSales = 
        branchOrders.reduce((s, o) => s + o.total, 0) +
        branchExternal.reduce((s, e) => s + e.totalSales, 0);

      return {
        name: branch.name.replace("Caffissimo", "").trim(),
        branchId: branch.id,
        totalSales,
        orders: branchOrders.length,
        avgOrder: branchOrders.length > 0 ? totalSales / branchOrders.length : 0,
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredOrders, filteredExternalSales]);

  // Totals
  const totals = useMemo(() => {
    const orderTotal = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const externalTotal = filteredExternalSales.reduce((sum, e) => sum + e.totalSales, 0);
    return {
      total: orderTotal + externalTotal,
      orders: filteredOrders.length,
      avg: filteredOrders.length > 0 ? (orderTotal + externalTotal) / filteredOrders.length : 0,
    };
  }, [filteredOrders, filteredExternalSales]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Reports"
        description="Analyze sales performance across branches and sources"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="ecommerce">E-Commerce</SelectItem>
                <SelectItem value="uber_eats">Uber Eats</SelectItem>
                <SelectItem value="doordash">DoorDash</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totals.orders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.avg)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          {canAccessAdmin(currentRole) && (
            <TabsTrigger value="branches">Branch Comparison</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {/* Daily Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Source</CardTitle>
              <CardDescription>Daily breakdown by order source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis tickFormatter={(v) => `$${v}`} className="text-xs" />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "#232323",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "var(--radius)",
                      }}
                      labelStyle={{ color: "#9B9B9B" }}
                    />
                    <Legend />
                    <Bar dataKey="POS" fill="#099699" stackId="a" />
                    <Bar dataKey="E-Commerce" fill="#06B6D4" stackId="a" />
                    <Bar dataKey="Uber Eats" fill="#64748B" stackId="a" />
                    <Bar dataKey="DoorDash" fill="#94A3B8" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">POS</TableHead>
                    <TableHead className="text-right">E-Commerce</TableHead>
                    <TableHead className="text-right">Uber Eats</TableHead>
                    <TableHead className="text-right">DoorDash</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySummary.map((day) => (
                    <TableRow key={day.fullDate}>
                      <TableCell className="font-medium">{day.date}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day.POS)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day["E-Commerce"])}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day["Uber Eats"])}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day.DoorDash)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(day.total)}</TableCell>
                      <TableCell className="text-right">{day.orders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {canAccessAdmin(currentRole) && (
          <TabsContent value="branches" className="space-y-4">
            {/* Branch Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance</CardTitle>
                <CardDescription>Revenue comparison across branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchComparison} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis type="number" tickFormatter={(v) => `$${v}`} className="text-xs" />
                      <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: "#232323",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "var(--radius)",
                        }}
                        labelStyle={{ color: "#9B9B9B" }}
                      />
                      <Bar dataKey="totalSales" fill="#099699" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Branch Ranking Table */}
            <Card>
              <CardHeader>
                <CardTitle>Branch Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Avg Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchComparison.map((branch, index) => (
                      <TableRow key={branch.branchId}>
                        <TableCell>
                          <span className={index === 0 ? "text-primary font-bold" : ""}>
                            #{index + 1}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(branch.totalSales)}</TableCell>
                        <TableCell className="text-right">{branch.orders}</TableCell>
                        <TableCell className="text-right">{formatCurrency(branch.avgOrder)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
