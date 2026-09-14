/**
 * Client-side validation helpers for auth forms.
 * Field names match the backend schema:
 *   firstName, lastName, cPassword (confirm password), phone
 */

/* ── Individual field validators ──────────────────────────────────────── */

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "البريد الإلكتروني مطلوب.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "يرجى إدخال بريد إلكتروني صحيح.";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "كلمة المرور مطلوبة.";
  if (value.length < 7) return "كلمة المرور يجب أن تكون 7 أحرف على الأقل.";
  return null;
}

export function validatePasswordConfirm(
  password: string,
  confirm: string,
): string | null {
  if (!confirm) return "يرجى تأكيد كلمة المرور.";
  if (password !== confirm) return "كلمتا المرور غير متطابقتين.";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} مطلوب.`;
  return null;
}

/* ── Login form ────────────────────────────────────────────────────────── */

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

/* ── Register form — field names match backend signUp controller ───────── */

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  cPassword: string; // confirm password — matches backend field
}

export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  cPassword?: string;
  [key: string]: string | undefined;
}

export function validateRegisterForm(
  values: RegisterFormValues,
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  const firstNameErr = validateRequired(values.firstName, "الاسم الأول");
  if (firstNameErr) errors.firstName = firstNameErr;

  const lastNameErr = validateRequired(values.lastName, "الاسم الأخير");
  if (lastNameErr) errors.lastName = lastNameErr;

  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;

  const phoneErr = validateRequired(values.phone, "رقم الهاتف");
  if (phoneErr) errors.phone = phoneErr;

  const passwordErr = validatePassword(values.password);
  if (passwordErr) errors.password = passwordErr;

  const confirmErr = validatePasswordConfirm(values.password, values.cPassword);
  if (confirmErr) errors.cPassword = confirmErr;

  return errors;
}

/* ── OTP confirmation form ─────────────────────────────────────────────── */

export interface ConfirmEmailFormValues {
  email: string;
  code: string;
}

export interface ConfirmEmailFormErrors {
  email?: string;
  code?: string;
  [key: string]: string | undefined;
}

export function validateConfirmEmailForm(
  values: ConfirmEmailFormValues,
): ConfirmEmailFormErrors {
  const errors: ConfirmEmailFormErrors = {};
  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;
  if (!values.code.trim()) errors.code = "كود التحقق مطلوب.";
  return errors;
}

/* ── Update password form ──────────────────────────────────────────────── */

export interface UpdatePasswordFormValues {
  oldPassword: string;
  newPassword: string;
}

export interface UpdatePasswordFormErrors {
  oldPassword?: string;
  newPassword?: string;
  [key: string]: string | undefined;
}

export function validateUpdatePasswordForm(
  values: UpdatePasswordFormValues,
): UpdatePasswordFormErrors {
  const errors: UpdatePasswordFormErrors = {};
  if (!values.oldPassword) errors.oldPassword = "كلمة المرور الحالية مطلوبة.";
  const newPwErr = validatePassword(values.newPassword);
  if (newPwErr) errors.newPassword = newPwErr;
  return errors;
}

/** Returns true when the errors object has no populated string values. */
export function isFormValid<T extends Record<string, string | undefined>>(
  errors: T,
): boolean {
  return Object.values(errors).every((v) => v === undefined || v === "");
}
