"use client";

/**
 * Account page — app/account/page.tsx
 *
 * TEMPORARY minimal UI. All business logic lives in the hooks below.
 * Replace only the JSX inside this file when the final design is ready.
 *
 * What this component does:
 *   - Protects the route: redirects unauthenticated users to /login
 *   - Displays the authenticated user's personal information (read mode)
 *   - Provides an inline edit form for personal information (useProfile)
 *   - Lists linked authentication providers (useLinkedProviders)
 *   - Lists saved addresses (useAddresses)
 *   - Provides a logout button
 *
 * Sections that need UI/UX design before they are production-ready:
 *   - The full account dashboard layout
 *   - Add / edit / delete address forms
 *   - Link / unlink provider UI (buttons per provider)
 *   - Business information section (for business accounts)
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useLinkedProviders } from "@/hooks/useLinkedProviders";
import { useAddresses } from "@/hooks/useAddresses";

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const {
    user,
    isUpdating,
    updateError,
    updateSuccess,
    updateProfile,
    resetFeedback,
  } = useProfile();
  const {
    providers,
    isFetching: fetchingProviders,
    fetchError: providersError,
  } = useLinkedProviders();
  const {
    addresses,
    isFetching: fetchingAddresses,
    fetchError: addressesError,
  } = useAddresses();

  // ── Route guard ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // ── Local edit form state ─────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const handleEditStart = () => {
    if (!user) return;
    setEditValues({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
    });
    setEditMode(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
    resetFeedback();
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(editValues);
      setEditMode(false);
    } catch {
      // updateError is surfaced via useProfile
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // ── Loading / auth guard ─────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Account</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Sign Out
        </button>
      </div>

      {/* ── Personal Information ──────────────────────────────────────── */}
      <section className="mb-8 p-4 border border-gray-200 rounded">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Personal Information</h2>
          {!editMode && (
            <button
              onClick={handleEditStart}
              className="text-sm text-[#1a3a6b] hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {updateError && (
          <div
            role="alert"
            className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm"
          >
            {updateError}
          </div>
        )}
        {updateSuccess && (
          <div
            role="status"
            className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm"
          >
            Profile updated successfully.
          </div>
        )}

        {editMode ? (
          <form onSubmit={handleProfileSave}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={editValues.first_name}
                  onChange={handleEditChange}
                  disabled={isUpdating}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={editValues.last_name}
                  onChange={handleEditChange}
                  disabled={isUpdating}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Phone</label>
              <input
                name="phone"
                value={editValues.phone}
                onChange={handleEditChange}
                disabled={isUpdating}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-1.5 bg-[#1a3a6b] text-white text-sm rounded disabled:opacity-60"
              >
                {isUpdating ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  resetFeedback();
                }}
                className="px-4 py-1.5 border border-gray-300 text-sm rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">Name</dt>
            <dd>
              {user.first_name} {user.last_name}
            </dd>
            <dt className="text-gray-500">Email</dt>
            <dd>{user.email}</dd>
            <dt className="text-gray-500">Phone</dt>
            <dd>{user.phone}</dd>
            <dt className="text-gray-500">Account type</dt>
            <dd className="capitalize">{user.customer_type}</dd>
          </dl>
        )}
      </section>

      {/* ── Linked Authentication ─────────────────────────────────────── */}
      <section className="mb-8 p-4 border border-gray-200 rounded">
        <h2 className="font-semibold mb-3">Linked Accounts</h2>
        {fetchingProviders ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : providersError ? (
          <p className="text-sm text-red-500">{providersError}</p>
        ) : providers.length === 0 ? (
          <p className="text-sm text-gray-500">
            No linked accounts.
            {/* TODO: Link/unlink buttons will be added with the final UI design
                once the backend confirms the supported providers. */}
          </p>
        ) : (
          <ul className="space-y-2">
            {providers.map((p) => (
              <li
                key={p.provider}
                className="flex items-center justify-between text-sm"
              >
                <span className="capitalize">{p.provider}</span>
                <span className="text-gray-400 text-xs">Connected</span>
                {/* TODO: Unlink button — add with final UI design */}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Saved Addresses ───────────────────────────────────────────── */}
      <section className="p-4 border border-gray-200 rounded">
        <h2 className="font-semibold mb-3">Saved Addresses</h2>
        {fetchingAddresses ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : addressesError ? (
          <p className="text-sm text-red-500">{addressesError}</p>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No saved addresses.
            {/* TODO: Add address form/button will be added with the final UI design */}
          </p>
        ) : (
          <ul className="space-y-2">
            {addresses.map((a) => (
              <li
                key={a.id}
                className="text-sm border border-gray-100 rounded p-2"
              >
                {a.label && <span className="font-medium">{a.label} — </span>}
                {a.city}, {a.street}
                {a.is_default && (
                  <span className="ml-2 text-xs text-green-600 font-semibold">
                    Default
                  </span>
                )}
                {/* TODO: Edit / Delete / Set Default buttons — add with final UI design */}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
