"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useAppStore } from "@/stores/app-store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

function HeaderFallback() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6 lg:rounded-t-2xl" />
  );
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center">
        <p className="text-sm font-medium">Checking access...</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Verifying your admin session
        </p>
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, isAuthorized, isLoading } = useAuth();
  const { sidebarCollapsed } = useAppStore();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoading || isLoginPage || (firebaseUser && isAuthorized)) {
      return;
    }

    const redirectPath =
      pathname && pathname !== "/admin"
        ? `?redirect=${encodeURIComponent(pathname)}`
        : "";

    router.replace(`/admin/login${redirectPath}`);
  }, [firebaseUser, isAuthorized, isLoading, isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !firebaseUser || !isAuthorized) {
    return <AuthLoading />;
  }

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
          <Suspense fallback={<HeaderFallback />}>
            <Header />
          </Suspense>
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
