/**
 * Commerce Service — Cart, Wishlist, Reviews
 * Matched to the ACTUAL backend routes.
 *
 * Cart routes (guest-friendly — no auth required for GET/POST/PATCH/DELETE):
 *   GET    /commerce/cart
 *   POST   /commerce/cart/items        body: { variant, quantity }
 *   PATCH  /commerce/cart/items/:id    body: { quantity }
 *   DELETE /commerce/cart/items/:id
 *   DELETE /commerce/cart
 *
 * Wishlist routes (auth required):
 *   GET    /commerce/wishlist
 *   POST   /commerce/wishlist          body: { variant }
 *   DELETE /commerce/wishlist/:id
 *
 * Review routes:
 *   GET    /commerce/reviews           ?variant=<id>   (public, published only)
 *   POST   /commerce/reviews           { variant, rating, comment } (auth required)
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/apiClient";
import type {
  Cart,
  CartItem,
  AddCartItemPayload,
  UpdateCartItemPayload,
  WishlistItem,
  AddWishlistItemPayload,
  Review,
  CreateReviewPayload,
  PaginatedResponse,
} from "@/lib/types/catalog";

/* ─────────────────────────────────────────────
   CART
   Backend supports guest sessions via sessionId cookie.
   No auth header needed for cart operations.
───────────────────────────────────────────── */

/**
 * Get the current cart (guest or authenticated).
 * The backend identifies the cart by auth token OR session cookie.
 */
export async function getCart(): Promise<Cart> {
  return apiGet<Cart>("/commerce/cart");
}

/**
 * Add a variant to the cart.
 * If the variant is already in the cart the backend updates the quantity.
 */
export async function addToCart(
  payload: AddCartItemPayload,
): Promise<CartItem> {
  return apiPost<CartItem>("/commerce/cart/items", payload);
}

/**
 * Update the quantity of a specific cart item.
 */
export async function updateCartItem(
  itemId: string,
  payload: UpdateCartItemPayload,
): Promise<CartItem> {
  return apiPatch<CartItem>(`/commerce/cart/items/${itemId}`, payload);
}

/**
 * Remove a single item from the cart.
 */
export async function removeFromCart(itemId: string): Promise<void> {
  return apiDelete(`/commerce/cart/items/${itemId}`);
}

/**
 * Clear the entire cart.
 */
export async function clearCart(): Promise<void> {
  return apiDelete("/commerce/cart");
}

/* ─────────────────────────────────────────────
   WISHLIST
   Requires customer authentication.
───────────────────────────────────────────── */

/**
 * Get all wishlist items for the authenticated customer.
 */
export async function getWishlist(
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResponse<WishlistItem>> {
  const qs =
    params.page || params.limit
      ? `?page=${params.page ?? 1}&limit=${params.limit ?? 20}`
      : "";
  return apiGet<PaginatedResponse<WishlistItem>>(`/commerce/wishlist${qs}`);
}

/**
 * Add a product variant to the wishlist.
 * Backend returns 200 "already in wishlist" if duplicate — not an error.
 */
export async function addToWishlist(
  payload: AddWishlistItemPayload,
): Promise<WishlistItem> {
  return apiPost<WishlistItem>("/commerce/wishlist", payload);
}

/**
 * Remove an item from the wishlist by wishlist item _id.
 */
export async function removeFromWishlist(
  wishlistItemId: string,
): Promise<void> {
  return apiDelete(`/commerce/wishlist/${wishlistItemId}`);
}

/* ─────────────────────────────────────────────
   REVIEWS
───────────────────────────────────────────── */

/**
 * Get published reviews for a specific product variant.
 * Public endpoint — no auth required.
 */
export async function getReviews(
  variantId: string,
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResponse<Review>> {
  const { page = 1, limit = 20 } = params;
  return apiGet<PaginatedResponse<Review>>(
    `/commerce/reviews?variant=${variantId}&page=${page}&limit=${limit}`,
    { skipAuth: true },
  );
}

/**
 * Submit a review for a product variant.
 * Requires customer authentication.
 * The review is created with status "pending" until moderated.
 */
export async function createReview(
  payload: CreateReviewPayload,
): Promise<Review> {
  return apiPost<Review>("/commerce/reviews", payload);
}
