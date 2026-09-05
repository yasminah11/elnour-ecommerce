"use client";

/**
 * Register page — updated to match backend signUp field names:
 *   firstName, lastName, cPassword
 * Also handles OTP confirmation step if backend requires email verification.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRegister } from "@/hooks/useRegister";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, confirmEmail, resendOtp } = useAuth();
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/account");
  }, [isAuthenticated, router]);

  const {
    values,
    errors,
    apiError,
    successMessage,
    isLoading,
    handleChange,
    handleSubmit,
  } = useRegister({
    onSuccess: (data) => {
      if (data.access) {
        router.push("/account");
      } else {
        // Backend requires email confirmation
        setRegisteredEmail(values.email);
        setNeedsConfirmation(true);
      }
    },
  });

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setOtpError("يرجى إدخال كود التحقق.");
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await confirmEmail({ email: registeredEmail, code: otpCode });
      router.push("/login");
    } catch {
      setOtpError("الكود غير صحيح أو انتهت صلاحيته. يرجى المحاولة مرة أخرى.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await resendOtp({ email: registeredEmail });
      setResendSuccess(true);
    } catch {
      setOtpError("فشل إرسال الكود. يرجى المحاولة مرة أخرى.");
    } finally {
      setResendLoading(false);
    }
  };

  /* ── OTP confirmation step ────────────────────────────────────────── */
  if (needsConfirmation) {
    return (
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">تأكيد البريد الإلكتروني</h1>
        <p className="text-sm text-gray-600 mb-6">
          تم إرسال كود التحقق إلى <strong>{registeredEmail}</strong>
        </p>

        {otpError && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm"
          >
            {otpError}
          </div>
        )}
        {resendSuccess && (
          <div
            role="status"
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm"
          >
            تم إرسال كود جديد بنجاح.
          </div>
        )}

        <form onSubmit={handleOtpSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm font-medium mb-1">
              كود التحقق
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={otpLoading}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={otpLoading}
            className="w-full bg-[#1a3a6b] text-white py-2 rounded font-semibold text-sm disabled:opacity-60 mb-3"
          >
            {otpLoading ? "جاري التحقق…" : "تأكيد"}
          </button>
        </form>

        <button
          onClick={handleResendOtp}
          disabled={resendLoading}
          className="w-full text-sm text-[#1a3a6b] hover:underline disabled:opacity-50"
        >
          {resendLoading ? "جاري الإرسال…" : "إعادة إرسال الكود"}
        </button>
      </div>
    );
  }

  /* ── Registration form ────────────────────────────────────────────── */
  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6">إنشاء حساب</h1>

      {apiError && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm"
        >
          {apiError}
        </div>
      )}
      {successMessage && (
        <div
          role="status"
          className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm"
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            الاسم الأول
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={values.firstName}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.firstName && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.firstName}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            الاسم الأخير
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={values.lastName}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.lastName && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.lastName}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.email && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            رقم الهاتف
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.phone && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.password && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="cPassword" className="block text-sm font-medium mb-1">
            تأكيد كلمة المرور
          </label>
          <input
            id="cPassword"
            name="cPassword"
            type="password"
            autoComplete="new-password"
            value={values.cPassword}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {errors.cPassword && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.cPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1a3a6b] text-white py-2 rounded font-semibold text-sm disabled:opacity-60"
        >
          {isLoading ? "جاري إنشاء الحساب…" : "إنشاء حساب"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600">
        لديك حساب بالفعل?{" "}
        <Link
          href="/login"
          className="text-[#1a3a6b] font-semibold hover:underline"
        >
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
