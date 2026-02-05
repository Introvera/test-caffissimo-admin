import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, DateRange, DateRangePreset } from "@/types";
import { subDays, startOfDay, endOfDay } from "date-fns";

interface AppState {
  // Role (dev mode role switcher)
  currentRole: Role;
  setRole: (role: Role) => void;

  // Current user's assigned branch (for branch_owner/supervisor/cashier)
  assignedBranchId: string | null;
  setAssignedBranchId: (branchId: string | null) => void;

  // Selected branch filter (for viewing data)
  selectedBranchId: string | null;
  setSelectedBranchId: (branchId: string | null) => void;

  // Date range
  dateRange: DateRange;
  dateRangePreset: DateRangePreset;
  setDateRange: (range: DateRange) => void;
  setDateRangePreset: (preset: DateRangePreset) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Dev mode
  devMode: boolean;
  setDevMode: (enabled: boolean) => void;
}

const getDefaultDateRange = (preset: DateRangePreset): DateRange => {
  const today = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(today), to: endOfDay(today) };
    case "7d":
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    case "30d":
      return { from: startOfDay(subDays(today, 29)), to: endOfDay(today) };
    default:
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Default to super_admin for dev mode
      currentRole: "super_admin",
      setRole: (role) => set({ currentRole: role }),

      assignedBranchId: null,
      setAssignedBranchId: (branchId) => set({ assignedBranchId: branchId }),

      selectedBranchId: null,
      setSelectedBranchId: (branchId) => set({ selectedBranchId: branchId }),

      dateRange: getDefaultDateRange("7d"),
      dateRangePreset: "7d",
      setDateRange: (range) => set({ dateRange: range, dateRangePreset: "custom" }),
      setDateRangePreset: (preset) =>
        set({ dateRangePreset: preset, dateRange: getDefaultDateRange(preset) }),

      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      devMode: true,
      setDevMode: (enabled) => set({ devMode: enabled }),
    }),
    {
      name: "caffissimo-admin-storage",
      partialize: (state) => ({
        currentRole: state.currentRole,
        assignedBranchId: state.assignedBranchId,
        sidebarCollapsed: state.sidebarCollapsed,
        devMode: state.devMode,
      }),
    }
  )
);

// RBAC helpers
export const canAccessAllBranches = (role: Role): boolean => {
  return role === "super_admin";
};

export const canManageUsers = (role: Role): boolean => {
  return role === "super_admin" || role === "branch_owner";
};

export const canManageOffers = (role: Role): boolean => {
  return role === "super_admin" || role === "branch_owner";
};

export const canManageProducts = (role: Role): boolean => {
  return role === "super_admin" || role === "branch_owner" || role === "supervisor";
};

export const canManageBranch = (role: Role): boolean => {
  return role === "super_admin" || role === "branch_owner" || role === "supervisor";
};

export const canViewReports = (role: Role): boolean => {
  return role === "super_admin" || role === "branch_owner";
};

export const canCancelOrders = (role: Role): boolean => {
  return role === "super_admin" || role === "branch_owner";
};

export const canSubmitFridgeReport = (role: Role): boolean => {
  return role === "super_admin" || role === "branch_owner" || role === "supervisor";
};

export const canViewAttendance = (role: Role): boolean => {
  return role === "super_admin" || role === "branch_owner";
};

export const canViewAuditLogs = (role: Role): boolean => {
  return role === "super_admin" || role === "branch_owner";
};

export const canManageSettings = (role: Role): boolean => {
  return role === "super_admin";
};

export const canCompareBranches = (role: Role): boolean => {
  return role === "super_admin";
};
