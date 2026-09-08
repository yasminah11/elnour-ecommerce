"use client";

/**
 * useAddresses hook — corrected to match the ACTUAL backend.
 *
 * Key changes:
 *  - Addresses are embedded in the User object (not a separate collection)
 *  - Address fields: { city, details, isDefault } (not street, is_default)
 *  - Operations use /auth/user/address/* endpoints
 *  - After add/update/delete, call refreshUser() to get updated addresses
 */

import { useCallback } from "react";
import {
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
} from "@/lib/api/authService";
import type {
  Address,
  AddAddressPayload,
  UpdateAddressPayload,
  ApiError,
} from "@/lib/types/auth";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export function useAddresses() {
  const { user, isAuthenticated, refreshUser } = useAuth();

  // Addresses come from the user object in AuthContext
  const addresses: Address[] = user?.addresses ?? [];

  const [isMutating, setIsMutating] = useState(false);
  const [mutateError, setMutateError] = useState<string | null>(null);

  /* ── Create ──────────────────────────────────────────────────────────── */

  const addAddress = useCallback(
    async (payload: AddAddressPayload) => {
      setIsMutating(true);
      setMutateError(null);
      try {
        await addAddressApi(payload);
        // Refresh user to get updated addresses list
        await refreshUser();
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setMutateError(apiErr?.message ?? "فشل إضافة العنوان.");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refreshUser],
  );

  /* ── Update ──────────────────────────────────────────────────────────── */

  const editAddress = useCallback(
    async (id: string, updates: UpdateAddressPayload) => {
      setIsMutating(true);
      setMutateError(null);
      try {
        await updateAddressApi(id, updates);
        await refreshUser();
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setMutateError(apiErr?.message ?? "فشل تحديث العنوان.");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refreshUser],
  );

  /* ── Delete ──────────────────────────────────────────────────────────── */

  const removeAddress = useCallback(
    async (id: string) => {
      setIsMutating(true);
      setMutateError(null);
      try {
        await deleteAddressApi(id);
        await refreshUser();
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setMutateError(apiErr?.message ?? "فشل حذف العنوان.");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refreshUser],
  );

  /* ── Set default ─────────────────────────────────────────────────────── */

  const setDefault = useCallback(
    async (id: string) => {
      setIsMutating(true);
      setMutateError(null);
      try {
        await updateAddressApi(id, { isDefault: true });
        await refreshUser();
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setMutateError(apiErr?.message ?? "فشل تعيين العنوان الافتراضي.");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refreshUser],
  );

  return {
    addresses,
    isFetching: false, // addresses come from user object — no separate fetch
    fetchError: null,
    isMutating,
    mutateError,
    addAddress,
    editAddress,
    removeAddress,
    setDefault,
    refetch: refreshUser,
  };
}
