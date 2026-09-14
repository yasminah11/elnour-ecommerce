/**
 * Centralised runtime configuration.
 * Matched to the actual backend running on port 3001.
 *
 * Backend base: http://localhost:3001
 * Customer auth prefix: /auth/user
 */

export const config = {
  /**
   * Base URL of the backend API — no trailing slash.
   * Set NEXT_PUBLIC_API_BASE_URL in .env.local.
   * Backend runs on port 3001.
   */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",

  auth: {
    /** Cookie key used to store the access token client-side. */
    accessTokenKey: "elnour_access",

    /** Cookie key used to store the refresh token client-side. */
    refreshTokenKey: "elnour_refresh",

    /** How many days the access token cookie survives. */
    accessTokenCookieDays: 1,

    /** How many days the refresh token cookie survives. */
    refreshTokenCookieDays: 30,

    /**
     * Backend refresh token endpoint.
     * Backend: GET /auth/user/refresh-token  (sends token in "authentication" header)
     */
    tokenRefreshPath: "/auth/user/refresh-token",
  },
} as const;
