/**
 * Catalog Service — matched to the ACTUAL backend routes.
 *
 * All catalog browsing endpoints are PUBLIC (no auth needed).
 *
 * Backend routes:
 *   GET  /catalog/categories
 *   GET  /catalog/categories/:id
 *   GET  /catalog/products          ?category=<id>&q=<search>&page=1&limit=20
 *   GET  /catalog/products/:id
 *   GET  /catalog/variants          ?product=<id>&page=1&limit=20
 *   GET  /catalog/variants/:id
 *   GET  /catalog/images            ?variant=<id>&page=1&limit=20
 *   GET  /catalog/specification-definitions
 *   GET  /catalog/specification-values  ?variant=<id>
 *   GET  /catalog/inventory         ?variant=<id>
 */

import { apiGet } from "@/lib/api/apiClient";
import type {
  Category,
  Product,
  ProductVariant,
  ProductImage,
  InventoryRecord,
  SpecificationDefinition,
  SpecificationValue,
  PaginatedResponse,
} from "@/lib/types/catalog";

/* ── List params ─────────────────────────────────────────────── */
export interface ListParams {
  page?: number;
  limit?: number;
}

/* ── Categories ──────────────────────────────────────────────── */

export async function getCategories(
  params: ListParams = {},
): Promise<PaginatedResponse<Category>> {
  const qs = buildQs(params);
  return apiGet<PaginatedResponse<Category>>(`/catalog/categories${qs}`, {
    skipAuth: true,
  });
}

export async function getCategoryById(id: string): Promise<Category> {
  return apiGet<Category>(`/catalog/categories/${id}`, { skipAuth: true });
}

/* ── Products ────────────────────────────────────────────────── */

export interface GetProductsParams extends ListParams {
  category?: string; // category _id
  q?: string; // search term (name regex)
}

export async function getProducts(
  params: GetProductsParams = {},
): Promise<PaginatedResponse<Product>> {
  const qs = buildQs(params);
  return apiGet<PaginatedResponse<Product>>(`/catalog/products${qs}`, {
    skipAuth: true,
  });
}

export async function getProductById(id: string): Promise<Product> {
  return apiGet<Product>(`/catalog/products/${id}`, { skipAuth: true });
}

/* ── Product Variants ────────────────────────────────────────── */

export interface GetVariantsParams extends ListParams {
  product?: string; // product _id
}

export async function getVariants(
  params: GetVariantsParams = {},
): Promise<PaginatedResponse<ProductVariant>> {
  const qs = buildQs(params);
  return apiGet<PaginatedResponse<ProductVariant>>(`/catalog/variants${qs}`, {
    skipAuth: true,
  });
}

export async function getVariantById(id: string): Promise<ProductVariant> {
  return apiGet<ProductVariant>(`/catalog/variants/${id}`, { skipAuth: true });
}

/* ── Product Images ──────────────────────────────────────────── */

export interface GetImagesParams extends ListParams {
  variant?: string; // variant _id
}

export async function getProductImages(
  params: GetImagesParams = {},
): Promise<PaginatedResponse<ProductImage>> {
  const qs = buildQs(params);
  return apiGet<PaginatedResponse<ProductImage>>(`/catalog/images${qs}`, {
    skipAuth: true,
  });
}

/* ── Specification Definitions ───────────────────────────────── */

export async function getSpecDefinitions(
  params: ListParams = {},
): Promise<PaginatedResponse<SpecificationDefinition>> {
  const qs = buildQs(params);
  return apiGet<PaginatedResponse<SpecificationDefinition>>(
    `/catalog/specification-definitions${qs}`,
    { skipAuth: true },
  );
}

/* ── Specification Values ────────────────────────────────────── */

export interface GetSpecValuesParams extends ListParams {
  variant?: string; // variant _id
}

export async function getSpecValues(
  params: GetSpecValuesParams = {},
): Promise<PaginatedResponse<SpecificationValue>> {
  const qs = buildQs(params);
  return apiGet<PaginatedResponse<SpecificationValue>>(
    `/catalog/specification-values${qs}`,
    { skipAuth: true },
  );
}

/* ── Inventory ───────────────────────────────────────────────── */

export interface GetInventoryParams extends ListParams {
  variant?: string; // variant _id
}

export async function getInventory(
  params: GetInventoryParams = {},
): Promise<PaginatedResponse<InventoryRecord>> {
  const qs = buildQs(params);
  return apiGet<PaginatedResponse<InventoryRecord>>(`/catalog/inventory${qs}`, {
    skipAuth: true,
  });
}

/* ── Helper: build query string ──────────────────────────────── */

function buildQs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (!entries.length) return "";
  return (
    "?" +
    entries
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join("&")
  );
}
