"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  ShoppingCart,
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
import { parseISO, isWithinInterval, startOfDay } from "date-fns";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { SourceBadge } from "@/components/shared/source-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/stores/app-store";
import { orders, branches } from "@/data/seed";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Order, OrderSource, OrderStatus } from "@/types";

const columnHelper = createColumnHelper<Order>();

function SortIcon({ header }: { header: Header<Order, unknown> }) {
  if (!header.column.getCanSort()) return null;

  const sorted = header.column.getIsSorted();
  if (sorted === "asc") return <ArrowUp className="h-3.5 w-3.5 ml-1" />;
  if (sorted === "desc") return <ArrowDown className="h-3.5 w-3.5 ml-1" />;
  return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
}

export default function OrdersPage() {
  const { dateRange, selectedBranchId } = useAppStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = parseISO(order.createdAt);
      const inDateRange = isWithinInterval(orderDate, {
        start: startOfDay(dateRange.from),
        end: dateRange.to,
      });
      const inBranch = !selectedBranchId || order.branchId === selectedBranchId;
      const matchesSource = sourceFilter === "all" || order.source === sourceFilter;
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return inDateRange && inBranch && matchesSource && matchesStatus;
    });
  }, [dateRange, selectedBranchId, sourceFilter, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("orderNumber", {
        header: "Order",
        cell: (info) => (
          <Link
            href={`/admin/orders/${info.row.original.id}`}
            className="font-normal text-foreground hover:underline"
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("source", {
        header: "Source",
        enableSorting: false,
        cell: (info) => <SourceBadge source={info.getValue()} />,
      }),
      columnHelper.accessor("branchId", {
        header: "Branch",
        enableSorting: false,
        cell: (info) => {
          const branch = branches.find((b) => b.id === info.getValue());
          return (
            <span className="text-sm text-foreground">
              {branch?.name.replace("Caffissimo", "").trim()}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableSorting: false,
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("total", {
        header: "Total",
        cell: (info) => (
          <span className="font-medium text-foreground">{formatCurrency(info.getValue())}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/orders/${info.row.original.id}`}>
                  View
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredOrders,
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
        title="Orders"
        description="Manage orders from all sources"
        actions={
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-auto h-9 gap-1.5 rounded-lg border-border/80 bg-background px-3.5 text-sm font-medium shadow-none">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="pos">In Store</SelectItem>
              <SelectItem value="ecommerce">E-Commerce</SelectItem>
              <SelectItem value="uber_eats">Uber Eats</SelectItem>
              <SelectItem value="doordash">DoorDash</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-auto h-9 gap-1.5 rounded-lg border-border/80 bg-background px-3.5 text-sm font-medium shadow-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 w-[220px] h-9 bg-background rounded-lg"
          />
        </div>
      </div>

      <div>
        <div className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ShoppingCart}
                title="No orders found"
                description="Try adjusting your filters or date range"
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
                  {" "}orders
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
