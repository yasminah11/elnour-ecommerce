"use client";

/**
 * AuthContext — global authentication state.
 * Updated to match the backend field names (firstName, lastName, cPassword)
 * and new endpoints (signin, signup, confirm-email, resend-otp).
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
} from "@/lib/api/authService";
import { getMeApi } from "@/lib/api/customerService";
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
      // Auto-login if backend returns tokens
      if (data.user && data.access) {
        setUser(data.user);
      }
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
