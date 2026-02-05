"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileSearch,
  Clock,
  User,
  Filter,
} from "lucide-react";
import { parseISO, isWithinInterval, startOfDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore, canViewAuditLogs } from "@/stores/app-store";
import { auditLogs, branches } from "@/data/seed";
import { formatDateTime } from "@/lib/utils";
import { AuditAction } from "@/types";

const actionLabels: Record<AuditAction, string> = {
  price_change: "Price Changed",
  offer_change: "Offer Modified",
  order_cancelled: "Order Cancelled",
  user_created: "User Created",
  user_updated: "User Updated",
  branch_updated: "Branch Updated",
  product_created: "Product Created",
  product_updated: "Product Updated",
  stock_report: "Stock Report",
  attendance_updated: "Attendance Updated",
  settings_updated: "Settings Updated",
};

const actionBadgeVariants: Record<AuditAction, "default" | "secondary" | "destructive" | "outline"> = {
  price_change: "secondary",
  offer_change: "secondary",
  order_cancelled: "destructive",
  user_created: "default",
  user_updated: "outline",
  branch_updated: "outline",
  product_created: "default",
  product_updated: "outline",
  stock_report: "secondary",
  attendance_updated: "outline",
  settings_updated: "secondary",
};

export default function AuditLogsPage() {
  const { currentRole, selectedBranchId, dateRange } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const canView = canViewAuditLogs(currentRole);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const logDate = parseISO(log.createdAt);
      const inDateRange = isWithinInterval(logDate, {
        start: startOfDay(dateRange.from),
        end: dateRange.to,
      });
      const inBranch = !selectedBranchId || log.branchId === selectedBranchId;
      const matchesSearch =
        !searchQuery ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter === "all" || log.action === actionFilter;

      return inDateRange && inBranch && matchesSearch && matchesAction;
    });
  }, [dateRange, selectedBranchId, searchQuery, actionFilter]);

  const getBranchName = (branchId?: string) => {
    if (!branchId) return "-";
    return branches.find((b) => b.id === branchId)?.name.replace("Caffissimo", "").trim() || "Unknown";
  };

  const formatDetails = (details: Record<string, unknown>) => {
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

  if (!canView) {
    return (
      <div className="space-y-6">
        <PageHeader title="Audit Logs" />
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={FileSearch}
              title="Access Denied"
              description="You don't have permission to view audit logs"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track all system changes and activities"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Activity Log</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.entries(actionLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title="No logs found"
              description="Try adjusting your search or filters"
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(log.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionBadgeVariants[log.action]}>
                          {actionLabels[log.action]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {log.userName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {log.entityType}
                          <span className="text-muted-foreground"> #{log.entityId.split("-").pop()}</span>
                        </span>
                      </TableCell>
                      <TableCell>{getBranchName(log.branchId)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-xs text-muted-foreground truncate block">
                          {formatDetails(log.details)}
                        </span>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
