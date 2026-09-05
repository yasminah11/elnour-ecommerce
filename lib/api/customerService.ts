/**
 * Customer account service.
 * Routes matched to the backend update_Profile controller.
 *
 * Backend endpoints:
 *   GET  /auth/me                    — get current user profile
 *   PATCH /auth/update-profile        — update_Profile controller
 *   GET  /customers/addresses         — list addresses (FR-AUTH-06)
 *   POST /customers/addresses         — create address
 *   PATCH /customers/addresses/:id    — update address
 *   DELETE /customers/addresses/:id   — delete address
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/apiClient";
import type {
  User,
  Address,
  UpdateProfilePayload,
  BusinessInfo,
} from "@/lib/types/auth";

/* ── Profile ─────────────────────────────────────────────────────────── */

export async function getMeApi(): Promise<User> {
  return apiGet<User>("/auth/me");
}

export async function updateMeApi(
  payload: UpdateProfilePayload,
): Promise<User> {
  return apiPatch<User>("/auth/update-profile", payload);
}

/* ── Business information (FR-AUTH-05) ───────────────────────────────── */

export async function updateBusinessInfoApi(info: BusinessInfo): Promise<User> {
  return apiPatch<User>("/auth/update-profile", { businessInfo: info });
}

/* ── Addresses (FR-AUTH-06) ──────────────────────────────────────────── */

export async function getAddressesApi(): Promise<Address[]> {
  return apiGet<Address[]>("/customers/addresses");
}

export async function createAddressApi(
  address: Omit<Address, "_id">,
): Promise<Address> {
  return apiPost<Address>("/customers/addresses", address);
}

export async function updateAddressApi(
  id: string,
  updates: Partial<Omit<Address, "_id">>,
): Promise<Address> {
  return apiPatch<Address>(`/customers/addresses/${id}`, updates);
}

export async function deleteAddressApi(id: string): Promise<void> {
  return apiDelete(`/customers/addresses/${id}`);
}

export async function setDefaultAddressApi(id: string): Promise<Address> {
  return apiPatch<Address>(`/customers/addresses/${id}`, { is_default: true });
}
