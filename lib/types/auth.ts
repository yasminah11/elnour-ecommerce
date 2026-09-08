/**
 * Shared TypeScript types — matched to the ACTUAL backend Mongoose schema.
 *
 * Key differences from initial frontend assumptions:
 *  - Address uses { city, details, isDefault } NOT { city, street, is_default }
 *  - API responses are wrapped: { message: string, data: T }
 *  - Tokens are { access_token, refresh_token } NOT { access, refresh }
 *  - Auth header is "auth: bearer <token>" NOT "Authorization: Bearer <token>"
 *  - Refresh token uses GET with "authentication" header
 *  - Endpoints: /auth/user/* (not /auth/*)
 *  - No separate /customers/addresses — addresses are inside profile
 */

/* ─────────────────────────────────────────────
   API Response wrapper — backend always returns { message, data }
───────────────────────────────────────────── */

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
}

/* ─────────────────────────────────────────────
   Tokens — backend returns access_token + refresh_token
───────────────────────────────────────────── */

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface DecodedToken {
  exp: number;
  authId?: string;
}

/* ─────────────────────────────────────────────
   Address — FR-AUTH-06
   Backend fields: city, details, isDefault (NOT street, is_default)
───────────────────────────────────────────── */

export interface Address {
  _id: string;
  city: string;
  details: string; // backend uses "details" not "street"
  isDefault: boolean; // backend uses "isDefault" not "is_default"
}

/* ─────────────────────────────────────────────
   Billing Info — FR-AUTH-03
───────────────────────────────────────────── */

export interface BillingInfo {
  billingName: string;
  billingAddress: string;
}

/* ─────────────────────────────────────────────
   Business Info — FR-AUTH-05
───────────────────────────────────────────── */

export interface BusinessInfo {
  companyName: string;
  companyBillingInfo?: string;
}

/* ─────────────────────────────────────────────
   User — matches backend authSchema
───────────────────────────────────────────── */

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  authProvider: "local" | "google";
  customerType: "registered" | "business";
  billingInfo?: BillingInfo;
  businessInfo?: BusinessInfo;
  addresses: Address[];
  confirmed: boolean;
  changeCredential?: string;
}

/* ─────────────────────────────────────────────
   Auth request / response payloads
───────────────────────────────────────────── */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cPassword: string;
  phone: string;
  address?: Omit<Address, "_id">;
  billingInfo?: BillingInfo;
  customerType?: "registered" | "business";
  businessInfo?: BusinessInfo;
}

export interface RegisterResponse {
  message: string;
  data?: User;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  billingInfo?: BillingInfo;
  businessInfo?: BusinessInfo;
}

/* ─────────────────────────────────────────────
   OTP / Email confirmation
───────────────────────────────────────────── */

export interface ConfirmEmailPayload {
  email: string;
  code: string;
}

export interface ResendOtpPayload {
  email: string;
}

/* ─────────────────────────────────────────────
   Password update
───────────────────────────────────────────── */

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/* ─────────────────────────────────────────────
   Address payloads
───────────────────────────────────────────── */

export interface AddAddressPayload {
  city: string;
  details: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  city?: string;
  details?: string;
  isDefault?: boolean;
}

/* ─────────────────────────────────────────────
   API error shape
───────────────────────────────────────────── */

export type ApiFieldErrors = Record<string, string[]>;

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: ApiFieldErrors;
}

/* ─────────────────────────────────────────────
   Linked authentication providers — derived from user.authProvider
───────────────────────────────────────────── */

export type AuthProvider = "google" | "local";

export interface LinkedProvider {
  provider: AuthProvider;
  connected_at?: string;
}
