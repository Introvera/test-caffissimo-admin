"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/store";
import { fetchCurrentUser } from "@/stores/slices/authSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  useEffect(() => {
    // If we have a token (isAuthenticated) but no user profile rehydrated yet
    if (isAuthenticated && !user && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, user, isLoading]);

  return <>{children}</>;
}
