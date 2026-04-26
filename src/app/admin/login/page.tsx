"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggleSimple } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getRedirectPath() {
  if (typeof window === "undefined") {
    return "/admin/dashboard";
  }

  const redirect = new URLSearchParams(window.location.search).get("redirect");

  if (!redirect || redirect === "/admin/login" || !redirect.startsWith("/admin")) {
    return "/admin/dashboard";
  }

  return redirect;
}

export default function LoginPage() {
  const router = useRouter();
  const { error: authError, firebaseUser, isAuthorized, isLoading, signIn } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && firebaseUser && isAuthorized) {
      router.replace(getRedirectPath());
    }
  }, [firebaseUser, isAuthorized, isLoading, router]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      router.replace(getRedirectPath());
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Unable to sign in."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonDisabled = isSubmitting || isLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggleSimple />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-24 items-center justify-center rounded-xl bg-zinc-900 p-3 dark:bg-transparent dark:p-0">
            <img
              src="/logo.jpg"
              alt="Caffissimo"
              className="h-24 w-auto max-w-[320px] object-contain opacity-95 dark:mix-blend-lighten"
            />
          </div>
          <CardTitle className="text-2xl">Caffissimo Admin</CardTitle>
          <CardDescription>Sign in with your admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@caffissimo.com"
                autoComplete="email"
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
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            <Button type="submit" className="w-full" disabled={buttonDisabled}>
              {buttonDisabled ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
