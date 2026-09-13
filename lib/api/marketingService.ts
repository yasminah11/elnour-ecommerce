/**
 * Marketing Service — Promotions & Coupons
 * Matched to the ACTUAL backend routes.
 *
 * Promotion routes (public — backend filters isActive=true automatically):
 *   GET  /marketing/promotions        ?page=1&limit=20
 *   GET  /marketing/promotions/:id
 *
 * Coupon routes (auth required — customer applies coupon at checkout):
 *   GET  /marketing/coupons           (staff only — not for storefront)
 *   GET  /marketing/coupons/:id       (staff only)
 */

import { apiGet } from "@/lib/api/apiClient";
import type { Promotion, PaginatedResponse } from "@/lib/types/catalog";

/* ─────────────────────────────────────────────
   PROMOTIONS
   Public endpoint — returns only active promotions.
   The backend populates the "variants" array.
───────────────────────────────────────────── */

export interface GetPromotionsParams {
  page?: number;
  limit?: number;
}

/**
 * List active promotions (Best Deals section, sale banners, etc.)
 * Backend automatically filters isActive=true.
 */
export async function getPromotions(
  params: GetPromotionsParams = {},
): Promise<PaginatedResponse<Promotion>> {
  const { page = 1, limit = 20 } = params;
  return apiGet<PaginatedResponse<Promotion>>(
    `/marketing/promotions?page=${page}&limit=${limit}`,
    { skipAuth: true },
  );
}

/**
 * Get a single promotion by ID.
 * Used for promotion detail pages / banners.
 */
export async function getPromotionById(id: string): Promise<Promotion> {
  return apiGet<Promotion>(`/marketing/promotions/${id}`, { skipAuth: true });
}

/* ─────────────────────────────────────────────
   NOTE: Coupon validation at checkout
   The /marketing/coupons endpoint is staff-only.
   Coupon codes are applied at order placement time.
   See order.validation.js: { couponCode?: joi.string() }
───────────────────────────────────────────── */
