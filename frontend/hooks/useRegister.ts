"use client";

/**
 * useRegister hook.
 * Field names updated to match the backend signUp controller:
 *   firstName, lastName, cPassword (confirm password)
 *
 * The backend signUp controller also supports:
 *   address, billingInfo, customerType, businessInfo
 * These are optional and not included in the basic registration form.
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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    cPassword: "",
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
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          cPassword: values.cPassword,
        });

        if (data.message) {
          setSuccessMessage(data.message);
        }

        options.onSuccess?.(data);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        if (apiErr?.fieldErrors) {
          const mapped: RegisterFormErrors = {};
          const fe = apiErr.fieldErrors;
          if (fe.firstName) mapped.firstName = fe.firstName[0];
          if (fe.lastName) mapped.lastName = fe.lastName[0];
          if (fe.email) mapped.email = fe.email[0];
          if (fe.phone) mapped.phone = fe.phone[0];
          if (fe.password) mapped.password = fe.password[0];
          if (fe.cPassword) mapped.cPassword = fe.cPassword[0];
          setErrors(mapped);
          if (fe.non_field_errors) setApiError(fe.non_field_errors[0]);
        } else {
          setApiError(
            apiErr?.message ?? "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
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
