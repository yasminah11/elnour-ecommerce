"use client";

/**
 * useAddresses hook.
 * Updated to use _id (string) to match MongoDB backend.
 * Source: FR-AUTH-06
 */

import { useState, useEffect, useCallback } from "react";
import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
} from "@/lib/api/customerService";
import type { Address, ApiError } from "@/lib/types/auth";
import { useAuth } from "@/context/AuthContext";

export function useAddresses() {
  const { isAuthenticated } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [mutateError, setMutateError] = useState<string | null>(null);

  /* ── Fetch ───────────────────────────────────────────────────────────── */

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await getAddressesApi();
      setAddresses(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setFetchError(apiErr?.message ?? "فشل تحميل العناوين.");
    } finally {
      setIsFetching(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const load = async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const data = await getAddressesApi();
        if (!cancelled) setAddresses(data);
      } catch (err: unknown) {
        if (!cancelled) {
          const apiErr = err as ApiError;
          setFetchError(apiErr?.message ?? "فشل تحميل العناوين.");
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  /* ── Create ──────────────────────────────────────────────────────────── */

  const addAddress = useCallback(async (address: Omit<Address, "_id">) => {
    setIsMutating(true);
    setMutateError(null);
    try {
      const created = await createAddressApi(address);
      setAddresses((prev) => [...prev, created]);
      return created;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setMutateError(apiErr?.message ?? "فشل إضافة العنوان.");
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  /* ── Update ──────────────────────────────────────────────────────────── */

  const editAddress = useCallback(
    async (id: string, updates: Partial<Omit<Address, "_id">>) => {
      setIsMutating(true);
      setMutateError(null);
      try {
        const updated = await updateAddressApi(id, updates);
        setAddresses((prev) => prev.map((a) => (a._id === id ? updated : a)));
        return updated;
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setMutateError(apiErr?.message ?? "فشل تحديث العنوان.");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  /* ── Delete ──────────────────────────────────────────────────────────── */

  const removeAddress = useCallback(async (id: string) => {
    setIsMutating(true);
    setMutateError(null);
    try {
      await deleteAddressApi(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setMutateError(apiErr?.message ?? "فشل حذف العنوان.");
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  /* ── Set default ─────────────────────────────────────────────────────── */

  const setDefault = useCallback(async (id: string) => {
    setIsMutating(true);
    setMutateError(null);
    try {
      const updated = await setDefaultAddressApi(id);
      setAddresses((prev) =>
        prev.map((a) => (a._id === id ? updated : { ...a, is_default: false })),
      );
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setMutateError(apiErr?.message ?? "فشل تعيين العنوان الافتراضي.");
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  return {
    addresses,
    isFetching,
    fetchError,
    isMutating,
    mutateError,
    addAddress,
    editAddress,
    removeAddress,
    setDefault,
    refetch: fetchAddresses,
  };
}
