"use client";

/**
 * Login page — app/(auth)/login/page.tsx
 *
 * TEMPORARY minimal UI. All business logic lives in useLogin().
 * Replace only the JSX inside this file when the final design is ready —
 * no changes to hooks, services, or context will be needed.
 *
 * What this component does:
 *   - Redirects already-authenticated users to /account
 *   - Wires inputs to useLogin() for state, validation, and API submission
 *   - Navigates to /account on successful login
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLogin } from "@/hooks/useLogin";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.replace("/account");
  }, [isAuthenticated, router]);

  const { values, errors, apiError, isLoading, handleChange, handleSubmit } =
    useLogin({
      onSuccess: () => router.push("/account"),
    });

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>

      {apiError && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm"
        >
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            disabled={isLoading}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            disabled={isLoading}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1a3a6b] text-white py-2 rounded font-semibold text-sm disabled:opacity-60"
        >
          {isLoading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[#1a3a6b] font-semibold hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
