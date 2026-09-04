/**
 * Shared TypeScript types for authentication and customer accounts.
 *
 * These types are shaped by the confirmed SRS requirements:
 *   FR-AUTH-03 — account fields (name, email, phone, address data, billing info)
 *   FR-AUTH-04 — login, logout, password reset, session protection
 *   FR-AUTH-05 — business/company information
 *   FR-AUTH-06 — saved addresses
 *
 * ⚠️  Field names marked with [CONFIRM] must be verified against the real
 *     backend API response before going to production. Do not treat them
 *     as authoritative until the backend team confirms the contract.
 */

/* ─────────────────────────────────────────────
   Tokens
   ⚠️  The token format (JWT vs opaque vs session)
   has NOT been confirmed. These types assume the
   backend returns two string tokens (access + refresh).
   Update if the backend uses a different scheme.
───────────────────────────────────────────── */

export interface TokenPair {
  access: string;
  refresh: string;
}

/**
 * Minimal decoded token shape — only `exp` is used client-side
 * (to check whether the token is still valid before making a request).
 * ⚠️  Only applies if the backend issues JWTs. Remove if not.
 */
export interface DecodedToken {
  /** Expiry timestamp in seconds since epoch */
  exp: number;
}

/* ─────────────────────────────────────────────
   User / Customer
   Source: FR-AUTH-03, FR-AUTH-05
───────────────────────────────────────────── */

/**
 * Business/company information.
 * Required by FR-AUTH-05.
 * ⚠️  Field names [CONFIRM] with backend.
 */
export interface BusinessInfo {
  company_name: string; // [CONFIRM]
  tax_id?: string; // [CONFIRM] — may not exist on backend
  billing_address?: string; // [CONFIRM]
}

/**
 * A saved delivery address.
 * Required by FR-AUTH-06.
 * ⚠️  All field names [CONFIRM] with backend.
 */
export interface Address {
  id: number;
  label?: string; // [CONFIRM] — user-defined nickname, may not exist
  city: string;
  street: string;
  building?: string; // [CONFIRM]
  floor?: string; // [CONFIRM]
  apartment?: string; // [CONFIRM]
  is_default: boolean; // [CONFIRM]
}

/**
 * The authenticated user / customer.
 * Source: FR-AUTH-03.
 * ⚠️  All field names [CONFIRM] with backend.
 */
export interface User {
  id: number;
  first_name: string; // [CONFIRM]
  last_name: string; // [CONFIRM]
  email: string;
  phone: string;
  /** FR-AUTH-05 — individual or business account */
  customer_type: "individual" | "business"; // [CONFIRM] — exact values TBD
  business_info?: BusinessInfo | null; // [CONFIRM] — may be nested or separate
  addresses: Address[]; // [CONFIRM] — may be a separate endpoint
  date_joined?: string; // [CONFIRM] — ISO 8601, may not be returned
}

/* ─────────────────────────────────────────────
   Auth request / response payloads
   Source: FR-AUTH-04
   ⚠️  All field names [CONFIRM] with backend.
───────────────────────────────────────────── */

export interface LoginPayload {
  email: string; // [CONFIRM] — backend may accept phone instead of/as well as email
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User; // [CONFIRM] — backend may not return user here; may need a separate /me call
}

export interface RegisterPayload {
  first_name: string; // [CONFIRM]
  last_name: string; // [CONFIRM]
  email: string;
  phone: string;
  password: string;
  password_confirm: string; // [CONFIRM] — field name may differ on backend
  customer_type?: "individual" | "business"; // [CONFIRM]
  business_info?: BusinessInfo; // [CONFIRM]
}

/**
 * Registration response.
 * ⚠️  The backend may auto-login (return tokens) or require a separate login
 * step. Both cases are represented; the AuthContext handles both.
 * Confirm which behaviour the backend implements.
 */
export interface RegisterResponse {
  user: User;
  /** Present if the backend auto-logs in after registration */
  access?: string; // [CONFIRM]
  refresh?: string; // [CONFIRM]
  /** Present if the backend requires email/phone verification before login */
  message?: string; // [CONFIRM]
  detail?: string; // [CONFIRM]
}

export interface RefreshResponse {
  access: string;
  refresh?: string; // [CONFIRM] — some backends rotate the refresh token
}

export interface UpdateProfilePayload {
  first_name?: string; // [CONFIRM]
  last_name?: string; // [CONFIRM]
  phone?: string;
  customer_type?: "individual" | "business"; // [CONFIRM]
  business_info?: BusinessInfo; // [CONFIRM]
}

/* ─────────────────────────────────────────────
   Linked authentication providers
   Source: "Linked Authentication" feature in task
   ⚠️  The list of supported providers and the
   endpoint contract are fully TBD — to be
   confirmed with the backend team.
───────────────────────────────────────────── */

/**
 * A generic provider identifier string.
 * ⚠️  Replace with a union of the actual provider names once confirmed.
 * e.g. "google" | "facebook" — DO NOT invent these now.
 */
export type AuthProvider = string;

export interface LinkedProvider {
  provider: AuthProvider;
  connected_at: string; // [CONFIRM]
}

export interface LinkProviderPayload {
  provider: AuthProvider;
  /** OAuth token or code returned by the provider's SDK */
  token: string; // [CONFIRM] — the exact field name/structure depends on backend
}

/* ─────────────────────────────────────────────
   API error shape
───────────────────────────────────────────── */

/**
 * Backend validation errors keyed by field name.
 * Values are arrays of error message strings.
 *   This shape is typical for REST frameworks but must be confirmed.
 */
export type ApiFieldErrors = Record<string, string[]>;

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: ApiFieldErrors;
}
