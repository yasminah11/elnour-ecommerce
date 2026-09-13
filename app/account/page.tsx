"use client";

/**
 * ElNoor Technology — Landing Page
 *
 * Sections matching the design:
 * 1. Navbar (logo, nav links, search, wishlist, cart, account)
 * 2. Hero banner (full-width image-style banner with headline)
 * 3. Shop by Category (tabs: Computers, PC Components, Accessories, Networking)
 * 4. Featured Products (product cards with price, rating, stock, Add to Cart / Notify Me)
 * 5. Today's Best Deals (discounted cards with badge)
 * 6. Shop by Brand (brand logo grid)
 *
 * API routes used (all public):
 *   GET /catalog/categories
 *   GET /catalog/products?limit=6
 *   GET /marketing/promotions          (best deals)
 *
 * Cart uses:
 *   POST /commerce/cart/items          (guest-friendly, no auth needed)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api/apiClient";
import { useAuth } from "@/context/AuthContext";
import type {
  Category,
  Product,
  ProductVariant,
  Promotion,
} from "@/lib/types/catalog";

/* ──────────────────────────────────────────────────────────────
   Types (inline until you move them to lib/types/catalog.ts)
────────────────────────────────────────────────────────────── */

interface PaginatedResponse<T> {
  result: T[];
  total: number;
  page: number;
  limit: number;
}

/* ──────────────────────────────────────────────────────────────
   Star Rating component
────────────────────────────────────────────────────────────── */
function Stars({ rating = 4 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Product Card
────────────────────────────────────────────────────────────── */
function ProductCard({
  product,
  variant,
  discountPercent,
  onAddToCart,
}: {
  product: Product;
  variant?: ProductVariant;
  discountPercent?: number;
  onAddToCart?: (variantId: string) => void;
}) {
  const price = variant?.price ?? 0;
  const originalPrice = discountPercent
    ? Math.round(price / (1 - discountPercent / 100))
    : null;
  const inStock = variant?.availabilityStatus === "inStock" || !variant;
  const isOutOfStock = variant?.availabilityStatus === "outOfStock";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Image placeholder */}
      <div className="relative bg-gray-50 rounded-md h-44 flex items-center justify-center overflow-hidden">
        <svg
          className="w-16 h-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        {discountPercent && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        )}
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-base font-bold text-[#1a3a6b]">
          {price > 0 ? `${price.toLocaleString()} EGP` : "—"}
        </span>
        {originalPrice && (
          <span className="text-xs text-gray-400 line-through">
            {originalPrice.toLocaleString()} EGP
          </span>
        )}
      </div>

      <Stars rating={4} />

      {/* Stock badge */}
      {isOutOfStock ? (
        <span className="text-[11px] text-red-500 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          Out of Stock
        </span>
      ) : (
        <span className="text-[11px] text-green-600 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          In Stock
        </span>
      )}

      {/* CTA */}
      {isOutOfStock ? (
        <button className="mt-auto w-full bg-gray-100 text-gray-500 text-sm font-semibold py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
          </svg>
          Notify Me
        </button>
      ) : (
        <button
          onClick={() => variant && onAddToCart?.(variant._id)}
          className="mt-auto w-full bg-[#1a3a6b] hover:bg-[#122d55] text-white text-sm font-semibold py-2 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          Add to cart
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Brand logos (static — replace with dynamic data if backend adds brands)
────────────────────────────────────────────────────────────── */
const BRANDS = ["HP", "Dell Technologies", "NVIDIA", "Lenovo", "Intel"];

function BrandLogo({ name }: { name: string }) {
  const colors: Record<string, string> = {
    HP: "#0096D6",
    "Dell Technologies": "#007DB8",
    NVIDIA: "#76B900",
    Lenovo: "#E2231A",
    Intel: "#0071C5",
  };
  const bg = colors[name] ?? "#1a3a6b";
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl p-4 h-20 text-white font-bold text-sm text-center"
      style={{ backgroundColor: bg }}
    >
      {name}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────────── */
export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Promotion[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartAdding, setCartAdding] = useState<string | null>(null);
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Fetch categories ─────────────────────────────────────── */
  useEffect(() => {
    apiGet<PaginatedResponse<Category>>("/catalog/categories?limit=20")
      .then((res) => {
        setCategories(res.result ?? []);
        if (res.result?.length) setActiveTab(res.result[0]._id);
      })
      .catch(() => {});
  }, []);

  /* ── Fetch featured products ──────────────────────────────── */
  useEffect(() => {
    const params = activeTab ? `?limit=6&category=${activeTab}` : "?limit=6";
    apiGet<PaginatedResponse<Product>>(`/catalog/products${params}`)
      .then((res) => setProducts(res.result ?? []))
      .catch(() => {});
  }, [activeTab]);

  /* ── Fetch promotions (best deals) ───────────────────────── */
  useEffect(() => {
    apiGet<PaginatedResponse<Promotion>>("/marketing/promotions?limit=3")
      .then((res) => setDeals(res.result ?? []))
      .catch(() => {});
  }, []);

  /* ── Cart fetch count ─────────────────────────────────────── */
  useEffect(() => {
    apiGet<{ items?: unknown[] }>("/commerce/cart")
      .then((res) => setCartCount(res.items?.length ?? 0))
      .catch(() => {});
  }, []);

  /* ── Add to cart ──────────────────────────────────────────── */
  const handleAddToCart = async (variantId: string) => {
    setCartAdding(variantId);
    try {
      await apiPost("/commerce/cart/items", {
        variant: variantId,
        quantity: 1,
      });
      setCartCount((c) => c + 1);
      setCartSuccess(variantId);
      setTimeout(() => setCartSuccess(null), 1500);
    } catch {
      // show nothing — cart endpoint can return errors for auth etc.
    } finally {
      setCartAdding(null);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-[#1a3a6b] rounded flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <rect width="7" height="7" x="2" y="2" rx="1" />
                <rect width="7" height="7" x="11" y="2" rx="1" />
                <rect width="7" height="7" x="2" y="11" rx="1" />
                <rect width="7" height="7" x="11" y="11" rx="1" />
              </svg>
            </div>
            <span className="font-bold text-[#1a3a6b] text-base hidden sm:block">
              EL-NOUR TECHNOLOGY
            </span>
          </Link>

          {/* Nav links */}
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700 mx-4">
            {["Home", "Categories", "Laptops", "Offers", "About Us"].map(
              (item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-[#1a3a6b] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ),
            )}
          </ul>

          {/* Search */}
          <div className="flex-1 max-w-sm ml-auto hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search..."
                className="w-full border border-gray-300 rounded-full px-4 py-1.5 text-sm pr-9 focus:outline-none focus:border-[#1a3a6b]"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3 ml-3">
            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                href="/account"
                className="text-gray-600 hover:text-[#1a3a6b]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <button className="relative text-gray-600 hover:text-[#1a3a6b]">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-[#1a3a6b] rounded-full text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="text-gray-600 hover:text-[#1a3a6b]"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-[#1a3a6b]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <section className="bg-[#0d1f3c] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Everything You Need.
              <br />
              One Tech Store.
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed mb-8 max-w-sm">
              Discover laptops, PC components, accessories and more — with the
              technology you need for work, gaming and everyday life.
            </p>
            <a
              href="#products"
              className="inline-flex items-center gap-2 bg-white text-[#1a3a6b] font-semibold px-5 py-2.5 rounded text-sm hover:bg-blue-50 transition-colors"
            >
              Shop Products →
            </a>
          </div>
          {/* Hero visual: stylized chip graphic */}
          <div className="flex-1 flex justify-center items-center relative z-10">
            <div className="relative w-64 h-64">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 animate-pulse" />
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-[#0d1f3c] rounded-2xl border border-blue-700/50 flex items-center justify-center shadow-2xl">
                <svg
                  className="w-40 h-40 text-blue-400"
                  fill="none"
                  viewBox="0 0 100 100"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect
                    x="25"
                    y="25"
                    width="50"
                    height="50"
                    rx="4"
                    strokeWidth="2.5"
                  />
                  <rect
                    x="35"
                    y="35"
                    width="30"
                    height="30"
                    rx="2"
                    fill="currentColor"
                    fillOpacity="0.15"
                  />
                  {/* Top pins */}
                  {[35, 44, 53, 62].map((x) => (
                    <line
                      key={x}
                      x1={x}
                      y1="15"
                      x2={x}
                      y2="25"
                      strokeWidth="2"
                    />
                  ))}
                  {/* Bottom pins */}
                  {[35, 44, 53, 62].map((x) => (
                    <line
                      key={x + "b"}
                      x1={x}
                      y1="75"
                      x2={x}
                      y2="85"
                      strokeWidth="2"
                    />
                  ))}
                  {/* Left pins */}
                  {[35, 44, 53, 62].map((y) => (
                    <line
                      key={y + "l"}
                      x1="15"
                      y1={y}
                      x2="25"
                      y2={y}
                      strokeWidth="2"
                    />
                  ))}
                  {/* Right pins */}
                  {[35, 44, 53, 62].map((y) => (
                    <line
                      key={y + "r"}
                      x1="75"
                      y1={y}
                      x2="85"
                      y2={y}
                      strokeWidth="2"
                    />
                  ))}
                  {/* Center text */}
                  <text
                    x="50"
                    y="48"
                    textAnchor="middle"
                    fontSize="8"
                    fill="currentColor"
                    fontWeight="bold"
                  >
                    AMD
                  </text>
                  <text
                    x="50"
                    y="57"
                    textAnchor="middle"
                    fontSize="6"
                    fill="currentColor"
                  >
                    RYZEN
                  </text>
                  <text
                    x="50"
                    y="64"
                    textAnchor="middle"
                    fontSize="5"
                    fill="currentColor"
                  >
                    9000 Series
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Background grid lines decoration */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,179,237,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </section>

      {/* ── Shop by Category ─────────────────────────────────── */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Shop by Category
          </h2>

          {/* Tab row */}
          {categories.length > 0 && (
            <div className="flex gap-2 mb-8 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveTab(cat._id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activeTab === cat._id
                      ? "bg-[#1a3a6b] text-white border-[#1a3a6b]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#1a3a6b]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Category cards — 3-up grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {["Laptops", "Desktop PCs", "Workstations"].map((name) => (
              <div
                key={name}
                className="bg-gray-50 rounded-xl border border-gray-200 h-36 flex flex-col items-center justify-end pb-3 cursor-pointer hover:border-[#1a3a6b] transition-colors group overflow-hidden relative"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-200 group-hover:text-blue-100 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    {name === "Laptops" && (
                      <>
                        <rect x="2" y="4" width="20" height="14" rx="2" />
                        <path d="M2 20h20" />
                      </>
                    )}
                    {name === "Desktop PCs" && (
                      <>
                        <rect x="2" y="3" width="15" height="12" rx="2" />
                        <path d="M17 8h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2V8z" />
                        <path d="M2 15v3" />
                        <path d="M2 20h15" />
                      </>
                    )}
                    {name === "Workstations" && (
                      <>
                        <rect x="2" y="2" width="8" height="19" rx="1.5" />
                        <rect x="12" y="6" width="10" height="15" rx="1.5" />
                      </>
                    )}
                  </svg>
                </div>
                <span className="relative text-sm font-semibold text-gray-700 group-hover:text-[#1a3a6b]">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      <section
        id="products"
        className="py-10 bg-white border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Featured Products
          </h2>

          {products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-lg border border-dashed border-gray-200 h-72 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Today's Best Deals ───────────────────────────────── */}
      {deals.length > 0 && (
        <section className="py-10 bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Today&apos;s Best Deals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {deals.map((promo) => (
                <div
                  key={promo._id}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow relative"
                >
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                    {promo.promoType === "percentage" &&
                    promo.config?.percentage
                      ? `${promo.config.percentage}% OFF`
                      : "DEAL"}
                  </span>
                  <div className="bg-gray-50 rounded-md h-40 flex items-center justify-center">
                    <svg
                      className="w-14 h-14 text-gray-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {promo.name}
                  </h3>
                  <Stars rating={4} />
                  <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{" "}
                    In Stock
                  </div>
                  <button
                    onClick={() =>
                      promo.variants?.[0] &&
                      handleAddToCart(promo.variants[0] as string)
                    }
                    className="w-full bg-[#1a3a6b] hover:bg-[#122d55] text-white text-sm font-semibold py-2 rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Shop by Brand ─────────────────────────────────────── */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Shop by Brand
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {BRANDS.map((brand) => (
              <BrandLogo key={brand} name={brand} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1a3a6b] rounded flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <rect width="7" height="7" x="2" y="2" rx="1" />
                <rect width="7" height="7" x="11" y="2" rx="1" />
                <rect width="7" height="7" x="2" y="11" rx="1" />
                <rect width="7" height="7" x="11" y="11" rx="1" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#1a3a6b]">
              EL-NOUR TECHNOLOGY
            </span>
          </div>
          <p className="text-xs text-gray-400">
            © 2024 ElNour Technology. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-[#1a3a6b]">
              About Us
            </a>
            <a href="#" className="hover:text-[#1a3a6b]">
              Contact
            </a>
            <a href="#" className="hover:text-[#1a3a6b]">
              Terms
            </a>
          </div>
        </div>
      </footer>

      {/* Cart add toast */}
      {cartSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ Added to cart!
        </div>
      )}
    </div>
  );
}
