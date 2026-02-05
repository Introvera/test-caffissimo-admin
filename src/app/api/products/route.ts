import { NextRequest, NextResponse } from "next/server";
import { products, branchProducts, categories } from "@/data/seed";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");
  const branchId = searchParams.get("branchId");
  const includeUnavailable = searchParams.get("includeUnavailable") === "true";

  let filteredProducts = [...products];

  if (categoryId) {
    filteredProducts = filteredProducts.filter((p) => p.categoryId === categoryId);
  }

  // Enrich with branch-specific data if branchId provided
  const enrichedProducts = filteredProducts.map((product) => {
    const branchData = branchId
      ? branchProducts.find((bp) => bp.productId === product.id && bp.branchId === branchId)
      : null;

    return {
      ...product,
      category: categories.find((c) => c.id === product.categoryId),
      branchData,
    };
  });

  // Filter by availability if not including unavailable
  const result = branchId && !includeUnavailable
    ? enrichedProducts.filter((p) => p.branchData?.isAvailable)
    : enrichedProducts;

  return NextResponse.json({
    data: result,
    total: result.length,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newProduct = {
    id: `prod-${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: newProduct }, { status: 201 });
}
