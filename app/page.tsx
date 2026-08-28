export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Top Navigation Bar ── */}
      <header className="bg-[#1a3a6b] text-white">
        <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <svg
                className="w-3 h-3 text-[#1a3a6b]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <rect width="8" height="8" x="2" y="2" rx="1" />
                <rect width="8" height="8" x="10" y="2" rx="1" />
                <rect width="8" height="8" x="2" y="10" rx="1" />
                <rect width="8" height="8" x="10" y="10" rx="1" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-wide">
              ElNoor Technology
            </span>
          </div>

          {/* Nav Links */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[
              "CPUs",
              "GPUs",
              "Laptops",
              "Motherboards",
              "Storage",
              "Deals",
            ].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>

          {/* Icons */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <button
              className="hover:text-blue-300 transition-colors"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            {/* Cart */}
            <button
              className="relative hover:text-blue-300 transition-colors"
              aria-label="Cart"
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
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-[#1a3a6b] rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
                3
              </span>
            </button>
            {/* User */}
            <button
              className="hover:text-blue-300 transition-colors"
              aria-label="Account"
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
      </header>

      {/* ── Hero Section ── */}
      <section className="bg-[#f4f6fa] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
          {/* Left — Copy */}
          <div className="flex-1 max-w-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-600 bg-white mb-6 tracking-wider uppercase">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 text-yellow-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Next-Gen Performance
            </div>

            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5">
              Architect Your
              <br />
              Ultimate Rig
            </h1>

            <p className="text-gray-500 text-base leading-relaxed mb-8">
              Equip yourself with elite processing power and cutting-edge
              graphics. ElNoor Technology delivers uncompromising hardware
              solutions for professionals and enthusiasts who demand absolute
              precision.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <button className="flex items-center gap-2 bg-[#1a3a6b] hover:bg-[#122d55] text-white font-semibold px-6 py-3 rounded text-sm transition-colors">
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
                Shop High-End GPUs
              </button>
              <button className="border border-gray-300 hover:border-[#1a3a6b] hover:text-[#1a3a6b] text-gray-700 font-semibold px-6 py-3 rounded text-sm transition-colors bg-white">
                Explore Workstations
              </button>
            </div>
          </div>

          {/* Right — Hero Product Card */}
          <div className="flex-1 flex justify-center w-full">
            <div className="relative w-full max-w-xl">
              {/* Product image placeholder — drop a real product photo here later */}
              <div className="relative bg-[#eef1f6] rounded-2xl h-96 overflow-hidden shadow-sm border border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <span className="text-sm font-medium">
                  Product image goes here
                </span>
              </div>

              {/* Featured Build pill — overlaid on the bottom-left of the image */}
              <div className="absolute -bottom-5 left-5 bg-white rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#f4f6fa] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-[#1a3a6b]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 leading-tight">
                    Featured Build
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    RTX 4090 + i9-14900K
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Precision Components Section ── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Precision Components
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Filter by core architecture
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Processors */}
            <div className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="w-20 h-20 border-2 border-gray-200 group-hover:border-[#1a3a6b] group-hover:bg-[#f4f6fa] rounded-xl flex items-center justify-center transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-9 h-9 text-gray-500 group-hover:text-[#1a3a6b] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <line x1="9" y1="1" x2="9" y2="4" />
                  <line x1="15" y1="1" x2="15" y2="4" />
                  <line x1="9" y1="20" x2="9" y2="23" />
                  <line x1="15" y1="20" x2="15" y2="23" />
                  <line x1="20" y1="9" x2="23" y2="9" />
                  <line x1="20" y1="15" x2="23" y2="15" />
                  <line x1="1" y1="9" x2="4" y2="9" />
                  <line x1="1" y1="15" x2="4" y2="15" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1a3a6b] transition-colors">
                Processors
              </span>
            </div>

            {/* Memory */}
            <div className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="w-20 h-20 border-2 border-gray-200 group-hover:border-[#1a3a6b] group-hover:bg-[#f4f6fa] rounded-xl flex items-center justify-center transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-9 h-9 text-gray-500 group-hover:text-[#1a3a6b] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <line x1="6" y1="6" x2="6" y2="18" />
                  <line x1="10" y1="6" x2="10" y2="18" />
                  <line x1="14" y1="6" x2="14" y2="18" />
                  <line x1="18" y1="6" x2="18" y2="18" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="2" y1="14" x2="22" y2="14" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1a3a6b] transition-colors">
                Memory
              </span>
            </div>

            {/* Motherboards */}
            <div className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="w-20 h-20 border-2 border-gray-200 group-hover:border-[#1a3a6b] group-hover:bg-[#f4f6fa] rounded-xl flex items-center justify-center transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-9 h-9 text-gray-500 group-hover:text-[#1a3a6b] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <rect x="2" y="3" width="20" height="18" rx="1.5" />
                  <rect x="5" y="6" width="5" height="5" rx="0.5" />
                  <rect x="5" y="13" width="3" height="3" rx="0.5" />
                  <rect x="10" y="13" width="3" height="3" rx="0.5" />
                  <line x1="12" y1="6" x2="19" y2="6" />
                  <line x1="12" y1="9" x2="19" y2="9" />
                  <line x1="15" y1="13" x2="19" y2="13" />
                  <line x1="15" y1="16" x2="19" y2="16" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1a3a6b] transition-colors">
                Motherboards
              </span>
            </div>

            {/* Storage */}
            <div className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="w-20 h-20 border-2 border-gray-200 group-hover:border-[#1a3a6b] group-hover:bg-[#f4f6fa] rounded-xl flex items-center justify-center transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-9 h-9 text-gray-500 group-hover:text-[#1a3a6b] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <ellipse cx="12" cy="6" rx="10" ry="3" />
                  <path d="M2 6v4c0 1.66 4.48 3 10 3s10-1.34 10-3V6" />
                  <path d="M2 10v4c0 1.66 4.48 3 10 3s10-1.34 10-3v-4" />
                  <path d="M2 14v4c0 1.66 4.48 3 10 3s10-1.34 10-3v-4" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1a3a6b] transition-colors">
                Storage
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-[#1a3a6b] rounded-sm flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <rect width="8" height="8" x="2" y="2" rx="1" />
                  <rect width="8" height="8" x="10" y="2" rx="1" />
                  <rect width="8" height="8" x="2" y="10" rx="1" />
                  <rect width="8" height="8" x="10" y="10" rx="1" />
                </svg>
              </div>
              <span className="font-bold text-[#1a3a6b] text-sm">
                ElNoor Technology
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              © 2024 ElNoor Technology. High-Performance Hardware Solutions.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <a href="#" className="hover:text-[#1a3a6b] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#1a3a6b] transition-colors">
                  Technical Support
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Policies
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <a href="#" className="hover:text-[#1a3a6b] transition-colors">
                  Warranty Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#1a3a6b] transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#1a3a6b] transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Support
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <a
                  href="#"
                  className="hover:text-[#1a3a6b] transition-colors flex items-center gap-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Contact Expert
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
