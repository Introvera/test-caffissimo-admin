"use client";

import { useState } from "react";
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
  Thermometer,
  Users,
  Clock,
  Settings,
  FileSearch,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Receipt,
  BoxIcon,
  Building2,
  UserCog,
  Wrench,
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
import { useAppStore, canAccessAdmin } from "@/stores/app-store";
import { Role } from "@/types";

interface NavChild {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  icon: React.ElementType;
  permission?: (role: Role) => boolean;
  children: NavChild[];
}

interface NavSingle {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: (role: Role) => boolean;
}

type NavEntry =
  | (NavSingle & { type: "single" })
  | (NavGroup & { type: "group" });

const navEntries: NavEntry[] = [
  {
    type: "single",
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    permission: canAccessAdmin,
  },
  {
    type: "group",
    title: "Sales",
    icon: Receipt,
    permission: canAccessAdmin,
    children: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { title: "Reports", href: "/admin/reports", icon: FileText },
    ],
  },
  {
    type: "group",
    title: "Catalog",
    icon: BoxIcon,
    permission: canAccessAdmin,
    children: [
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Offers", href: "/admin/offers", icon: Tags },
    ],
  },
  {
    type: "group",
    title: "Operations",
    icon: Building2,
    permission: canAccessAdmin,
    children: [
      { title: "Branches", href: "/admin/branches", icon: Store },
      { title: "Fridge Stock", href: "/admin/fridge-stock", icon: Thermometer },
    ],
  },
  {
    type: "group",
    title: "People",
    icon: UserCog,
    permission: canAccessAdmin,
    children: [
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Attendance", href: "/admin/attendance", icon: Clock },
    ],
  },
  {
    type: "group",
    title: "System",
    icon: Wrench,
    permission: canAccessAdmin,
    children: [
      { title: "Audit Logs", href: "/admin/audit-logs", icon: FileSearch },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    currentRole,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useAppStore();

  // Track which groups are open — auto-open the group containing the active route
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navEntries.forEach((entry) => {
      if (entry.type === "group") {
        const hasActive = entry.children.some(
          (c) => pathname === c.href || pathname.startsWith(`${c.href}/`)
        );
        initial[entry.title] = hasActive;
      }
    });
    return initial;
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredEntries = navEntries.filter(
    (entry) => !entry.permission || entry.permission(currentRole)
  );

  const isChildActive = (child: NavChild) =>
    pathname === child.href || pathname.startsWith(`${child.href}/`);

  const isGroupActive = (group: NavGroup) =>
    group.children.some((c) => isChildActive(c));

  // Single nav link (Dashboard)
  const NavLink = ({
    item,
    collapsed,
    indent = false,
  }: {
    item: NavChild;
    collapsed: boolean;
    indent?: boolean;
  }) => {
    const active = isChildActive(item);
    const Icon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
          active
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground",
          collapsed && "justify-center px-2",
          indent && !collapsed && "pl-9"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
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

  // Collapsible group
  const NavGroupSection = ({
    group,
    collapsed,
  }: {
    group: NavGroup;
    collapsed: boolean;
  }) => {
    const open = openGroups[group.title] ?? false;
    const active = isGroupActive(group);
    const Icon = group.icon;

    if (collapsed) {
      // When sidebar is collapsed, show the group icon — if a child is active, highlight it
      // Clicking opens a tooltip with child links
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-all hover:bg-accent",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="flex flex-col gap-1 p-2"
            sideOffset={8}
          >
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              {group.title}
            </p>
            {group.children.map((child) => {
              const ChildIcon = child.icon;
              const childActive = isChildActive(child);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                    childActive && "font-semibold text-primary"
                  )}
                >
                  <ChildIcon className="h-3.5 w-3.5" />
                  {child.title}
                </Link>
              );
            })}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <div>
        <button
          onClick={() => toggleGroup(group.title)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
            active
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{group.title}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-1 flex flex-col gap-0.5">
                {group.children.map((child) => (
                  <NavLink
                    key={child.href}
                    item={child}
                    collapsed={false}
                    indent
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const sidebarContent = (collapsed: boolean) => (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center border-b px-4",
          collapsed && "justify-center px-2"
        )}
      >
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
          {filteredEntries.map((entry) => {
            if (entry.type === "single") {
              return (
                <NavLink
                  key={entry.href}
                  item={entry}
                  collapsed={collapsed}
                />
              );
            }
            return (
              <NavGroupSection
                key={entry.title}
                group={entry}
                collapsed={collapsed}
              />
            );
          })}
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
        className="hidden lg:flex h-screen flex-col bg-card fixed left-0 top-0 z-30 pt-3"
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
