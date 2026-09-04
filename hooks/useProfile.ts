"use client";

/**
 * useProfile hook.
 *
 * Provides the authenticated user's profile data and update actions.
 * Reads the user from AuthContext (already fetched on app mount) and
 * calls refreshUser() after any successful update to keep the context in sync.
 *
 * Usage:
 *   const {
 *     user, isUpdating, updateError, updateSuccess,
 *     updateProfile, updateBusinessInfo, resetFeedback
 *   } = useProfile();
 *
 * ⚠️  updateProfile and updateBusinessInfo call endpoints that are
 *     placeholders — confirm paths with the backend before going to production.
 *     See customerService.ts for details.
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateMeApi, updateBusinessInfoApi } from "@/lib/api/customerService";
import type {
  UpdateProfilePayload,
  BusinessInfo,
  ApiError,
} from "@/lib/types/auth";

export function useProfile() {
  const { user, refreshUser } = useAuth();

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  /**
   * Update personal information (name, phone, customer_type, etc.).
   * Only send the fields you want to change — the rest are ignored by PATCH.
   */
  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      try {
        await updateMeApi(payload);
        await refreshUser();
        setUpdateSuccess(true);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setUpdateError(apiErr?.message ?? "Failed to update profile.");
        throw err; // re-throw so the UI can access fieldErrors if needed
      } finally {
        setIsUpdating(false);
      }
    },
    [refreshUser],
  );

  /**
   * Update business/company information (FR-AUTH-05).
   */
  const updateBusinessInfo = useCallback(
    async (info: BusinessInfo) => {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      try {
        await updateBusinessInfoApi(info);
        await refreshUser();
        setUpdateSuccess(true);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setUpdateError(
          apiErr?.message ?? "Failed to update business information.",
        );
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [refreshUser],
  );

  /** Reset success/error state — call when closing an edit form. */
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
    updateBusinessInfo,
    resetFeedback,
  };
}
