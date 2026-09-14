/**
 * Authentication service — corrected to match ACTUAL backend endpoints.
 *
 * Backend routes (app.controller.js → /auth/user prefix):
 *   POST   /auth/user/sign-up          — signUp
 *   PATCH  /auth/user/confirm-email    — confirmeEmail
 *   POST   /auth/user/resend-otp       — resendOtp
 *   POST   /auth/user/sign-in          — signIn
 *   GET    /auth/user/refresh-token    — refresh_token (header: authentication)
 *   POST   /auth/user/logout           — logout (requires auth)
 *   PATCH  /auth/user/forget-password  — forgetPassword
 *   PATCH  /auth/user/reset-password   — resetPassword
 *   PATCH  /auth/user/update-password  — update_Password (requires auth)
 *   GET    /auth/user/profile          — getProfile (requires auth)
 *   PATCH  /auth/user/profile          — update_Profile (requires auth)
 *   POST   /auth/user/address          — addAddress (requires auth)
 *   PATCH  /auth/user/address/:id      — updateAddress (requires auth)
 *   DELETE /auth/user/address/:id      — deleteAddress (requires auth)
 */

import { apiPost, apiGet, apiPatch, apiDelete } from "@/lib/api/apiClient";
import { setTokens, clearTokens } from "@/lib/auth/tokenStorage";

import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ConfirmEmailPayload,
  ResendOtpPayload,
  UpdatePasswordPayload,
  User,
  UpdateProfilePayload,
  AddAddressPayload,
  UpdateAddressPayload,
  Address,
} from "@/lib/types/auth";

/* ── Sign In ─────────────────────────────────────────────────────────── */

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  // Returns { message, data: { access_token, refresh_token } }
  const data = await apiPost<LoginResponse>("/auth/user/sign-in", payload, {
    skipAuth: true,
  });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

/* ── Sign Up ─────────────────────────────────────────────────────────── */

export async function registerApi(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  // Returns { message: "account created, please confirm your email", data: user }
  const data = await apiPost<RegisterResponse>("/auth/user/sign-up", payload, {
    skipAuth: true,
  });
  return data;
}

/* ── Confirm Email (OTP) ─────────────────────────────────────────────── */

export async function confirmEmailApi(
  payload: ConfirmEmailPayload,
): Promise<void> {
  await apiPatch("/auth/user/confirm-email", payload, { skipAuth: true });
}

/* ── Resend OTP ──────────────────────────────────────────────────────── */

export async function resendOtpApi(payload: ResendOtpPayload): Promise<void> {
  await apiPost("/auth/user/resend-otp", payload, { skipAuth: true });
}

/* ── Update Password ─────────────────────────────────────────────────── */

export async function updatePasswordApi(
  payload: UpdatePasswordPayload,
): Promise<void> {
  await apiPatch("/auth/user/update-password", payload);
}

/* ── Logout ──────────────────────────────────────────────────────────── */

export async function logoutApi(): Promise<void> {
  try {
    await apiPost("/auth/user/logout", {});
  } catch {
    // Swallow — tokens are cleared regardless
  } finally {
    clearTokens();
  }
}

/* ── Get Profile ─────────────────────────────────────────────────────── */

export async function getProfileApi(): Promise<User> {
  return apiGet<User>("/auth/user/profile");
}

/* ── Update Profile ──────────────────────────────────────────────────── */

export async function updateProfileApi(
  payload: UpdateProfilePayload,
): Promise<User> {
  return apiPatch<User>("/auth/user/profile", payload);
}

/* ── Addresses (embedded in auth model) ──────────────────────────────── */

export async function addAddressApi(payload: AddAddressPayload): Promise<void> {
  await apiPost("/auth/user/address", payload);
}

export async function updateAddressApi(
  addressId: string,
  payload: UpdateAddressPayload,
): Promise<void> {
  await apiPatch(`/auth/user/address/${addressId}`, payload);
}

export async function deleteAddressApi(addressId: string): Promise<void> {
  await apiDelete(`/auth/user/address/${addressId}`);
}
