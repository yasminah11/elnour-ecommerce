"use client";

/**
 * useProfile hook — reads from AuthContext, writes via PATCH /auth/user/profile.
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfileApi } from "@/lib/api/authService";
import type { UpdateProfilePayload, ApiError } from "@/lib/types/auth";

export function useProfile() {
  const { user, refreshUser } = useAuth();

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      try {
        await updateProfileApi(payload);
        await refreshUser();
        setUpdateSuccess(true);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setUpdateError(apiErr?.message ?? "فشل تحديث البيانات.");
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [refreshUser],
  );

  const resetFeedback = useCallback(() => {
    setUpdateError(null);
    setUpdateSuccess(false);
  }, []);

  return {
    user,
    isUpdating,
    updateError,
    updateSuccess,
    updateProfile,
    resetFeedback,
  };
}
