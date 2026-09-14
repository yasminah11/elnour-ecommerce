/**
 * Catalog & Commerce TypeScript types
 * Matched to the ACTUAL backend Mongoose schemas.
 *
 * Backend API base prefix:
 *   /catalog/categories       → Category
 *   /catalog/products         → Product
 *   /catalog/variants         → ProductVariant
 *   /catalog/images           → ProductImage
 *   /catalog/inventory        → InventoryRecord
 *   /marketing/promotions     → Promotion
 *   /commerce/cart            → Cart / CartItem
 *   /commerce/wishlist        → WishlistItem
 *   /commerce/reviews         → Review
 */

/* ─────────────────────────────────────────────
   Shared paginated response shape
   Backend factory returns: { message, data: { result, total, page, limit } }
   apiClient unwraps the outer .data, so you get { result, total, page, limit }
───────────────────────────────────────────── */
export interface PaginatedResponse<T> {
  result: T[];
  total: number;
  page: number;
  limit: number;
}

/* ─────────────────────────────────────────────
   Category
   Schema: name, nameAr, parentCategory, isActive
   Route:  GET /catalog/categories
───────────────────────────────────────────── */
export interface Category {
  _id: string;
  name: string;
  nameAr?: string;
  parentCategory?: string | Category | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────
   Product
   Schema: name, nameAr, category (ref), brand, description,
           descriptionAr, warranty, isActive
   Route:  GET /catalog/products
           GET /catalog/products?category=<id>&q=<search>
───────────────────────────────────────────── */
export interface Product {
  _id: string;
  name: string;
  nameAr?: string;
  category: string | Category;
  brand?: string;
  description?: string;
  descriptionAr?: string;
  warranty?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────
   Availability status enum
   Matches backend: catalog.enum.js → availabilityStatusEnum
───────────────────────────────────────────── */
export type AvailabilityStatus = "inStock" | "outOfStock" | "preorder";

/* ─────────────────────────────────────────────
   ProductVariant
   Schema: product (ref), sku, price, availabilityStatus,
           isPreorderEligible, preorderNote, isActive
   Route:  GET /catalog/variants?product=<id>
───────────────────────────────────────────── */
export interface ProductVariant {
  _id: string;
  product: string | Product;
  sku: string;
  price: number;
  availabilityStatus: AvailabilityStatus;
  isPreorderEligible: boolean;
  preorderNote?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────
   ProductImage
   Schema: variant (ref), url, altText, isPrimary, sortOrder
   Route:  GET /catalog/images?variant=<id>
───────────────────────────────────────────── */
export interface ProductImage {
  _id: string;
  variant: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────
   InventoryRecord
   Route:  GET /catalog/inventory?variant=<id>
───────────────────────────────────────────── */
export interface InventoryRecord {
  _id: string;
  variant: string;
  quantity: number;
  reservedQuantity: number;
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────
   Promotion
   Schema: name, nameAr, promoType, config, variants, startsAt, endsAt, isActive
   promoType: "percentage" | "fixedAmount" | "buyXGetY" | "xPlusY"
   Route:  GET /marketing/promotions   (public, only isActive=true)
───────────────────────────────────────────── */
export type PromoType = "percentage" | "fixedAmount" | "buyXGetY" | "xPlusY";

export interface Promotion {
  _id: string;
  name: string;
  nameAr?: string;
  promoType: PromoType;
  config: Record<string, unknown>; // e.g. { percentage: 10 } | { fixedAmount: 50 }
  variants: string[] | ProductVariant[];
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────
   Cart & CartItem
   Cart is guest-friendly (no auth required).
   Route:  GET  /commerce/cart
           POST /commerce/cart/items        { variant, quantity }
           PATCH /commerce/cart/items/:id   { quantity }
           DELETE /commerce/cart/items/:id
           DELETE /commerce/cart
───────────────────────────────────────────── */
export interface CartItem {
  _id: string;
  variant: string | ProductVariant;
  quantity: number;
}

export interface Cart {
  _id: string;
  user?: string;
  sessionId?: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddCartItemPayload {
  variant: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

/* ─────────────────────────────────────────────
   Wishlist
   Requires authentication.
   Route:  GET    /commerce/wishlist         (auth required)
           POST   /commerce/wishlist         { variant }
           DELETE /commerce/wishlist/:id
───────────────────────────────────────────── */
export interface WishlistItem {
  _id: string;
  user: string;
  variant: string | ProductVariant;
  createdAt: string;
  updatedAt: string;
}

export interface AddWishlistItemPayload {
  variant: string;
}

/* ─────────────────────────────────────────────
   Review
   Public GET returns only published reviews.
   Route:  GET  /commerce/reviews?variant=<id>   (public)
           POST /commerce/reviews                  (auth required)
───────────────────────────────────────────── */
export type ReviewStatus = "pending" | "published" | "rejected";

export interface Review {
  _id: string;
  user: string | { _id: string; firstName: string; lastName: string };
  variant: string;
  rating: number; // 1-5
  comment?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  variant: string;
  rating: number;
  comment?: string;
}

/* ─────────────────────────────────────────────
   SpecificationDefinition & SpecificationValue
   Route:  GET /catalog/specification-definitions
           GET /catalog/specification-values?variant=<id>
───────────────────────────────────────────── */
export interface SpecificationDefinition {
  _id: string;
  name: string;
  nameAr?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecificationValue {
  _id: string;
  variant: string;
  definition: string | SpecificationDefinition;
  value: string;
  createdAt: string;
  updatedAt: string;
}
