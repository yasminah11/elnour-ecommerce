"use client";

/**
 * useLinkedProviders hook.
 *
 * Manages the list of third-party authentication providers linked to the
 * authenticated account ("Linked Authentication" — required by task spec).
 *
 * Provides: fetch, link a provider, unlink a provider.
 *
 * ⚠️  The backend endpoints for linked providers have NOT been confirmed.
 *     All API calls go through authService.ts where the placeholder paths
 *     are documented. This hook will work correctly once those paths are
 *     replaced with real ones.
 *
 * ⚠️  The set of supported providers (e.g. "google", "facebook") is NOT
 *     hardcoded here — it will come from the backend response at runtime.
 *     The UI should render whatever providers the backend returns.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getLinkedProvidersApi,
  linkProviderApi,
  unlinkProviderApi,
} from "@/lib/api/authService";
import type { AuthProvider, LinkedProvider, ApiError } from "@/lib/types/auth";
import { useAuth } from "@/context/AuthContext";

export function useLinkedProviders() {
  const { isAuthenticated } = useAuth();

  const [providers, setProviders] = useState<LinkedProvider[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  /* ── Fetch ───────────────────────────────────────────────────────────── */

  const fetchProviders = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await getLinkedProvidersApi();
      setProviders(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setFetchError(apiErr?.message ?? "Failed to load linked accounts.");
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
        const data = await getLinkedProvidersApi();
        if (!cancelled) setProviders(data);
      } catch (err: unknown) {
        if (!cancelled) {
          const apiErr = err as ApiError;
          setFetchError(apiErr?.message ?? "Failed to load linked accounts.");
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

  /* ── Link ────────────────────────────────────────────────────────────── */

  /**
   * Links a third-party OAuth provider to the authenticated account.
   *
   * @param provider  The provider identifier (e.g. "google") — must match
   *                  what the backend expects. ⚠️ Confirm with backend.
   * @param token     The OAuth token / code returned by the provider's SDK.
   *                  ⚠️ The exact field name/structure must be confirmed with backend.
   */
  const linkProvider = useCallback(
    async (provider: AuthProvider, token: string) => {
      setIsLinking(true);
      setLinkError(null);
      try {
        const linked = await linkProviderApi({ provider, token });
        setProviders((prev) => [...prev, linked]);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setLinkError(apiErr?.message ?? "Failed to link account.");
        throw err;
      } finally {
        setIsLinking(false);
      }
    },
    [],
  );

  /* ── Unlink ──────────────────────────────────────────────────────────── */

  const unlinkProvider = useCallback(async (provider: AuthProvider) => {
    setIsLinking(true);
    setLinkError(null);
    try {
      await unlinkProviderApi(provider);
      setProviders((prev) => prev.filter((p) => p.provider !== provider));
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setLinkError(apiErr?.message ?? "Failed to unlink account.");
      throw err;
    } finally {
      setIsLinking(false);
    }
  }, []);

  return {
    providers,
    isFetching,
    fetchError,
    isLinking,
    linkError,
    linkProvider,
    unlinkProvider,
    refetch: fetchProviders,
  };
}
