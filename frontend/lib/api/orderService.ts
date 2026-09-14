/**
 * Order Service — Checkout, order tracking
 * Matched to the ACTUAL backend routes.
 *
 * Order routes (all require customer authentication):
 *   POST   /commerce/orders                         → checkout (creates order from cart)
 *   GET    /commerce/orders                         → list customer's orders
 *   GET    /commerce/orders/:id                     → single order detail
 *   PATCH  /commerce/orders/:id/cancel              → cancel order
 *
 * Checkout payload (from order.validation.js):
 *   fulfillmentMethod: "pickup" | "delivery"
 *   paymentMethod:     "cash" | "card" | "instapay" | ...
 *   customerInfo: { name, email, phone, city, addressDetails, billingInfo }
 *   appliedCoupons?: string[]   (coupon _ids)
 *   deliveryFee?: number
 */

import { apiGet, apiPost, apiPatch } from "@/lib/api/apiClient";
import type { PaginatedResponse } from "@/lib/types/catalog";

/* ─────────────────────────────────────────────
   Order types (basic — expand as needed)
───────────────────────────────────────────── */

export type FulfillmentMethod = "pickup" | "delivery";
// Backend fulfillmentMethodEnum — extend when backend adds more values
export type PaymentMethod =
  | "cash"
  | "card"
  | "instapay"
  | "creditCard"
  | "bankTransfer";

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
  city: string;
  addressDetails?: string;
  billingInfo?: string;
}

export interface CheckoutPayload {
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: PaymentMethod;
  customerInfo: OrderCustomerInfo;
  appliedCoupons?: string[]; // coupon _ids (optional)
  deliveryFee?: number; // pre-computed fee (optional, defaults to 0)
}

export interface Order {
  _id: string;
  user: string;
  status: string;
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: PaymentMethod;
  customerInfo: OrderCustomerInfo;
  items: Array<{
    variant: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  appliedCoupons?: string[];
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────
   API functions
───────────────────────────────────────────── */

/**
 * Place an order from the current cart.
 * Auth required. Cart is cleared by the backend after successful checkout.
 */
export async function checkout(payload: CheckoutPayload): Promise<Order> {
  return apiPost<Order>("/commerce/orders", payload);
}

/**
 * List the authenticated customer's orders.
 */
export async function getMyOrders(
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResponse<Order>> {
  const { page = 1, limit = 20 } = params;
  return apiGet<PaginatedResponse<Order>>(
    `/commerce/orders?page=${page}&limit=${limit}`,
  );
}

/**
 * Get a single order by ID.
 */
export async function getOrderById(orderId: string): Promise<Order> {
  return apiGet<Order>(`/commerce/orders/${orderId}`);
}

/**
 * Cancel an order.
 * Requires a cancellation reason.
 */
export async function cancelOrder(
  orderId: string,
  reason: string,
): Promise<Order> {
  return apiPatch<Order>(`/commerce/orders/${orderId}/cancel`, { reason });
}
