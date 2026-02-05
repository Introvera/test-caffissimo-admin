"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Eye, EyeOff } from "lucide-react";
import { ThemeToggleSimple } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/stores/app-store";
import { Role } from "@/types";

const DEMO_ACCOUNTS = [
  { email: "alex@caffissimo.com", password: "admin", role: "super_admin" as Role, name: "Super Admin" },
  { email: "maria@caffissimo.com", password: "admin", role: "branch_owner" as Role, name: "Branch Owner" },
  { email: "michael@caffissimo.com", password: "admin", role: "supervisor" as Role, name: "Supervisor" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setAssignedBranchId } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    );

    if (account) {
      setRole(account.role);
      if (account.role !== "super_admin") {
        setAssignedBranchId("branch-1");
      }
      router.push("/admin/dashboard");
    } else {
      setError("Invalid email or password");
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (role: Role) => {
    setRole(role);
    if (role !== "super_admin") {
      setAssignedBranchId("branch-1");
    }
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-zinc-900 dark:to-zinc-800 p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggleSimple />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
            <Coffee className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Caffissimo Admin</CardTitle>
          <CardDescription>
            Sign in to manage your coffee shop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@caffissimo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with demo
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.role}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDemoLogin(account.role)}
              >
                <span className="flex-1 text-left">{account.name}</span>
                <span className="text-xs text-muted-foreground">
                  {account.email}
                </span>
              </Button>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Demo password for all accounts: <code className="bg-muted px-1 rounded">admin</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
