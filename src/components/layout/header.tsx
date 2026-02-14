"use client";

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
import { Calendar, DateRangeCalendar } from "@/components/ui/calendar";
import { useAppStore, canAccessAllBranches } from "@/stores/app-store";
import { branches } from "@/data/seed";
import { format } from "date-fns";
import { Role } from "@/types";
import { cn } from "@/lib/utils";

const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  branch_owner: "Branch Owner",
  supervisor: "Supervisor",
  cashier: "Cashier",
};

const roleBadgeVariants: Record<Role, "default" | "secondary" | "outline"> = {
  super_admin: "default",
  branch_owner: "secondary",
  supervisor: "outline",
  cashier: "outline",
};

export function Header() {
  const {
    currentRole,
    setRole,
    selectedBranchId,
    setSelectedBranchId,
    assignedBranchId,
    setAssignedBranchId,
    dateRange,
    dateRangePreset,
    setDateRange,
    setDateRangePreset,
    setMobileMenuOpen,
    devMode,
  } = useAppStore();

  const handleRoleChange = (role: Role) => {
    setRole(role);
    // When switching to non-super_admin, assign a branch
    if (role !== "super_admin") {
      setAssignedBranchId("branch-1");
      setSelectedBranchId("branch-1");
    } else {
      setAssignedBranchId(null);
      setSelectedBranchId(null);
    }
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId === "all" ? null : branchId);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search (optional, hidden on mobile) */}
      <div className="hidden md:flex flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders, products..."
            className="pl-8 w-full"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
        {/* Date Range Picker */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex rounded-md border">
            {(["today", "7d", "30d"] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setDateRangePreset(preset)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
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
              <Button variant="outline" size="sm" className="text-xs">
                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <DateRangeCalendar
                from={dateRange.from}
                to={dateRange.to}
                onSelect={(range) => {
                  if (range.from && range.to) {
                    setDateRange({ from: range.from, to: range.to });
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
            <SelectTrigger className="w-[160px] hidden sm:flex">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name.replace("Caffissimo", "").trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Dev Mode Role Switcher */}
        {devMode && (
          <Select value={currentRole} onValueChange={(v) => handleRoleChange(v as Role)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="branch_owner">Branch Owner</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
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
                  {currentRole === "super_admin" ? "SA" : currentRole === "branch_owner" ? "BO" : "SV"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {currentRole === "super_admin" ? "Alex Johnson" : currentRole === "branch_owner" ? "Maria Garcia" : "Michael Brown"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentRole === "super_admin" ? "alex@caffissimo.com" : currentRole === "branch_owner" ? "maria@caffissimo.com" : "michael@caffissimo.com"}
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
                  {branches.find((b) => b.id === assignedBranchId)?.name.replace("Caffissimo", "").trim()}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
