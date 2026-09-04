"use client";

/**
 * useRegister hook.
 *
 * Manages all registration form state, validation, API submission, and error handling.
 * The UI component only needs to wire inputs and the submit button to this hook.
 *
 * Usage:
 *   const { values, errors, apiError, successMessage, isLoading, handleChange, handleSubmit } =
 *     useRegister({
 *       onSuccess: (data) => {
 *         if (data.access) router.push("/account"); // backend auto-logged-in
 *         // otherwise: stay on page and show successMessage (e.g. "check your email")
 *       },
 *     });
 *
 * ⚠️  Whether the backend auto-logs in after registration (returns tokens)
 *     or requires a separate step must be confirmed. Both paths are handled here.
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  validateRegisterForm,
  isFormValid,
  type RegisterFormValues,
  type RegisterFormErrors,
} from "@/lib/utils/validation";
import type { ApiError, RegisterResponse } from "@/lib/types/auth";

interface UseRegisterOptions {
  onSuccess?: (data: RegisterResponse) => void;
}

export function useRegister(options: UseRegisterOptions = {}) {
  const { register } = useAuth();

  const [values, setValues] = useState<RegisterFormValues>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirm: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      setApiError(null);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const validationErrors = validateRegisterForm(values);
      if (!isFormValid(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      setIsLoading(true);
      setApiError(null);
      setSuccessMessage(null);

      try {
        const data = await register({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          password_confirm: values.password_confirm,
        });

        // Surface any message the backend sends (e.g. "check your email")
        if (data.message || data.detail) {
          setSuccessMessage(data.message ?? data.detail ?? null);
        }

        options.onSuccess?.(data);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        if (apiErr?.fieldErrors) {
          const mapped: RegisterFormErrors = {};
          const fe = apiErr.fieldErrors;
          if (fe.first_name) mapped.first_name = fe.first_name[0];
          if (fe.last_name) mapped.last_name = fe.last_name[0];
          if (fe.email) mapped.email = fe.email[0];
          if (fe.phone) mapped.phone = fe.phone[0];
          if (fe.password) mapped.password = fe.password[0];
          if (fe.password_confirm)
            mapped.password_confirm = fe.password_confirm[0];
          setErrors(mapped);
          if (fe.non_field_errors) setApiError(fe.non_field_errors[0]);
        } else {
          setApiError(
            apiErr?.message ?? "Registration failed. Please try again.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [values, register, options],
  );

  return {
    values,
    errors,
    apiError,
    successMessage,
    isLoading,
    handleChange,
    handleSubmit,
  };
}
