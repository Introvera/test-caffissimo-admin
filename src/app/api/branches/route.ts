import { NextRequest, NextResponse } from "next/server";
import { branches } from "@/data/seed";

export async function GET() {
  return NextResponse.json({
    data: branches,
    total: branches.length,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newBranch = {
    id: `branch-${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: newBranch }, { status: 201 });
}
