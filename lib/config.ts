/**
 * Centralised runtime configuration.
 * Updated to match the backend API contract.
 */

export const config = {
  /**
   * Base URL of the backend API — no trailing slash.
   * Set NEXT_PUBLIC_API_BASE_URL in .env.local.
   * Example: http://localhost:8000/api
   */
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",

  auth: {
    /** Cookie key used to store the access token client-side. */
    accessTokenKey: "elnour_access",

    /** Cookie key used to store the refresh token client-side. */
    refreshTokenKey: "elnour_refresh",

    /** How many days the access token cookie survives (match backend TTL). */
    accessTokenCookieDays: 1,

    /** How many days the refresh token cookie survives (match backend TTL). */
    refreshTokenCookieDays: 30,

    /**
     * The backend uses JWT — token refresh endpoint.
     * Backend issues access + refresh tokens on login/register.
     */
    tokenRefreshPath: "/auth/token/refresh/",
  },
} as const;
