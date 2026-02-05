import { NextRequest, NextResponse } from "next/server";
import { orders } from "@/data/seed";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const branchId = searchParams.get("branchId");
  const source = searchParams.get("source");
  const status = searchParams.get("status");
  const limit = searchParams.get("limit");

  let filteredOrders = [...orders];

  if (branchId) {
    filteredOrders = filteredOrders.filter((o) => o.branchId === branchId);
  }

  if (source) {
    filteredOrders = filteredOrders.filter((o) => o.source === source);
  }

  if (status) {
    filteredOrders = filteredOrders.filter((o) => o.status === status);
  }

  if (limit) {
    filteredOrders = filteredOrders.slice(0, parseInt(limit));
  }

  return NextResponse.json({
    data: filteredOrders,
    total: filteredOrders.length,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Mock creating an order
  const newOrder = {
    id: `order-${Date.now()}`,
    orderNumber: `ORD-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${String(orders.length + 1).padStart(4, "0")}`,
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: newOrder }, { status: 201 });
}
