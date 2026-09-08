"use client";

/**
 * Account page — Customer Account (subtasks: Account Dashboard, Personal Information, Linked Authentication)
 *
 * Fixed to match actual backend:
 *  - Address fields: city, details, isDefault
 *  - No separate linked providers API (not implemented in backend)
 *  - Add/Edit address functionality included
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useAddresses } from "@/hooks/useAddresses";
import type { AddAddressPayload } from "@/lib/types/auth";

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
    addresses,
    isMutating,
    mutateError,
    addAddress,
    removeAddress,
    setDefault,
  } = useAddresses();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  /* ── Profile edit state ──────────────────────────────────────────── */
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleEditStart = () => {
    if (!user) return;
    setEditValues({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? "",
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

  /* ── Add address state ───────────────────────────────────────────── */
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<AddAddressPayload>({
    city: "",
    details: "",
    isDefault: false,
  });

  const handleAddAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      setShowAddAddress(false);
      setNewAddress({ city: "", details: "", isDefault: false });
    } catch {
      // mutateError surfaced below
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        جاري التحميل…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10" dir="rtl">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">حسابي</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* ── Account Dashboard info ────────────────────────────────────── */}
      <section className="mb-6 p-4 bg-[#f0f4f9] border border-[#d0daea] rounded">
        <p className="text-sm text-gray-700">
          مرحباً،{" "}
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          !
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {user.email} ·{" "}
          {user.confirmed ? "✅ البريد مؤكد" : "⏳ في انتظار تأكيد البريد"}
        </p>
      </section>

      {/* ── Personal Information ──────────────────────────────────────── */}
      <section className="mb-8 p-4 border border-gray-200 rounded">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">البيانات الشخصية</h2>
          {!editMode && (
            <button
              onClick={handleEditStart}
              className="text-sm text-[#1a3a6b] hover:underline"
            >
              تعديل
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
            تم تحديث البيانات بنجاح.
          </div>
        )}

        {editMode ? (
          <form onSubmit={handleProfileSave}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  الاسم الأول
                </label>
                <input
                  name="firstName"
                  value={editValues.firstName}
                  onChange={handleEditChange}
                  disabled={isUpdating}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  الاسم الأخير
                </label>
                <input
                  name="lastName"
                  value={editValues.lastName}
                  onChange={handleEditChange}
                  disabled={isUpdating}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">
                رقم الهاتف
              </label>
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
                {isUpdating ? "جاري الحفظ…" : "حفظ"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  resetFeedback();
                }}
                className="px-4 py-1.5 border border-gray-300 text-sm rounded"
              >
                إلغاء
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">الاسم</dt>
            <dd>
              {user.firstName} {user.lastName}
            </dd>
            <dt className="text-gray-500">البريد الإلكتروني</dt>
            <dd>{user.email}</dd>
            <dt className="text-gray-500">رقم الهاتف</dt>
            <dd>{user.phone ?? "—"}</dd>
            <dt className="text-gray-500">نوع الحساب</dt>
            <dd>{user.customerType === "business" ? "شركة" : "عميل"}</dd>
          </dl>
        )}
      </section>

      {/* ── Billing Info ─────────────────────────────────────────────── */}
      {user.billingInfo && (
        <section className="mb-8 p-4 border border-gray-200 rounded">
          <h2 className="font-semibold mb-3">بيانات الفوترة</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">الاسم</dt>
            <dd>{user.billingInfo.billingName}</dd>
            <dt className="text-gray-500">العنوان</dt>
            <dd>{user.billingInfo.billingAddress}</dd>
          </dl>
        </section>
      )}

      {/* ── Business Info ─────────────────────────────────────────────── */}
      {user.customerType === "business" && user.businessInfo && (
        <section className="mb-8 p-4 border border-gray-200 rounded">
          <h2 className="font-semibold mb-3">بيانات الشركة</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">اسم الشركة</dt>
            <dd>{user.businessInfo.companyName}</dd>
            {user.businessInfo.companyBillingInfo && (
              <>
                <dt className="text-gray-500">بيانات الفوترة</dt>
                <dd>{user.businessInfo.companyBillingInfo}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      {/* ── Linked Authentication ─────────────────────────────────────── */}
      <section className="mb-8 p-4 border border-gray-200 rounded">
        <h2 className="font-semibold mb-3">طريقة تسجيل الدخول</h2>
        <div className="flex items-center gap-2 text-sm">
          {user.authProvider === "google" ? (
            <>
              <span className="text-blue-600">🔗</span>
              <span>Google — متصل</span>
            </>
          ) : (
            <>
              <span>🔑</span>
              <span>بريد إلكتروني وكلمة مرور</span>
            </>
          )}
        </div>
      </section>

      {/* ── Saved Addresses ───────────────────────────────────────────── */}
      <section className="p-4 border border-gray-200 rounded">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">العناوين المحفوظة</h2>
          <button
            onClick={() => setShowAddAddress(true)}
            className="text-sm text-[#1a3a6b] hover:underline"
          >
            + إضافة عنوان
          </button>
        </div>

        {mutateError && (
          <div
            role="alert"
            className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm"
          >
            {mutateError}
          </div>
        )}

        {/* Add Address Form */}
        {showAddAddress && (
          <form
            onSubmit={handleAddAddress}
            className="mb-4 p-3 bg-gray-50 rounded border border-gray-200"
          >
            <h3 className="text-sm font-medium mb-2">عنوان جديد</h3>
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1">المدينة</label>
              <input
                name="city"
                value={newAddress.city}
                onChange={handleAddAddressChange}
                required
                disabled={isMutating}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1">
                التفاصيل (الشارع والمبنى)
              </label>
              <input
                name="details"
                value={newAddress.details}
                onChange={handleAddAddressChange}
                required
                disabled={isMutating}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                id="isDefault"
                checked={newAddress.isDefault}
                onChange={handleAddAddressChange}
                disabled={isMutating}
              />
              <label htmlFor="isDefault" className="text-xs">
                تعيين كعنوان افتراضي
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isMutating}
                className="px-4 py-1.5 bg-[#1a3a6b] text-white text-sm rounded disabled:opacity-60"
              >
                {isMutating ? "جاري الحفظ…" : "حفظ"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                className="px-4 py-1.5 border border-gray-300 text-sm rounded"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500">لا توجد عناوين محفوظة.</p>
        ) : (
          <ul className="space-y-2">
            {addresses.map((a) => (
              <li
                key={a._id}
                className="text-sm border border-gray-100 rounded p-3 flex items-start justify-between"
              >
                <div>
                  <p className="font-medium">{a.city}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{a.details}</p>
                  {a.isDefault && (
                    <span className="text-xs text-green-600 font-semibold mt-1 block">
                      ✓ افتراضي
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mr-2">
                  {!a.isDefault && (
                    <button
                      onClick={() => setDefault(a._id)}
                      disabled={isMutating}
                      className="text-xs text-[#1a3a6b] hover:underline disabled:opacity-50"
                    >
                      تعيين افتراضي
                    </button>
                  )}
                  <button
                    onClick={() => removeAddress(a._id)}
                    disabled={isMutating}
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
