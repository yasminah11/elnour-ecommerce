/**
 * Authentication service.
 * Routes matched to the backend auth controller.
 *
 * Backend endpoints (from the images):
 *   POST /auth/signin          — signIn controller
 *   POST /auth/signup          — signUp controller
 *   POST /auth/confirm-email   — confirmeEmail controller
 *   POST /auth/resend-otp      — resendOtp controller
 *   POST /auth/logout          — logout (clears refresh token)
 *   POST /auth/token/refresh   — token refresh
 */

import { apiPost, apiGet, apiDelete } from "@/lib/api/apiClient";
import {
  setTokens,
  clearTokens,
  getRefreshToken,
} from "@/lib/auth/tokenStorage";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ConfirmEmailPayload,
  ResendOtpPayload,
  UpdatePasswordPayload,
  AuthProvider,
  LinkProviderPayload,
  LinkedProvider,
} from "@/lib/types/auth";

/* ── Sign In ─────────────────────────────────────────────────────────── */

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const data = await apiPost<LoginResponse>("/auth/signin", payload, {
    skipAuth: true,
  });
  setTokens(data.access, data.refresh);
  return data;
}

/* ── Sign Up ─────────────────────────────────────────────────────────── */

export async function registerApi(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const data = await apiPost<RegisterResponse>("/auth/signup", payload, {
    skipAuth: true,
  });
  // Backend may auto-login after signup or require email confirmation first
  if (data.access && data.refresh) {
    setTokens(data.access, data.refresh);
  }
  return data;
}

/* ── Confirm Email (OTP) ─────────────────────────────────────────────── */

export async function confirmEmailApi(
  payload: ConfirmEmailPayload,
): Promise<void> {
  await apiPost("/auth/confirm-email", payload, { skipAuth: true });
}

/* ── Resend OTP ──────────────────────────────────────────────────────── */

export async function resendOtpApi(payload: ResendOtpPayload): Promise<void> {
  await apiPost("/auth/resend-otp", payload, { skipAuth: true });
}

/* ── Update Password ─────────────────────────────────────────────────── */

export async function updatePasswordApi(
  payload: UpdatePasswordPayload,
): Promise<void> {
  await apiPost("/auth/update-password", payload);
}

/* ── Logout ──────────────────────────────────────────────────────────── */

export async function logoutApi(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await apiPost("/auth/logout", { refresh: refreshToken });
    }
  } catch {
    // Swallow — tokens are cleared regardless
  } finally {
    clearTokens();
  }
}

/* ── Linked Providers (Google OAuth) ─────────────────────────────────── */

export async function getLinkedProvidersApi(): Promise<LinkedProvider[]> {
  return apiGet<LinkedProvider[]>("/auth/linked-providers");
}

export async function linkProviderApi(
  payload: LinkProviderPayload,
): Promise<LinkedProvider> {
  return apiPost<LinkedProvider>("/auth/linked-providers", payload);
}

export async function unlinkProviderApi(provider: AuthProvider): Promise<void> {
  await apiDelete(`/auth/linked-providers/${provider}`);
}
