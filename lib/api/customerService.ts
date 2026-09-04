/**
 * Customer account service.
 *
 * All customer-profile and address API calls live here.
 *
 * Confirmed requirements (from SRS + task spec):
 *   FR-AUTH-03 — account data: name, email, phone, billing info
 *   FR-AUTH-05 — business/company information
 *   FR-AUTH-06 — saved addresses
 *   Task spec  — "Personal Information": fetch + update
 *                "Linked Authentication": see authService.ts
 *
 *   EVERY endpoint path below is a PLACEHOLDER.
 *     Replace with real paths once the backend confirms the API contract.
 *     Field names in request/response bodies are also placeholders —
 *     confirm each one against the real backend.
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/apiClient";
import type {
  User,
  Address,
  UpdateProfilePayload,
  BusinessInfo,
} from "@/lib/types/auth";

/* ── Profile ─────────────────────────────────────────────────────────── */

/**
 * Fetch the currently authenticated user's profile.
 *
 *   Endpoint path: CONFIRM with backend (placeholder: "/auth/me/")
 *   Response shape: CONFIRM — see User type in lib/types/auth.ts
 *   If loginApi already returns the user object, this call may only be
 *     needed on page load / refresh — confirm with backend.
 */
export async function getMeApi(): Promise<User> {
  return apiGet<User>("/auth/me/");
}

/**
 * Partially update the authenticated user's personal information.
 *
 *   Endpoint path: CONFIRM with backend (placeholder: "/auth/me/")
 *   HTTP method: CONFIRM — PATCH assumed (partial update).
 *     Backend may require PUT (full replacement).
 *   Request body field names: CONFIRM — see UpdateProfilePayload type.
 */
export async function updateMeApi(payload: UpdateProfilePayload): Promise<User> {
  return apiPatch<User>("/auth/me/", payload);
}

/* ── Business information ────────────────────────────────────────────── */

/**
 * Update business/company information for a business-type account.
 * (FR-AUTH-05)
 *
 *   This is currently sent as part of the main profile PATCH.
 *     The backend may expose a separate endpoint for business info — CONFIRM.
 *   Request body field names: CONFIRM — see BusinessInfo type.
 */
export async function updateBusinessInfoApi(info: BusinessInfo): Promise<User> {
  return apiPatch<User>("/auth/me/", { business_info: info });
}

/* ── Addresses ───────────────────────────────────────────────────────── */
/* Source: FR-AUTH-06 — customers can maintain saved addresses            */

/**
 *   Endpoint path: CONFIRM with backend (placeholder: "/customers/addresses/")
 *   Response shape: CONFIRM — Address[] assumed.
 *   Addresses may be embedded in the User object rather than a separate
 *     endpoint — confirm with backend.
 */
export async function getAddressesApi(): Promise<Address[]> {
  return apiGet<Address[]>("/customers/addresses/");
}

/**
 *   Endpoint path: CONFIRM (placeholder: "/customers/addresses/")
 *   Request body field names: CONFIRM — see Address type.
 */
export async function createAddressApi(
  address: Omit<Address, "id">
): Promise<Address> {
  return apiPost<Address>("/customers/addresses/", address);
}

/**
 *   Endpoint path: CONFIRM (placeholder: "/customers/addresses/{id}/")
 *   HTTP method: CONFIRM — PATCH assumed.
 */
export async function updateAddressApi(
  id: number,
  updates: Partial<Omit<Address, "id">>
): Promise<Address> {
  return apiPatch<Address>(`/customers/addresses/${id}/`, updates);
}

/**
 *   Endpoint path: CONFIRM (placeholder: "/customers/addresses/{id}/")
 */
export async function deleteAddressApi(id: number): Promise<void> {
  return apiDelete(`/customers/addresses/${id}/`);
}

/**
 * Marks one address as the default delivery address.
 *
 *   Endpoint path: CONFIRM (placeholder: "/customers/addresses/{id}/")
 *   The backend may handle this via a dedicated action endpoint rather
 *     than a plain PATCH — confirm with backend.
 */
export async function setDefaultAddressApi(id: number): Promise<Address> {
  return apiPatch<Address>(`/customers/addresses/${id}/`, { is_default: true });
}