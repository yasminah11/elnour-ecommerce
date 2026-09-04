"use client";

/**
 * Register page — app/(auth)/register/page.tsx
 *
 * TEMPORARY minimal UI. All business logic lives in useRegister().
 * Replace only the JSX inside this file when the final design is ready.
 *
 * What this component does:
 *   - Redirects already-authenticated users to /account
 *   - Wires inputs to useRegister() for state, validation, and API submission
 *   - Navigates to /account when the backend auto-logs in after registration
 *   - Shows a success message when the backend requires a separate step
 *     (e.g. email verification) instead of auto-logging in
 *
 *  Whether registration redirects directly to /account or shows a
 *     "check your email" message depends on the backend. Both paths
 *     are handled here via the onSuccess callback.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRegister } from "@/hooks/useRegister";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.replace("/account");
  }, [isAuthenticated, router]);

  const {
    values,
    errors,
    apiError,
    successMessage,
    isLoading,
    handleChange,
    handleSubmit,
  } = useRegister({
    onSuccess: (data) => {
      if (data.access) {
        // Backend auto-logged in — go directly to account
        router.push("/account");
      }
      // If no token, successMessage will be displayed in-page
    },
  });

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>

      {apiError && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm"
        >
          {apiError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm"
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="first_name"
            className="block text-sm font-medium mb-1"
          >
            First Name
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            autoComplete="given-name"
            value={values.first_name}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.first_name && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.first_name}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="last_name" className="block text-sm font-medium mb-1">
            Last Name
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            autoComplete="family-name"
            value={values.last_name}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.last_name && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.last_name}
            </p>
          )}
        </div>

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
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.email && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.phone && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.password && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="password_confirm"
            className="block text-sm font-medium mb-1"
          >
            Confirm Password
          </label>
          <input
            id="password_confirm"
            name="password_confirm"
            type="password"
            autoComplete="new-password"
            value={values.password_confirm}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.password_confirm && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.password_confirm}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1a3a6b] text-white py-2 rounded font-semibold text-sm disabled:opacity-60"
        >
          {isLoading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#1a3a6b] font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
