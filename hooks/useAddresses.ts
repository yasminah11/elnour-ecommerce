"use client";

/**
 * useAddresses hook.
 *
 * Manages the authenticated customer's saved delivery addresses.
 * Source: FR-AUTH-06 — customers can maintain saved addresses.
 *
 * Provides: fetch, add, edit, delete, set default.
 *
 * ⚠️  All API endpoint paths are placeholders — confirm with backend.
 *     See customerService.ts for the full list of paths that need confirming.
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
      setFetchError(apiErr?.message ?? "Failed to load addresses.");
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
          setFetchError(apiErr?.message ?? "Failed to load addresses.");
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

  const addAddress = useCallback(async (address: Omit<Address, "id">) => {
    setIsMutating(true);
    setMutateError(null);
    try {
      const created = await createAddressApi(address);
      setAddresses((prev) => [...prev, created]);
      return created;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setMutateError(apiErr?.message ?? "Failed to add address.");
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  /* ── Update ──────────────────────────────────────────────────────────── */

  const editAddress = useCallback(
    async (id: number, updates: Partial<Omit<Address, "id">>) => {
      setIsMutating(true);
      setMutateError(null);
      try {
        const updated = await updateAddressApi(id, updates);
        setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
        return updated;
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setMutateError(apiErr?.message ?? "Failed to update address.");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  /* ── Delete ──────────────────────────────────────────────────────────── */

  const removeAddress = useCallback(async (id: number) => {
    setIsMutating(true);
    setMutateError(null);
    try {
      await deleteAddressApi(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setMutateError(apiErr?.message ?? "Failed to delete address.");
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  /* ── Set default ─────────────────────────────────────────────────────── */

  const setDefault = useCallback(async (id: number) => {
    setIsMutating(true);
    setMutateError(null);
    try {
      const updated = await setDefaultAddressApi(id);
      setAddresses((prev) =>
        prev.map((a) => (a.id === id ? updated : { ...a, is_default: false })),
      );
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setMutateError(apiErr?.message ?? "Failed to set default address.");
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
