/**
 * Base API client — corrected to match the ACTUAL backend:
 *
 *  ✅ Auth header: "auth: bearer <token>"  (backend reads req.headers.auth)
 *  ✅ Prefix: "bearer" (lowercase, from config PERFIX=bearer)
 *  ✅ Response shape: { message, data } — unwrap data before returning
 *  ✅ Refresh token: GET /auth/user/refresh-token with "authentication" header
 *  ✅ Error shape: { message } (not { detail })
 */

import { config } from "@/lib/config";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
  clearTokens,
} from "@/lib/auth/tokenStorage";
import type { ApiError, ApiResponse, RefreshResponse } from "@/lib/types/auth";

/* ── Error parsing ──────────────────────────────────────────────────── */

async function parseApiError(response: Response): Promise<ApiError> {
  let body: Record<string, unknown> = {};
  try {
    body = await response.json();
  } catch {
    // Response body is not JSON
  }

  const message =
    typeof body.message === "string"
      ? body.message
      : response.statusText || "An unexpected error occurred.";

  return {
    status: response.status,
    message,
  };
}

/* ── Silent token refresh ───────────────────────────────────────────── */

/**
 * Backend refresh: GET /auth/user/refresh-token
 * Sends the refresh token in "authentication: bearer <token>" header
 */
async function silentRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(
      `${config.apiBaseUrl}${config.auth.tokenRefreshPath}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authentication: `bearer ${refreshToken}`,
        },
      },
    );

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const json: ApiResponse<RefreshResponse> = await res.json();
    const data = json.data;
    if (!data) {
      clearTokens();
      return null;
    }

    if (data.refresh_token) {
      setTokens(data.access_token, data.refresh_token);
    } else {
      setAccessToken(data.access_token);
    }
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

/* ── Request helper ─────────────────────────────────────────────────── */

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Set true for login/register/confirm-email — skips auth header */
  skipAuth?: boolean;
  /** Internal flag — prevents infinite retry loop on 401 */
  _isRetry?: boolean;
  /** Return raw response without unwrapping .data */
  rawResponse?: boolean;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    skipAuth = false,
    _isRetry = false,
    rawResponse = false,
    ...fetchOptions
  } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      // Backend reads req.headers.auth with prefix "bearer" (lowercase)
      headers["auth"] = `bearer ${token}`;
    }
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...fetchOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ── 401: attempt one silent refresh then retry ───────────────────────
  if (response.status === 401 && !_isRetry && !skipAuth) {
    const newToken = await silentRefresh();
    if (newToken) {
      return request<T>(path, { ...options, _isRetry: true });
    }
    clearTokens();
    const sessionErr: ApiError = {
      status: 401,
      message: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    };
    throw sessionErr;
  }

  // ── Non-2xx ──────────────────────────────────────────────────────────
  if (!response.ok) {
    throw await parseApiError(response);
  }

  // ── 204 No Content ───────────────────────────────────────────────────
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  // ── Unwrap { message, data } response shape ──────────────────────────
  const json: ApiResponse<T> = await response.json();

  if (rawResponse) {
    return json as unknown as T;
  }

  // Return data if present, otherwise return the full response
  return (json.data !== undefined ? json.data : json) as T;
}

/* ── Convenience wrappers ───────────────────────────────────────────── */

export const apiGet = <T>(path: string, opts?: RequestOptions) =>
  request<T>(path, { method: "GET", ...opts });

export const apiPost = <T>(
  path: string,
  body?: unknown,
  opts?: RequestOptions,
) => request<T>(path, { method: "POST", body, ...opts });

export const apiPatch = <T>(
  path: string,
  body?: unknown,
  opts?: RequestOptions,
) => request<T>(path, { method: "PATCH", body, ...opts });

export const apiDelete = <T>(path: string, opts?: RequestOptions) =>
  request<T>(path, { method: "DELETE", ...opts });
