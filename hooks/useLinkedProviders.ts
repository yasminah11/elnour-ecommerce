"use client";

/**
 * useLinkedProviders hook — simplified to use the user.authProvider field.
 *
 * The backend does NOT have a separate /auth/linked-providers endpoint.
 * Auth provider info is in the User object (authProvider: "local" | "google").
 *
 * The Linked Authentication section of the account page now uses the
 * authProvider field from the user object directly instead of this hook.
 * This hook is kept for backwards compatibility.
 */

import { useAuth } from "@/context/AuthContext";
import type { LinkedProvider } from "@/lib/types/auth";

export function useLinkedProviders() {
  const { user } = useAuth();

  // Derive providers from the user's authProvider field
  const providers: LinkedProvider[] =
    user?.authProvider && user.authProvider !== "local"
      ? [{ provider: user.authProvider }]
      : [];

  return {
    providers,
    isFetching: false,
    fetchError: null,
    isLinking: false,
    linkError: null,
    linkProvider: async () => {},
    unlinkProvider: async () => {},
    refetch: async () => {},
  };
}
