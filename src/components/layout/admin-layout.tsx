"use client";

import { useAppStore } from "@/stores/app-store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-sidebar">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col transition-all duration-200 min-h-screen",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <div className="flex-1 flex flex-col lg:rounded-2xl bg-background lg:m-3 lg:max-h-[calc(100vh-1.5rem)] lg:overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
