"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  Tags,
  Store,
  Truck,
  Thermometer,
  Users,
  Clock,
  Settings,
  FileSearch,
  Coffee,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore, canManageOffers, canViewReports, canViewAttendance, canViewAuditLogs, canManageUsers, canSubmitFridgeReport } from "@/stores/app-store";

import { Role } from "@/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: (role: Role) => boolean;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Reports", href: "/admin/reports", icon: FileText, permission: canViewReports },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Platforms", href: "/admin/platforms", icon: Truck },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Offers", href: "/admin/offers", icon: Tags, permission: canManageOffers },
  { title: "Branches", href: "/admin/branches", icon: Store },
  { title: "Fridge Stock", href: "/admin/fridge-stock", icon: Thermometer, permission: canSubmitFridgeReport },
  { title: "Attendance", href: "/admin/attendance", icon: Clock, permission: canViewAttendance },
  { title: "Users", href: "/admin/users", icon: Users, permission: canManageUsers },
  { title: "Audit Logs", href: "/admin/audit-logs", icon: FileSearch, permission: canViewAuditLogs },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentRole, sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useAppStore();

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || item.permission(currentRole)
  );

  const NavLink = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.title}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  const sidebarContent = (collapsed: boolean) => (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b px-4", collapsed && "justify-center px-2")}>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Coffee className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold">Caffissimo</span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {filteredNavItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      <div className={cn("p-3", collapsed && "flex justify-center")}>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className="w-full justify-center"
          onClick={() => setSidebarCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex h-screen flex-col border-r bg-card fixed left-0 top-0 z-30"
      >
        {sidebarContent(sidebarCollapsed)}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed left-0 top-0 z-50 h-screen w-64 border-r bg-card lg:hidden"
            >
              <div className="absolute right-2 top-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {sidebarContent(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
