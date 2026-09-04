/**
 * Centralised runtime configuration.
 *
 * All environment-variable access goes through this module.
 * Update values here when the backend confirms real endpoint paths and
 * token/cookie conventions.
 *
 *   REQUIRES BACKEND CONFIRMATION:
 *   - NEXT_PUBLIC_API_BASE_URL     — the backend API root URL
 *   - auth.tokenRefreshPath        — endpoint the backend uses to refresh tokens
 *   - auth.accessTokenKey          — cookie/storage key for the access token
 *   - auth.refreshTokenKey         — cookie/storage key for the refresh token
 *   - auth.accessTokenCookieDays   — how long the access token cookie lives
 *   - auth.refreshTokenCookieDays  — how long the refresh token cookie lives
 */

export const config = {
  /**
   * Base URL of the backend API — no trailing slash.
   * Set NEXT_PUBLIC_API_BASE_URL in .env.local.
   * Example: http://localhost:8000/api
   */
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api",

  auth: {
    /**
     * Cookie key used to store the access token client-side.
     *  Confirm with backend: what key/name does the backend use?
     */
    accessTokenKey: "elnour_access",

    /**
     * Cookie key used to store the refresh token client-side.
     *  Confirm with backend: what key/name does the backend use?
     */
    refreshTokenKey: "elnour_refresh",

    /**
     * How many days the access token cookie survives.
     *  Should match the backend's access token TTL.
     */
    accessTokenCookieDays: 1,

    /**
     * How many days the refresh token cookie survives.
     *  Should match the backend's refresh token TTL.
     */
    refreshTokenCookieDays: 30,

    /**
     * Path on the backend used to silently refresh an expired access token.
     *  REQUIRES BACKEND CONFIRMATION — replace placeholder with real path.
     */
    tokenRefreshPath: "/auth/token/refresh/",
  },
} as const;
