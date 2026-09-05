"use client";

/**
 * Account page — updated to match backend field names:
 *   firstName, lastName (camelCase — matches backend schema)
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

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
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">حسابي</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* ── Personal Information ─────────────────────────────────────── */}
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
            <dd className="capitalize">
              {user.customerType === "business" ? "شركة" : "عميل"}
            </dd>
            <dt className="text-gray-500">حالة البريد</dt>
            <dd>{user.confirmed ? "✅ مؤكد" : "⏳ في انتظار التأكيد"}</dd>
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

      {/* ── Linked Accounts ───────────────────────────────────────────── */}
      <section className="mb-8 p-4 border border-gray-200 rounded">
        <h2 className="font-semibold mb-3">الحسابات المرتبطة</h2>
        {fetchingProviders ? (
          <p className="text-sm text-gray-400">جاري التحميل…</p>
        ) : providersError ? (
          <p className="text-sm text-red-500">{providersError}</p>
        ) : providers.length === 0 ? (
          <p className="text-sm text-gray-500">لا توجد حسابات مرتبطة.</p>
        ) : (
          <ul className="space-y-2">
            {providers.map((p) => (
              <li
                key={p.provider}
                className="flex items-center justify-between text-sm"
              >
                <span className="capitalize">{p.provider}</span>
                <span className="text-gray-400 text-xs">متصل</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Saved Addresses ───────────────────────────────────────────── */}
      <section className="p-4 border border-gray-200 rounded">
        <h2 className="font-semibold mb-3">العناوين المحفوظة</h2>
        {fetchingAddresses ? (
          <p className="text-sm text-gray-400">جاري التحميل…</p>
        ) : addressesError ? (
          <p className="text-sm text-red-500">{addressesError}</p>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-gray-500">لا توجد عناوين محفوظة.</p>
        ) : (
          <ul className="space-y-2">
            {addresses.map((a) => (
              <li
                key={a._id}
                className="text-sm border border-gray-100 rounded p-2"
              >
                {a.label && <span className="font-medium">{a.label} — </span>}
                {a.city}, {a.street}
                {a.is_default && (
                  <span className="ml-2 text-xs text-green-600 font-semibold">
                    افتراضي
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
