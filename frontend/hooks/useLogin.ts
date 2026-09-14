"use client";

/**
 * useLogin hook.
 *
 * Manages all login form state, validation, API submission, and error handling.
 * The UI component only needs to wire inputs and the submit button to this hook.
 *
 * Usage:
 *   const { values, errors, apiError, isLoading, handleChange, handleSubmit } =
 *     useLogin({ onSuccess: () => router.push("/account") });
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  validateLoginForm,
  isFormValid,
  type LoginFormValues,
  type LoginFormErrors,
} from "@/lib/utils/validation";
import type { ApiError } from "@/lib/types/auth";

interface UseLoginOptions {
  /** Called after a successful login. Typically used for navigation. */
  onSuccess?: () => void;
}

export function useLogin(options: UseLoginOptions = {}) {
  const { login } = useAuth();

  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const validationErrors = validateLoginForm(values);
      if (!isFormValid(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      setIsLoading(true);
      setApiError(null);

      try {
        await login({ email: values.email, password: values.password });
        options.onSuccess?.();
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        if (apiErr?.status === 401) {
          setApiError("Invalid email or password.");
        } else if (apiErr?.fieldErrors) {
          const mapped: LoginFormErrors = {};
          if (apiErr.fieldErrors.email)
            mapped.email = apiErr.fieldErrors.email[0];
          if (apiErr.fieldErrors.password)
            mapped.password = apiErr.fieldErrors.password[0];
          setErrors(mapped);
          if (apiErr.fieldErrors.non_field_errors) {
            setApiError(apiErr.fieldErrors.non_field_errors[0]);
          }
        } else {
          setApiError(apiErr?.message ?? "Login failed. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [values, login, options],
  );

  return { values, errors, apiError, isLoading, handleChange, handleSubmit };
}
