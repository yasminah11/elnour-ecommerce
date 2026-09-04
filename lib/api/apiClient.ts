/**
 * Base API client.
 *
 * Responsibilities:
 *   1. Prepend the configured API base URL to every request.
 *   2. Inject the access token (Bearer header) on authenticated requests.
 *   3. On 401, attempt a single silent token refresh, then retry once.
 *   4. Parse backend error responses into a typed ApiError.
 *
 *   REQUIRES BACKEND CONFIRMATION:
 *   - The Authorization header scheme ("Bearer" is assumed — confirm with backend).
 *   - The token refresh endpoint path — currently read from config.auth.tokenRefreshPath.
 *   - The refresh request body shape — currently { refresh: <token> }.
 *   - The error response body shape — currently assumes { detail, <field>: [msgs] }.
 *   - Whether the backend rotates the refresh token on refresh.
 */

import { config } from "@/lib/config";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
  clearTokens,
} from "@/lib/auth/tokenStorage";
import type {
  ApiError,
  ApiFieldErrors,
  RefreshResponse,
} from "@/lib/types/auth";

/* ── Error parsing ──────────────────────────────────────────────────── */

/**
 * Converts a non-2xx response into a typed ApiError.
 *
 *  The error body shape { detail, <field>: [messages] } is common but
 *     must be confirmed against the real backend error responses.
 */
async function parseApiError(response: Response): Promise<ApiError> {
  let body: Record<string, unknown> = {};
  try {
    body = await response.json();
  } catch {
    // Response body is not JSON — use status text
  }

  const message =
    typeof body.detail === "string"
      ? body.detail
      : response.statusText || "An unexpected error occurred.";

  const fieldErrors: ApiFieldErrors = {};
  for (const [key, value] of Object.entries(body)) {
    if (key !== "detail" && Array.isArray(value)) {
      fieldErrors[key] = value as string[];
    }
  }

  return {
    status: response.status,
    message,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}

/* ── Silent token refresh ───────────────────────────────────────────── */

/**
 * Attempts to get a new access token using the stored refresh token.
 * Returns the new access token string, or null if refresh fails.
 *
 *   REQUIRES BACKEND CONFIRMATION:
 *   - Endpoint path: config.auth.tokenRefreshPath (currently "/auth/token/refresh/")
 *   - Request body: { refresh: string } — confirm field name with backend
 *   - Response body: { access: string, refresh?: string }
 */
async function silentRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(
      `${config.apiBaseUrl}${config.auth.tokenRefreshPath}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      },
    );

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data: RefreshResponse = await res.json();
    if (data.refresh) {
      // Backend rotated the refresh token — store both
      setTokens(data.access, data.refresh);
    } else {
      setAccessToken(data.access);
    }
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

/* ── Request helper ─────────────────────────────────────────────────── */

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Set true for login/register — skips injecting the Authorization header */
  skipAuth?: boolean;
  /** Internal flag — prevents infinite retry loop on 401 */
  _isRetry?: boolean;
}

/**
 * Makes a request to the backend API.
 *
 * @param path    Relative path, e.g. "/auth/login/" — prepended with apiBaseUrl
 * @param options Extended fetch options
 * @returns       Parsed response body as T
 * @throws        ApiError on any non-2xx response
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth = false, _isRetry = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      //   "Bearer" scheme assumed — confirm with backend
      headers["Authorization"] = `Bearer ${token}`;
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
      message: "Session expired. Please log in again.",
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

  return response.json() as Promise<T>;
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
