"use client";

/**
 * AuthContext — global authentication state.
 * Fixed to match actual backend:
 *  - Uses getProfileApi (GET /auth/user/profile) instead of getMeApi
 *  - Login returns { access_token, refresh_token } not { access, refresh }
 *  - Register does NOT auto-login (backend requires email confirmation first)
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginApi,
  logoutApi,
  registerApi,
  confirmEmailApi,
  resendOtpApi,
  getProfileApi,
} from "@/lib/api/authService";
import { hasValidSession, clearTokens } from "@/lib/auth/tokenStorage";
import type {
  User,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ConfirmEmailPayload,
  ResendOtpPayload,
  ApiError,
} from "@/lib/types/auth";

/* ── Context shape ──────────────────────────────────────────────────── */

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  confirmEmail: (payload: ConfirmEmailPayload) => Promise<void>;
  resendOtp: (payload: ResendOtpPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ───────────────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!hasValidSession()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await getProfileApi();
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
      // loginApi stores the tokens and returns { access_token, refresh_token }
      const data = await loginApi(payload);
      // Fetch user profile after login
      try {
        const me = await getProfileApi();
        setUser(me);
      } catch {
        // Profile fetch failed — tokens are stored, user can retry
      }
      return data;
    },
    [],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<RegisterResponse> => {
      // Backend always requires email confirmation — no auto-login
      const data = await registerApi(payload);
      return data;
    },
    [],
  );

  const confirmEmail = useCallback(
    async (payload: ConfirmEmailPayload): Promise<void> => {
      await confirmEmailApi(payload);
    },
    [],
  );

  const resendOtp = useCallback(
    async (payload: ResendOtpPayload): Promise<void> => {
      await resendOtpApi(payload);
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getProfileApi();
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
    confirmEmail,
    resendOtp,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── Hook ───────────────────────────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return ctx;
}
