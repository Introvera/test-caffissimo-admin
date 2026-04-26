"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import { canAccessAdmin, useAppStore } from "@/stores/app-store";
import { Role } from "@/types";

interface BackendCurrentUser {
  id: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  branchId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedAdmin {
  id: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  backendRole: string;
  role: Role;
  branchId: string | null;
  isActive: boolean;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  appUser: AuthenticatedAdmin | null;
  idToken: string | null;
  isLoading: boolean;
  isAuthorized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<AuthenticatedAdmin>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<AuthenticatedAdmin | null>;
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapBackendRole(role: string): Role | null {
  const normalized = role.replace(/[\s_-]/g, "").toLowerCase();

  switch (normalized) {
    case "superadmin":
    case "superadmindeveloper":
      return "super_admin";
    case "branchowner":
    case "branchadmin":
      return "branch_owner";
    case "supervisor":
      return "supervisor";
    case "cashier":
    case "employee":
      return "cashier";
    default:
      return null;
  }
}

function getFirebaseErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many sign-in attempts. Try again later.";
      case "auth/network-request-failed":
        return "Network error while signing in. Check your connection and try again.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while signing in.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setRole = useAppStore((state) => state.setRole);
  const setAssignedBranchId = useAppStore((state) => state.setAssignedBranchId);
  const setSelectedBranchId = useAppStore((state) => state.setSelectedBranchId);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AuthenticatedAdmin | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearAuthorizationState = useCallback(() => {
    setFirebaseUser(null);
    setAppUser(null);
    setIdToken(null);
    setRole("super_admin");
    setAssignedBranchId(null);
    setSelectedBranchId(null);
  }, [setAssignedBranchId, setRole, setSelectedBranchId]);

  const applyAuthorizationState = useCallback(
    (profile: AuthenticatedAdmin) => {
      setRole(profile.role);

      if (profile.role === "super_admin") {
        setAssignedBranchId(null);
        setSelectedBranchId(null);
        return;
      }

      setAssignedBranchId(profile.branchId);
      setSelectedBranchId(profile.branchId);
    },
    [setAssignedBranchId, setRole, setSelectedBranchId]
  );

  const loadProfile = useCallback(
    async (user: FirebaseUser, forceRefresh = false) => {
      const token = await user.getIdToken(forceRefresh);
      const response = await apiFetch(
        "/api/firebaseuser/current-user",
        undefined,
        token
      );

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Unable to load your admin profile")
        );
      }

      const backendUser = (await response.json()) as BackendCurrentUser;
      const role = mapBackendRole(backendUser.role);

      if (!role || !canAccessAdmin(role)) {
        throw new Error("Your account is not authorized for the admin panel.");
      }

      if (!backendUser.isActive) {
        throw new Error("Your admin account is inactive.");
      }

      const profile: AuthenticatedAdmin = {
        id: backendUser.id,
        firebaseUid: backendUser.firebaseUid,
        firstName: backendUser.firstName,
        lastName: backendUser.lastName,
        email: backendUser.email || user.email || "",
        backendRole: backendUser.role,
        role,
        branchId: backendUser.branchId,
        isActive: backendUser.isActive,
      };

      setFirebaseUser(user);
      setAppUser(profile);
      setIdToken(token);
      setError(null);
      applyAuthorizationState(profile);

      return profile;
    },
    [applyAuthorizationState]
  );

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!isMounted) {
        return;
      }

      setIsLoading(true);

      if (!user) {
        clearAuthorizationState();
        setIsLoading(false);
        return;
      }

      try {
        await loadProfile(user);
      } catch (authError) {
        const message = getFirebaseErrorMessage(authError);

        if (isMounted) {
          setError(message);
          clearAuthorizationState();
        }

        await firebaseSignOut(auth).catch(() => undefined);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [clearAuthorizationState, loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await setPersistence(auth, browserLocalPersistence);
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        return await loadProfile(credential.user, true);
      } catch (signInError) {
        const message = getFirebaseErrorMessage(signInError);
        setError(message);
        clearAuthorizationState();
        await firebaseSignOut(auth).catch(() => undefined);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [clearAuthorizationState, loadProfile]
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await firebaseSignOut(auth);
    clearAuthorizationState();
    setIsLoading(false);
  }, [clearAuthorizationState]);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      clearAuthorizationState();
      return null;
    }

    setIsLoading(true);

    try {
      return await loadProfile(auth.currentUser, true);
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthorizationState, loadProfile]);

  const authFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("You must be signed in to call the API.");
      }

      const token = await user.getIdToken();
      return apiFetch(path, init, token);
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      appUser,
      idToken,
      isLoading,
      isAuthorized: Boolean(appUser && canAccessAdmin(appUser.role)),
      error,
      signIn,
      signOut,
      refreshProfile,
      authFetch,
    }),
    [
      appUser,
      authFetch,
      error,
      firebaseUser,
      idToken,
      isLoading,
      refreshProfile,
      signIn,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
