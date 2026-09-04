"use client";

/**
 * AuthContext — global authentication state.
 *
 * Provides:
 *   user            — the currently authenticated User, or null
 *   isLoading       — true while the initial session check runs on mount
 *   isAuthenticated — derived boolean (!!user)
 *   login()         — calls loginApi, stores tokens, sets user
 *   register()      — calls registerApi, stores tokens if returned, sets user
 *   logout()        — calls logoutApi, clears tokens, resets user to null
 *   refreshUser()   — re-fetches the user profile (call after a profile update)
 *
 * Usage:
 *   Wrap the root layout with <AuthProvider>.
 *   Consume state and actions in any Client Component via useAuth().
 *
 *   AuthContext calls getMeApi() on mount when a token is present.
 *     The endpoint used ("/auth/me/") is a placeholder — confirm with backend.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { loginApi, logoutApi, registerApi } from "@/lib/api/authService";
import { getMeApi } from "@/lib/api/customerService";
import { hasValidSession, clearTokens } from "@/lib/auth/tokenStorage";
import type {
  User,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ApiError,
} from "@/lib/types/auth";

/* ── Context shape ──────────────────────────────────────────────────── */

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ───────────────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * On mount: if a valid token exists in cookies, fetch the user profile
   * to hydrate the auth state without requiring a new login.
   */
  useEffect(() => {
    const init = async () => {
      if (!hasValidSession()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await getMeApi();
        setUser(me);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        if (apiErr?.status === 401) {
          clearTokens();
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  /* ── Actions ──────────────────────────────────────────────────────── */

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResponse> => {
      const data = await loginApi(payload);
      setUser(data.user);
      return data;
    },
    [],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<RegisterResponse> => {
      const data = await registerApi(payload);
      // If the backend auto-logs in on register (returns tokens + user), hydrate state.
      // If it requires a separate login step or email verification, user stays null.
      if (data.user && data.access) {
        setUser(data.user);
      }
      return data;
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMeApi();
      setUser(me);
    } catch {
      // Preserve existing user state if the refresh fails
    }
  }, []);

  /* ── Value ──────────────────────────────────────────────────────────── */

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── Hook ───────────────────────────────────────────────────────────── */

/** Consume auth state and actions. Must be used inside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return ctx;
}
