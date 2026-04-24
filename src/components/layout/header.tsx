"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, Bell, Search } from "lucide-react";
import { ThemeToggleSimple } from "@/components/theme-toggle";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangeCalendar } from "@/components/ui/calendar";
import { useAppDispatch, useAppSelector } from "@/stores/store";
import { setSelectedBranchId, setDateRange, setDateRangePreset, setMobileMenuOpen } from "@/stores/slices/uiSlice";
import { logout } from "@/stores/slices/authSlice";
import { canAccessAllBranches } from "@/lib/rbac";
import { branches } from "@/data/seed";
import { format } from "date-fns";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

const roleLabels: Record<UserRole, string> = {
  [UserRole.SuperAdmin]: "Super Admin",
  [UserRole.SuperAdminDeveloper]: "Developer",
  [UserRole.BranchOwner]: "Branch Owner",
  [UserRole.BranchAdmin]: "Branch Admin",
  [UserRole.Supervisor]: "Supervisor",
  [UserRole.Cashier]: "Cashier",
  [UserRole.Employee]: "Employee",
};

const roleBadgeVariants: Record<UserRole, "default" | "secondary" | "outline"> = {
  [UserRole.SuperAdmin]: "default",
  [UserRole.SuperAdminDeveloper]: "default",
  [UserRole.BranchOwner]: "secondary",
  [UserRole.BranchAdmin]: "secondary",
  [UserRole.Supervisor]: "outline",
  [UserRole.Cashier]: "outline",
  [UserRole.Employee]: "outline",
};

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const dispatch = useAppDispatch();
  const {
    selectedBranchId,
    dateRange,
    dateRangePreset,
  } = useAppSelector((state) => state.ui);
  
  const currentRole = useAppSelector((state) => state.auth.user?.role) || UserRole.Cashier;
  const assignedBranchId = useAppSelector((state) => state.auth.user?.branchId) || null;
  const userName = useAppSelector((state) => state.auth.user?.name) || "User";
  const userEmail = useAppSelector((state) => state.auth.user?.email) || "user@caffissimo.com";

  const handleAdminSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/admin/search?q=${encodeURIComponent(q)}`);
    }
  };



  const handleBranchChange = (branchId: string) => {
    dispatch(setSelectedBranchId(branchId === "all" ? null : branchId));
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6 lg:rounded-t-2xl">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => dispatch(setMobileMenuOpen(true))}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Admin-wide search (hidden on mobile) */}
      <form
        onSubmit={handleAdminSearch}
        className="hidden md:flex flex-1 max-w-sm"
      >
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search orders, products, users..."
            className="pl-8 w-full h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search admin"
          />
        </div>
      </form>

      <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
        {/* Date Range Picker */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex h-9 rounded-md border overflow-hidden">
            {(["today", "7d", "30d"] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => dispatch(setDateRangePreset(preset))}
                className={cn(
                  "h-9 px-3 text-xs font-medium transition-colors flex items-center justify-center",
                  dateRangePreset === preset
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {preset === "today" ? "Today" : preset === "7d" ? "7 Days" : "30 Days"}
              </button>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs">
                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <DateRangeCalendar
                from={dateRange.from}
                to={dateRange.to}
                onSelect={(range) => {
                  if (range.from && range.to) {
                    dispatch(setDateRange({ from: range.from, to: range.to }));
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Branch Selector (Super Admin only) */}
        {canAccessAllBranches(currentRole) && (
          <Select
            value={selectedBranchId || "all"}
            onValueChange={handleBranchChange}
          >
            <SelectTrigger className="w-[160px] h-9 hidden sm:flex">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.branchId} value={branch.branchId}>
                  {branch.branchName.replace("Caffissimo", "").trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}



        {/* Theme Toggle */}
        <ThemeToggleSimple />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentRole === UserRole.SuperAdmin ? "SA" : currentRole === UserRole.BranchOwner ? "BO" : "SV"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Badge variant={roleBadgeVariants[currentRole]} className="mr-2">
                {roleLabels[currentRole]}
              </Badge>
              {assignedBranchId && (
                <span className="text-xs text-muted-foreground">
                  {branches.find((b) => b.branchId === assignedBranchId)?.branchName.replace("Caffissimo", "").trim()}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => {
              dispatch(logout());
              router.push("/admin/login");
            }}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
