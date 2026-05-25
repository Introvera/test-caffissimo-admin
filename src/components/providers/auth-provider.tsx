"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import Cookies from "js-cookie";
import { auth } from "@/lib/firebase";
import { useAppDispatch, useAppSelector } from "@/stores/store";
import { fetchCurrentUser } from "@/stores/slices/authSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  // Background Firebase ID Token auto-refresher to prevent 1-hour logouts
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const freshToken = await firebaseUser.getIdToken(true); // Force refresh if expired/needed
          Cookies.set("auth_token", freshToken, { expires: 7 });
        } catch (error) {
          console.error("Error auto-refreshing Firebase ID token:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // If we have a token (isAuthenticated) but no user profile rehydrated yet
    if (isAuthenticated && !user && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, user, isLoading]);

  return <>{children}</>;
}

