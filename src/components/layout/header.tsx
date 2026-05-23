"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, Search, Filter } from "lucide-react";
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
import { setSelectedBranchId, setDateRange, setDateRangePreset, setMobileMenuOpen, setRole } from "@/stores/slices/uiSlice";
import { logout, setUserRole } from "@/stores/slices/authSlice";
import { canAccessAllBranches } from "@/lib/rbac";
import { useGetBranchesQuery } from "@/stores/api/branchApi";
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
    currentRole: uiRole,
  } = useAppSelector((state) => state.ui);
  
  const authRole = useAppSelector((state) => state.auth.user?.role);
  const currentRole = uiRole || authRole || UserRole.Cashier;
  
  const assignedBranchId = useAppSelector((state) => state.auth.user?.branchId) || null;
  const userName = useAppSelector((state) => state.auth.user?.name) || "User";
  const userEmail = useAppSelector((state) => state.auth.user?.email) || "user@caffissimo.com";

  // Live branch list from API (only fetched when the user is a super admin)
  const { data: branchesData } = useGetBranchesQuery(
    { pageSize: 100 },
    { skip: !canAccessAllBranches(currentRole) }
  );
  const branches = branchesData?.items ?? [];

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

  const handleRoleChange = (role: string) => {
    const newRole = role as UserRole;
    dispatch(setRole(newRole));
    dispatch(setUserRole(newRole));
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

      {/* Left Side: Branch Selector */}
      <div className="flex flex-1 items-center gap-2">
        {/* Branch Selector (Super Admin only) */}
        {canAccessAllBranches(currentRole) && (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground mr-1">Store :</h2>
            <Select
              value={selectedBranchId || "all"}
              onValueChange={handleBranchChange}
            >
              <SelectTrigger className="w-[140px] h-9">
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
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 md:gap-4">
        {/* Date Range Picker */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="inline-flex h-9 items-center justify-center rounded-md bg-muted/30 p-1 text-muted-foreground">
            {(["12m", "30d", "7d", "24h"] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => dispatch(setDateRangePreset(preset))}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  dateRangePreset === preset
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground"
                )}
              >
                {preset === "12m" ? "12 months" : preset === "30d" ? "30 days" : preset === "7d" ? "7 days" : "24 hours"}
              </button>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-md text-foreground px-4 shadow-sm hover:bg-muted/50">
                <Filter className="w-3.5 h-3.5 mr-2" />
                {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
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

        {/* Role Switcher (Temporary for development) 
        <div className="hidden lg:flex items-center gap-2 border-r pr-2 mr-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Role Switch:</span>
          <Select
            value={currentRole}
            onValueChange={handleRoleChange}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-muted/50 border-none">
              <SelectValue placeholder="Change Role" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role} className="text-xs">
                  {roleLabels[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        */}

        {/* Theme Toggle */}
        <ThemeToggleSimple />

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
                  {branches.find((b: any) => b.branchId === assignedBranchId)?.branchName.replace("Caffissimo", "").trim()}
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
