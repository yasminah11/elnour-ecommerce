/**
 * Token storage — uses cookies (client-side accessible).
 * Updated to match backend token field names: access_token, refresh_token
 * Auth header: "auth: bearer <token>"  (NOT Authorization: Bearer)
 */

import { config } from "@/lib/config";
import type { DecodedToken } from "@/lib/types/auth";

const {
  accessTokenKey,
  refreshTokenKey,
  accessTokenCookieDays,
  refreshTokenCookieDays,
} = config.auth;

/* ── Cookie helpers ──────────────────────────────────────────────────── */

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)",
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/* ── Token decoding ──────────────────────────────────────────────────── */

function decodeJwt(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

/* ── Public API ──────────────────────────────────────────────────────── */

export function setTokens(access_token: string, refresh_token: string): void {
  setCookie(accessTokenKey, access_token, accessTokenCookieDays);
  setCookie(refreshTokenKey, refresh_token, refreshTokenCookieDays);
}

export function setAccessToken(access_token: string): void {
  setCookie(accessTokenKey, access_token, accessTokenCookieDays);
}

export function getAccessToken(): string | null {
  return getCookie(accessTokenKey);
}

export function getRefreshToken(): string | null {
  return getCookie(refreshTokenKey);
}

export function clearTokens(): void {
  deleteCookie(accessTokenKey);
  deleteCookie(refreshTokenKey);
}

export function hasValidSession(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp * 1000 > Date.now();
}
