/**
 * Authentication service.
 *
 * All auth-related API calls live here. No component or hook calls
 * fetch() directly — they go through this module or apiClient.
 *
 *   EVERY endpoint path below is a PLACEHOLDER that must be replaced
 *     with the real path once the backend confirms the API contract.
 *     The request/response field names are also placeholders — confirm
 *     each one against the real backend before going to production.
 *
 * Confirmed requirements (from SRS):
 *   FR-AUTH-04 — login, logout, password reset, session protection
 *   "Linked Authentication" — required by task spec; backend details TBD
 */

import { apiPost, apiGet, apiDelete } from "@/lib/api/apiClient";
import { setTokens, clearTokens, getRefreshToken } from "@/lib/auth/tokenStorage";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  AuthProvider,
  LinkProviderPayload,
  LinkedProvider,
} from "@/lib/types/auth";

/* ── Login ──────────────────────────────────────────────────────────── */

/**
 *   Endpoint path: CONFIRM with backend (placeholder: "/auth/login/")
 *   Request body fields: CONFIRM (email, password assumed)
 *   Response shape: CONFIRM — does backend return { access, refresh, user }
 *     or just tokens, requiring a separate /me call?
 */
export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const data = await apiPost<LoginResponse>("/auth/login/", payload, {
    skipAuth: true,
  });
  setTokens(data.access, data.refresh);
  return data;
}

/* ── Register ───────────────────────────────────────────────────────── */

/**
 *   Endpoint path: CONFIRM with backend (placeholder: "/auth/register/")
 *   Request body fields: CONFIRM (first_name, last_name, email, phone,
 *     password, password_confirm assumed — exact names may differ)
 * Response shape: CONFIRM — does backend auto-login (return tokens)
 *     or require a separate login step / email verification?
 */
export async function registerApi(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const data = await apiPost<RegisterResponse>("/auth/register/", payload, {
    skipAuth: true,
  });
  if (data.access && data.refresh) {
    setTokens(data.access, data.refresh);
  }
  return data;
}

/* ── Logout ─────────────────────────────────────────────────────────── */

/**
 * Clears local tokens and calls the backend logout endpoint.
 * Local tokens are always cleared regardless of whether the API call succeeds.
 *
 *   Endpoint path: CONFIRM with backend (placeholder: "/auth/logout/")
 *   Request body: CONFIRM — does the backend expect the refresh token
 *     in the body to invalidate it server-side, or is no body needed?
 *     (Currently sends { refresh: <token> } — confirm field name)
 */
export async function logoutApi(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await apiPost("/auth/logout/", { refresh: refreshToken });
    }
  } catch {
    // Swallow — tokens are cleared regardless
  } finally {
    clearTokens();
  }
}

/* ── Password reset ─────────────────────────────────────────────────── */

/**
 * Step 1 — request a reset link/code be sent to the user's email.
 *
 *   Endpoint path: CONFIRM with backend (placeholder: "/auth/password/reset/")
 *   Request body: CONFIRM (email assumed)
 *   FR-AUTH-04 requires password reset — backend implementation details TBD.
 */
export async function requestPasswordResetApi(email: string): Promise<void> {
  await apiPost("/auth/password/reset/", { email }, { skipAuth: true });
}

/**
 * Step 2 — submit the new password with the token/uid from the reset email.
 *
 *   Endpoint path: CONFIRM with backend (placeholder: "/auth/password/reset/confirm/")
 *   Request body fields: CONFIRM — uid, token, new_password,
 *     new_password_confirm are assumed; backend may use different names.
 */
export async function confirmPasswordResetApi(payload: {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
}): Promise<void> {
  await apiPost("/auth/password/reset/confirm/", payload, { skipAuth: true });
}

/* ── Linked authentication providers ───────────────────────────────── */

/**
 * Fetches the list of third-party providers linked to the authenticated account.
 *
 *   Endpoint path: CONFIRM with backend — not yet implemented.
 *     Placeholder: "/auth/linked-providers/"
 *   Response shape: CONFIRM — [{ provider, connected_at }] assumed.
 *  The supported provider names (e.g. "google") are NOT hardcoded here
 *     because they were not confirmed by the project spec.
 *     They will be supplied by the backend response at runtime.
 */
export async function getLinkedProvidersApi(): Promise<LinkedProvider[]> {
  return apiGet<LinkedProvider[]>("/auth/linked-providers/");
}

/**
 * Links a third-party provider to the authenticated account.
 *
 *   Endpoint path: CONFIRM with backend. Placeholder: "/auth/linked-providers/"
 *   Request body: CONFIRM — { provider, token } assumed.
 */
export async function linkProviderApi(
  payload: LinkProviderPayload
): Promise<LinkedProvider> {
  return apiPost<LinkedProvider>("/auth/linked-providers/", payload);
}

/**
 * Unlinks a third-party provider from the authenticated account.
 *
 *   Endpoint path: CONFIRM with backend.
 *     Placeholder: "/auth/linked-providers/{provider}/"
 */
export async function unlinkProviderApi(provider: AuthProvider): Promise<void> {
  await apiDelete(`/auth/linked-providers/${provider}/`);
}