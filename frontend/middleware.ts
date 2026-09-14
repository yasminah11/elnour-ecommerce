/**
 * Next.js Middleware — server-side route protection.
 * Source: FR-AUTH-02, NFR-SEC-01
 *
 * On every request this middleware reads the access token from cookies.
 * If a protected route is accessed without a token, the user is redirected
 * to /login. If an already-authenticated user tries to reach /login or
 * /register, they are redirected to /account.
 *
 * This is a thin UX guard — it does NOT verify the token's signature or
 * expiry beyond checking for its presence. The backend must enforce
 * authentication on every API request (NFR-SEC-01).
 *
 * Add new protected route prefixes to `protectedPaths` as the application grows.
 */

import { NextRequest, NextResponse } from "next/server";
import { config as appConfig } from "@/lib/config";

/** Paths that require an authenticated session */
const protectedPaths = ["/account"];

/** Paths that should redirect authenticated users away (login/register) */
const authOnlyPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(appConfig.auth.accessTokenKey)?.value;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthOnly = authOnlyPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
