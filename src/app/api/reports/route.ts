import { NextRequest, NextResponse } from "next/server";
import { orders, externalSalesEntries, branches } from "@/data/seed";
import { parseISO, isWithinInterval, startOfDay, format, eachDayOfInterval } from "date-fns";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const branchId = searchParams.get("branchId");
  const groupBy = searchParams.get("groupBy") || "day";

  if (!from || !to) {
    return NextResponse.json({ error: "from and to dates are required" }, { status: 400 });
  }

  const dateRange = {
    from: parseISO(from),
    to: parseISO(to),
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const orderDate = parseISO(order.createdAt);
    const inDateRange = isWithinInterval(orderDate, {
      start: startOfDay(dateRange.from),
      end: dateRange.to,
    });
    const inBranch = !branchId || order.branchId === branchId;
    return inDateRange && inBranch && order.status !== "cancelled";
  });

  // Filter external sales
  const filteredExternalSales = externalSalesEntries.filter((entry) => {
    const entryDate = parseISO(entry.date);
    const inDateRange = isWithinInterval(entryDate, {
      start: startOfDay(dateRange.from),
      end: dateRange.to,
    });
    const inBranch = !branchId || entry.branchId === branchId;
    return inDateRange && inBranch;
  });

  // Calculate totals
  const orderTotal = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const externalTotal = filteredExternalSales.reduce((sum, e) => sum + e.totalSales, 0);

  // Group by day
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  const dailyData = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayOrders = filteredOrders.filter(
      (o) => format(parseISO(o.createdAt), "yyyy-MM-dd") === dayStr
    );
    const dayExternal = filteredExternalSales.filter((e) => e.date === dayStr);

    return {
      date: dayStr,
      pos: dayOrders.filter((o) => o.source === "pos").reduce((s, o) => s + o.total, 0),
      ecommerce: dayOrders.filter((o) => o.source === "ecommerce").reduce((s, o) => s + o.total, 0),
      uberEats: dayOrders.filter((o) => o.source === "uber_eats").reduce((s, o) => s + o.total, 0) +
        dayExternal.filter((e) => e.platform === "uber_eats").reduce((s, e) => s + e.totalSales, 0),
      doordash: dayOrders.filter((o) => o.source === "doordash").reduce((s, o) => s + o.total, 0) +
        dayExternal.filter((e) => e.platform === "doordash").reduce((s, e) => s + e.totalSales, 0),
      orderCount: dayOrders.length,
    };
  });

  return NextResponse.json({
    data: {
      summary: {
        totalSales: orderTotal + externalTotal,
        orderCount: filteredOrders.length,
        avgOrderValue: filteredOrders.length > 0 ? (orderTotal + externalTotal) / filteredOrders.length : 0,
      },
      daily: dailyData,
    },
  });
}
