import { NextRequest, NextResponse } from "next/server";
import { users } from "@/data/seed";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const branchId = searchParams.get("branchId");
  const role = searchParams.get("role");

  let filteredUsers = [...users];

  if (branchId) {
    filteredUsers = filteredUsers.filter((u) => u.branchId === branchId);
  }

  if (role) {
    filteredUsers = filteredUsers.filter((u) => u.role === role);
  }

  return NextResponse.json({
    data: filteredUsers,
    total: filteredUsers.length,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newUser = {
    id: `user-${Date.now()}`,
    ...body,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: newUser }, { status: 201 });
}
