/**
 * Shared TypeScript types — matched to the backend Mongoose schema and controllers.
 *
 * Backend schema fields:
 *   firstName, lastName, email, password, phone
 *   googleId, authProvider (local | google)
 *   addresses: [addressSchema]
 *   billingInfo: { billingName, billingAddress }
 *   customerType: registered | business
 *   businessInfo: { companyName, companyBillingInfo }
 *   changeCredential: Date
 *   confirmed: Boolean
 */

/* ─────────────────────────────────────────────
   Tokens — backend returns JWT access + refresh
───────────────────────────────────────────── */

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface DecodedToken {
  exp: number;
  id?: string;
}

/* ─────────────────────────────────────────────
   Address — FR-AUTH-06
───────────────────────────────────────────── */

export interface Address {
  _id: string;
  label?: string;
  city: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  is_default: boolean;
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
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cPassword: string; // confirm password — matches backend field name
  phone: string;
  address?: Omit<Address, "_id">;
  billingInfo?: BillingInfo;
  customerType?: "registered" | "business";
  businessInfo?: BusinessInfo;
}

export interface RegisterResponse {
  user?: User;
  access?: string;
  refresh?: string;
  /** Backend sends this when email confirmation is required */
  message?: string;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
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
   Linked authentication providers (Google OAuth)
───────────────────────────────────────────── */

export type AuthProvider = "google" | "local";

export interface LinkedProvider {
  provider: AuthProvider;
  connected_at?: string;
}

export interface LinkProviderPayload {
  provider: AuthProvider;
  token: string;
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
