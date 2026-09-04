/**
 * Client-side validation helpers for auth forms.
 *
 * Philosophy:
 *   - Validate only what is genuinely useful before a network round-trip:
 *     empty required fields and obviously wrong formats.
 *   - Do NOT duplicate backend business rules. Backend validation errors
 *     are surfaced through the ApiFieldErrors mechanism in each hook.
 *   - Do NOT invent rules that haven't been specified (e.g. exact password
 *     complexity rules — those belong to the backend).
 *
 *   The 8-character minimum password length is a basic UX guard only.
 *     The real password policy is enforced by the backend — confirm it
 *     and update this file to match if the backend requires stricter rules.
 *
 *   Phone validation: the SRS specifies the project is in Egypt and
 *     collects phone numbers (FR-AUTH-03), but does not specify a client-side
 *     format rule. The validation here only checks that the field is not empty.
 *     If the backend confirms an expected phone format, add the regex here.
 */

/* ── Individual field validators ──────────────────────────────────────── */

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export function validatePasswordConfirm(
  password: string,
  confirm: string,
): string | null {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required.`;
  return null;
}

/* ── Form-level validators ────────────────────────────────────────────── */

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;
  const passwordErr = validatePassword(values.password);
  if (passwordErr) errors.password = passwordErr;
  return errors;
}

export interface RegisterFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
}

export interface RegisterFormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirm?: string;
  [key: string]: string | undefined;
}

export function validateRegisterForm(
  values: RegisterFormValues,
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  const firstNameErr = validateRequired(values.first_name, "First name");
  if (firstNameErr) errors.first_name = firstNameErr;

  const lastNameErr = validateRequired(values.last_name, "Last name");
  if (lastNameErr) errors.last_name = lastNameErr;

  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;

  // Phone: only required check.  Add format validation once backend confirms expected format.
  const phoneErr = validateRequired(values.phone, "Phone number");
  if (phoneErr) errors.phone = phoneErr;

  const passwordErr = validatePassword(values.password);
  if (passwordErr) errors.password = passwordErr;

  const confirmErr = validatePasswordConfirm(
    values.password,
    values.password_confirm,
  );
  if (confirmErr) errors.password_confirm = confirmErr;

  return errors;
}

/** Returns true when the errors object has no populated string values. */
export function isFormValid<T extends Record<string, string | undefined>>(
  errors: T,
): boolean {
  return Object.values(errors).every((v) => v === undefined || v === "");
}
