import { NextRequest, NextResponse } from "next/server";
import { orders } from "@/data/seed";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ data: order });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Mock updating the order
  const updatedOrder = {
    ...order,
    ...body,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: updatedOrder });
}
