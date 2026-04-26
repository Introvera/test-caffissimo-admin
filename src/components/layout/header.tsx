"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
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

function formatBackendRole(role: string) {
  return role
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { appUser, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
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

  // Sync header search input with URL when on search page
  useEffect(() => {
    if (pathname === "/admin/search") {
      const q = searchParams.get("q") ?? "";
      const timeout = window.setTimeout(() => setSearchQuery(q), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [pathname, searchParams]);

  const handleAdminSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/admin/search?q=${encodeURIComponent(q)}`);
    }
  };

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

  const handleLogout = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  const profileName = appUser
    ? `${appUser.firstName} ${appUser.lastName}`.trim()
    : "";
  const displayName = profileName || "Admin User";
  const displayEmail = appUser?.email || "Signed in";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AD";
  const devRoleSwitcherEnabled =
    process.env.NEXT_PUBLIC_ENABLE_DEV_ROLE_SWITCHER === "true";
  const roleDisplayLabel = appUser?.backendRole
    ? formatBackendRole(appUser.backendRole)
    : roleLabels[currentRole];
  const assignedBranchName = assignedBranchId
    ? branches
        .find((branch) => branch.id === assignedBranchId)
        ?.name.replace("Caffissimo", "")
        .trim()
    : null;

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6 lg:rounded-t-2xl">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
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
                onClick={() => setDateRangePreset(preset)}
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
            <SelectTrigger className="w-[160px] h-9 hidden sm:flex">
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
        {devMode && devRoleSwitcherEnabled && (
          <Select value={currentRole} onValueChange={(v) => handleRoleChange(v as Role)}>
            <SelectTrigger className="w-[140px] h-9">
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
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {displayEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Badge variant={roleBadgeVariants[currentRole]} className="mr-2">
                {roleDisplayLabel}
              </Badge>
              {assignedBranchId && (
                <span className="text-xs text-muted-foreground">
                  {assignedBranchName || "Assigned branch"}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onSelect={(event) => {
                event.preventDefault();
                void handleLogout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
