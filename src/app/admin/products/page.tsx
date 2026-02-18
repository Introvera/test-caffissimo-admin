"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  Edit,
  Eye,
  EyeOff,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  Header,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore, canManageProducts } from "@/stores/app-store";
import { products, categories, branchProducts } from "@/data/seed";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";

interface ProductRow extends Product {
  categoryName: string;
  price: number | null;
  isAvailable: boolean;
  isVisible: boolean;
}

const columnHelper = createColumnHelper<ProductRow>();

function SortIcon({ header }: { header: Header<ProductRow, unknown> }) {
  if (!header.column.getCanSort()) return null;

  const sorted = header.column.getIsSorted();
  if (sorted === "asc") return <ArrowUp className="h-3.5 w-3.5 ml-1" />;
  if (sorted === "desc") return <ArrowDown className="h-3.5 w-3.5 ml-1" />;
  return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
}

export default function ProductsPage() {
  const { currentRole, selectedBranchId, assignedBranchId } = useAppStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const effectiveBranchId = selectedBranchId || assignedBranchId || "branch-1";

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        return categoryFilter === "all" || product.categoryId === categoryFilter;
      })
      .map((product): ProductRow => {
        const branchData = branchProducts.find(
          (bp) => bp.productId === product.id && bp.branchId === effectiveBranchId
        );
        return {
          ...product,
          categoryName:
            categories.find((c) => c.id === product.categoryId)?.name || "Unknown",
          price: branchData?.price ?? null,
          isAvailable: branchData?.isAvailable ?? false,
          isVisible: branchData?.isVisible ?? false,
        };
      });
  }, [categoryFilter, effectiveBranchId]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Product",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Link
                href={`/admin/products/${info.row.original.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {info.getValue()}
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {info.row.original.description}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("categoryName", {
        header: "Category",
        enableSorting: false,
        cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => (
          <span className="font-medium text-foreground">
            {info.getValue() !== null ? formatCurrency(info.getValue()!) : "N/A"}
          </span>
        ),
      }),
      columnHelper.accessor("isAvailable", {
        header: "Availability",
        enableSorting: false,
        cell: (info) => (
          <Badge variant={info.getValue() ? "success" : "destructive"}>
            {info.getValue() ? "In Stock" : "Out of Stock"}
          </Badge>
        ),
      }),
      columnHelper.accessor("isVisible", {
        header: "Visible",
        enableSorting: false,
        cell: (info) => (
          <Switch
            checked={info.getValue()}
            disabled={!canManageProducts(currentRole)}
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => {
          const row = info.row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/products/${row.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Update Price
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {row.isVisible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Product
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Product
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [currentRole]
  );

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog and pricing"
        actions={
          canManageProducts(currentRole) && (
            <Link href="/admin/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          )
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-auto h-9 gap-1.5 rounded-lg border-border/80 bg-background px-3.5 text-sm font-medium shadow-none">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 w-[220px] h-9 bg-background rounded-lg"
          />
        </div>
      </div>

      <div>
        <div className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Package}
                title="No products found"
                description="Try adjusting your search or filters"
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/60">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="inline-flex items-center">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                            <SortIcon header={header} />
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {pageIndex * pageSize + 1}
                  </span>
                  {" "}to{" "}
                  <span className="font-medium text-foreground">
                    {Math.min((pageIndex + 1) * pageSize, totalRows)}
                  </span>
                  {" "}of{" "}
                  <span className="font-medium text-foreground">{totalRows}</span>
                  {" "}products
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => {
                    let pageNum: number;
                    const totalPages = table.getPageCount();
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (pageIndex < 3) {
                      pageNum = i;
                    } else if (pageIndex > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = pageIndex - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageIndex === pageNum ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0 text-xs"
                        onClick={() => table.setPageIndex(pageNum)}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
