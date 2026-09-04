/**
 * Token storage layer.
 *
 * Stores the access and refresh tokens in browser cookies via js-cookie.
 *
 * Why cookies (not localStorage):
 *   - Cookies are readable by Next.js Middleware, enabling server-side
 *     route protection without an extra round-trip.
 *   - In production the backend can set HttpOnly + Secure flags on its own
 *     cookies; this client-side storage is for the frontend-managed tokens.
 *
 * ⚠️  REQUIRES BACKEND CONFIRMATION:
 *   - Whether the backend issues JWTs (so isTokenValid() is meaningful)
 *     or opaque tokens (in which case remove isTokenValid / decodeToken).
 *   - The actual TTL of access and refresh tokens — update
 *     config.auth.accessTokenCookieDays / refreshTokenCookieDays to match.
 *   - Whether "Secure" flag should be enabled (yes in production over HTTPS).
 */

import Cookies from "js-cookie";
import { config } from "@/lib/config";
import type { DecodedToken } from "@/lib/types/auth";

const {
  accessTokenKey,
  refreshTokenKey,
  accessTokenCookieDays,
  refreshTokenCookieDays,
} = config.auth;

/* ── Write ──────────────────────────────────────────────────────────── */

export function setTokens(access: string, refresh: string): void {
  Cookies.set(accessTokenKey, access, {
    expires: accessTokenCookieDays,
    sameSite: "Lax",
    // secure: true  ← uncomment when serving over HTTPS in production
  });
  Cookies.set(refreshTokenKey, refresh, {
    expires: refreshTokenCookieDays,
    sameSite: "Lax",
  });
}

export function setAccessToken(access: string): void {
  Cookies.set(accessTokenKey, access, {
    expires: accessTokenCookieDays,
    sameSite: "Lax",
  });
}

/* ── Read ───────────────────────────────────────────────────────────── */

export function getAccessToken(): string | undefined {
  return Cookies.get(accessTokenKey);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(refreshTokenKey);
}

/* ── Delete ─────────────────────────────────────────────────────────── */

export function clearTokens(): void {
  Cookies.remove(accessTokenKey);
  Cookies.remove(refreshTokenKey);
}

/* ── JWT decode (no signature verification) ─────────────────────────── */

/**
 * Decodes the payload of a JWT without verifying its signature.
 * Used only to read the `exp` claim client-side so we can skip
 * obviously-expired tokens before making a network request.
 *
 *   Only call this if the backend confirmed it issues JWTs.
 *     If the backend uses opaque tokens, remove this function and
 *     replace hasValidSession() with a simple !!getAccessToken() check.
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Returns true when the token exists and its `exp` claim is in the future.
 *
 *   See isTokenValid() note above regarding JWT vs opaque tokens.
 */
export function isTokenValid(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  // exp is in seconds; Date.now() is in milliseconds
  return decoded.exp * 1000 > Date.now();
}

/**
 * Returns true when a non-expired access token is present in storage.
 *
 *   See isTokenValid() note above regarding JWT vs opaque tokens.
 */
export function hasValidSession(): boolean {
  const token = getAccessToken();
  return !!token && isTokenValid(token);
}
