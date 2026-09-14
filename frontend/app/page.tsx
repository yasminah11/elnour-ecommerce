"use client";
import { useState } from "react";

const categories = [
  {
    name: "PC Components",
    sub: ["CPUs", "GPUs", "Motherboards", "RAM", "Storage", "Power Supplies"],
  },
  { name: "Computers", sub: ["Laptops", "Desktop PCs", "Workstations"] },
  {
    name: "Accessories",
    sub: ["Keyboards", "Mice", "Headsets", "Cables"],
  },
  { name: "Networking", sub: ["Routers", "Switches", "Network Accessories"] },
];

const categoryImages = [
  {
    name: "Laptops",
    img: "https://placehold.co/400x280/111827/ffffff?text=Laptops",
  },
  {
    name: "Desktop PCs",
    img: "https://placehold.co/400x280/111827/ffffff?text=Desktop+PCs",
  },
  {
    name: "Workstations",
    img: "https://placehold.co/400x280/111827/ffffff?text=Workstations",
  },
  {
    name: "Laptops",
    img: "https://placehold.co/400x280/111827/ffffff?text=Laptops",
  },
  {
    name: "Desktop PCs",
    img: "https://placehold.co/400x280/111827/ffffff?text=Desktop+PCs",
  },
  {
    name: "Workstations",
    img: "https://placehold.co/400x280/111827/ffffff?text=Workstations",
  },
];

const products = [
  {
    name: "ASUS ROG Zephyrus G16 (2024)",
    specs:
      'GU605MY-QR043W, Intel Core Ultra 9 185H, RTX 4090 16GB, 32GB LPDDR5X, 2TB PCIe 4.0 SSD, 16" 2.5K OLED 240Hz.',
    price: "40,000 EGP",
    rating: 5,
    inStock: true,
    img: "https://placehold.co/400x280/f8fafc/1e3a5f?text=ASUS+ROG+G16",
  },
  {
    name: "ASUS ROG Zephyrus G16 (2024)",
    specs:
      'GU605MY-QR043W, Intel Core Ultra 9 185H, RTX 4090 16GB, 32GB LPDDR5X, 2TB PCIe 4.0 SSD, 16" 2.5K OLED 240Hz.',
    price: "40,000 EGP",
    rating: 5,
    inStock: true,
    img: "https://placehold.co/400x280/f8fafc/1e3a5f?text=ASUS+ROG+G16",
  },
  {
    name: "ASUS ROG Zephyrus G16 (2024)",
    specs:
      'GU605MY-QR043W, Intel Core Ultra 9 185H, RTX 4090 16GB, 32GB LPDDR5X, 2TB PCIe 4.0 SSD, 16" 2.5K OLED 240Hz.',
    price: "40,000 EGP",
    rating: 5,
    inStock: false,
    img: "https://placehold.co/400x280/f8fafc/1e3a5f?text=ASUS+ROG+G16",
  },
];

const deals = [
  {
    name: "ASUS ROG Zephyrus G16 (2024)",
    specs:
      'GU605MY-QR043W, Intel Core Ultra 9 185H, RTX 4090 16GB, 32GB LPDDR5X, 2TB PCIe 4.0 SSD, 16" 2.5K OLED 240Hz.',
    price: "36,000 EGP",
    oldPrice: "40,000 EGP",
    discount: "10% Off",
    rating: 5,
    inStock: true,
    img: "https://placehold.co/400x280/f8fafc/1e3a5f?text=ASUS+ROG+G16",
  },
  {
    name: "ASUS ROG Zephyrus G16 (2024)",
    specs:
      'GU605MY-QR043W, Intel Core Ultra 9 185H, RTX 4090 16GB, 32GB LPDDR5X, 2TB PCIe 4.0 SSD, 16" 2.5K OLED 240Hz.',
    price: "36,000 EGP",
    oldPrice: "40,000 EGP",
    discount: "10% Off",
    rating: 5,
    inStock: true,
    img: "https://placehold.co/400x280/f8fafc/1e3a5f?text=ASUS+ROG+G16",
  },
  {
    name: "ASUS ROG Zephyrus G16 (2024)",
    specs:
      'GU605MY-QR043W, Intel Core Ultra 9 185H, RTX 4090 16GB, 32GB LPDDR5X, 2TB PCIe 4.0 SSD, 16" 2.5K OLED 240Hz.',
    price: "36,000 EGP",
    oldPrice: "40,000 EGP",
    discount: "10% Off",
    rating: 5,
    inStock: true,
    img: "https://placehold.co/400x280/f8fafc/1e3a5f?text=ASUS+ROG+G16",
  },
];

const brands = [
  {
    name: "HP",
    bg: "#0096D6",
    img: "https://placehold.co/120x80/0096D6/ffffff?text=HP",
  },
  {
    name: "Dell",
    bg: "#007DB8",
    img: "https://placehold.co/120x80/007DB8/ffffff?text=Dell",
  },
  {
    name: "NVIDIA",
    bg: "#76B900",
    img: "https://placehold.co/120x80/76B900/ffffff?text=NVIDIA",
  },
  {
    name: "Lenovo",
    bg: "#E2231A",
    img: "https://placehold.co/120x80/E2231A/ffffff?text=Lenovo",
  },
  {
    name: "Intel",
    bg: "#0068B5",
    img: "https://placehold.co/120x80/0068B5/ffffff?text=Intel",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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
  );
}

function HeartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("PC Components");
  const [megaMenu, setMegaMenu] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ── */}
      <header className="bg-[#1a3a6b] text-white sticky top-0 z-50 shadow-md">
        <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
              <svg
                className="w-4 h-4 text-[#1a3a6b]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <rect width="7" height="7" x="1" y="1" rx="1" />
                <rect width="7" height="7" x="12" y="1" rx="1" />
                <rect width="7" height="7" x="1" y="12" rx="1" />
                <rect width="7" height="7" x="12" y="12" rx="1" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-widest uppercase whitespace-nowrap">
              El-Nour Technology
            </span>
          </div>

          {/* Nav Links */}
          <ul className="hidden md:flex items-center gap-6 text-xs font-medium">
            {["Home", "Categories", "Laptops", "Offers", "About Us"].map(
              (item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-blue-300 transition-colors whitespace-nowrap"
                  >
                    {item}
                  </a>
                </li>
              ),
            )}
          </ul>

          {/* Search + Icons */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-white rounded-md text-gray-600 px-3 py-1.5 gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="text-xs outline-none w-24 bg-transparent placeholder-gray-400"
                placeholder="search..."
              />
            </div>
            <button
              aria-label="Wishlist"
              className="hover:text-blue-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              aria-label="Cart"
              className="hover:text-blue-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
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
            </button>
            <button
              aria-label="Account"
              className="hover:text-blue-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mega Menu */}
        {megaMenu && (
          <div className="absolute top-full left-0 right-0 bg-white text-gray-800 shadow-xl border-t border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-4 gap-8">
              {categories.map((cat) => (
                <div key={cat.name}>
                  <h4 className="text-sm font-bold text-[#1a3a6b] mb-3 flex items-center gap-1">
                    {cat.name}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </h4>
                  <ul className="space-y-2">
                    {cat.sub.map((s) => (
                      <li key={s}>
                        <a
                          href="#"
                          className="text-sm text-gray-600 hover:text-[#1a3a6b] transition-colors"
                        >
                          {s}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section
        className="relative bg-[#0d1b2e] text-white overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 60% 50%, #1a3a6b 0%, #0d1b2e 70%)",
        }}
      >
        {/* Circuit pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a90d9' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="flex-1 max-w-lg">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Everything You Need.
              <br />
              One Tech Store.
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed mb-8 max-w-sm">
              Discover laptops, PC components, accessories and more — with the
              technology you need for work, gaming and everyday life.
            </p>
            <button className="inline-flex items-center gap-2 bg-white text-[#1a3a6b] font-bold px-6 py-3 rounded-lg text-sm hover:bg-blue-50 transition-colors shadow-lg">
              Shop Products
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="https://placehold.co/560x340/1a3a6b/4a90d9?text=AMD+RYZEN+9000+Series"
              alt="AMD RYZEN 9000 Series"
              className="rounded-2xl w-full max-w-lg object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="py-12 max-w-7xl mx-auto px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Shop by Category
        </h2>

        {/* Filter Tabs */}
        <div className="flex items-center gap-3 mb-7 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                activeCategory === cat.name
                  ? "bg-[#1a3a6b] text-white border-[#1a3a6b]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3a6b] hover:text-[#1a3a6b]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-3 gap-5">
          {categoryImages.map((cat, i) => (
            <div key={i} className="cursor-pointer group">
              <div className="rounded-2xl overflow-hidden mb-3 aspect-video">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm font-bold text-gray-800 text-center group-hover:text-[#1a3a6b] transition-colors">
                {cat.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-12 max-w-7xl mx-auto px-6 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-7">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-white"
            >
              <div className="bg-gray-50 p-4">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-48 object-contain"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
                  {p.specs}
                </p>
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {p.price}
                </p>
                <StarRating count={p.rating} />
                <div className="flex items-center gap-1.5 mt-1 mb-4">
                  {p.inStock ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span className="text-xs text-green-600 font-medium">
                        In Stock
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 text-orange-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span className="text-xs text-orange-500 font-medium">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {p.inStock ? (
                    <button className="flex-1 flex items-center justify-center gap-2 bg-[#1a3a6b] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#122d55] transition-colors">
                      <CartIcon /> Add to cart
                    </button>
                  ) : (
                    <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-500 text-xs font-semibold py-2.5 rounded-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                        <line x1="6" y1="1" x2="6" y2="4" />
                        <line x1="10" y1="1" x2="10" y2="4" />
                        <line x1="14" y1="1" x2="14" y2="4" />
                      </svg>
                      Notify Me
                    </button>
                  )}
                  <button className="p-2.5 border border-gray-200 rounded-xl hover:border-red-300 hover:text-red-400 transition-colors">
                    <HeartIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Today's Best Deals ── */}
      <section className="py-12 max-w-7xl mx-auto px-6 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-7">
          Today&apos;s Best Deals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deals.map((d, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-white relative"
            >
              <div className="bg-gray-50 p-4 relative">
                <span className="absolute top-3 left-3 bg-[#1a3a6b] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-10">
                  {d.discount}
                </span>
                <img
                  src={d.img}
                  alt={d.name}
                  className="w-full h-48 object-contain"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {d.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
                  {d.specs}
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">
                    {d.price}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {d.oldPrice}
                  </span>
                </div>
                <StarRating count={d.rating} />
                <div className="flex items-center gap-1.5 mt-1 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="text-xs text-green-600 font-medium">
                    In Stock
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-[#1a3a6b] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#122d55] transition-colors">
                    <CartIcon /> Add to cart
                  </button>
                  <button className="p-2.5 border border-gray-200 rounded-xl hover:border-red-300 hover:text-red-400 transition-colors">
                    <HeartIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shop by Brand ── */}
      <section className="py-12 max-w-7xl mx-auto px-6 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-7">Shop by Brand</h2>
        <div className="grid grid-cols-5 gap-4">
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-sm"
            >
              <img
                src={brand.img}
                alt={brand.name}
                className="w-full h-20 object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0d1b2e] text-white mt-6 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-[#1a3a6b]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <rect width="7" height="7" x="1" y="1" rx="1" />
                  <rect width="7" height="7" x="12" y="1" rx="1" />
                  <rect width="7" height="7" x="1" y="12" rx="1" />
                  <rect width="7" height="7" x="12" y="12" rx="1" />
                </svg>
              </div>
              <span className="font-bold text-sm tracking-wide">
                El-Nour Technology
              </span>
            </div>
            <p className="text-xs text-blue-300 leading-relaxed">
              © 2024 El-Nour Technology.
              <br />
              All rights reserved.
            </p>
          </div>
          {[
            {
              title: "Shop",
              links: ["Laptops", "Desktop PCs", "Components", "Accessories"],
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "Blog", "Contact"],
            },
            {
              title: "Support",
              links: ["FAQ", "Shipping", "Returns", "Warranty"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-widest">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-blue-300 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
