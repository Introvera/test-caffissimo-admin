"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Clock,
  Download,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { parseISO, format, isWithinInterval, startOfDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useAppStore, canViewAttendance, canAccessAllBranches } from "@/stores/app-store";
import { attendanceEntries, branches, users } from "@/data/seed";
import { formatDate } from "@/lib/utils";
import { AttendanceStatus } from "@/types";

const statusConfig: Record<AttendanceStatus, { label: string; variant: "success" | "destructive" | "warning" | "secondary"; icon: typeof CheckCircle }> = {
  present: { label: "Present", variant: "success", icon: CheckCircle },
  absent: { label: "Absent", variant: "destructive", icon: XCircle },
  late: { label: "Late", variant: "warning", icon: AlertCircle },
  half_day: { label: "Half Day", variant: "secondary", icon: Clock },
};

export default function AttendancePage() {
  const { currentRole, selectedBranchId, assignedBranchId, dateRange } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const effectiveBranchId = selectedBranchId || assignedBranchId;
  const canView = canViewAttendance(currentRole);

  const filteredAttendance = useMemo(() => {
    return attendanceEntries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      const inDateRange = isWithinInterval(entryDate, {
        start: startOfDay(dateRange.from),
        end: dateRange.to,
      });
      const inBranch = !effectiveBranchId || entry.branchId === effectiveBranchId;
      const matchesSearch =
        !searchQuery ||
        entry.userName.toLowerCase().includes(searchQuery.toLowerCase());

      return inDateRange && inBranch && matchesSearch;
    });
  }, [dateRange, effectiveBranchId, searchQuery]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof filteredAttendance> = {};
    filteredAttendance.forEach((entry) => {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredAttendance]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter((e) => e.status === "present").length;
    const absent = filteredAttendance.filter((e) => e.status === "absent").length;
    const late = filteredAttendance.filter((e) => e.status === "late").length;
    return { total, present, absent, late };
  }, [filteredAttendance]);

  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.name.replace("Caffissimo", "").trim() || "Unknown";
  };

  const staffUsers = users.filter((u) => u.role === "cashier" || u.role === "supervisor");

  if (!canView) {
    return (
      <div className="space-y-6">
        <PageHeader title="Attendance" />
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Clock}
              title="Access Denied"
              description="You don't have permission to view attendance records"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Track employee attendance records"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Attendance Entry</DialogTitle>
                  <DialogDescription>
                    Record attendance for an employee
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select defaultValue="present">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="half_day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Check In</Label>
                      <Input type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Check Out</Label>
                      <Input type="time" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setAddDialogOpen(false)}>
                    Add Entry
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-muted p-2">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[#E7DED0] p-2">
                <CheckCircle className="h-5 w-5 text-[#504A40]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[#F4E1D2] p-2">
                <XCircle className="h-5 w-5 text-[#6F4F37]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[#E8BB9F] p-2">
                <AlertCircle className="h-5 w-5 text-[#463020]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Attendance Records</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {groupedByDate.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No attendance records"
              description="Add attendance entries to track employee presence"
            />
          ) : (
            <div className="space-y-6">
              {groupedByDate.map(([date, entries]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(date)}
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        {canAccessAllBranches(currentRole) && <TableHead>Branch</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => {
                        const config = statusConfig[entry.status];
                        const Icon = config.icon;
                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">
                              {entry.userName}
                            </TableCell>
                            {canAccessAllBranches(currentRole) && (
                              <TableCell>{getBranchName(entry.branchId)}</TableCell>
                            )}
                            <TableCell>
                              <Badge variant={config.variant}>
                                <Icon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.checkIn || "-"}</TableCell>
                            <TableCell>{entry.checkOut || "-"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
