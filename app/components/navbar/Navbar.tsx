"use client";

import { useState, useEffect, useSyncExternalStore, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./data";
import { Search, ShoppingCart, Menu, X, Wifi } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useCompanyStore } from "../../store/companyStore";
import MobileMenu from "./MobileMenu";

// const announcements = [
//   "📡 شرائح SIM بأفضل الأسعار",
//   "🛰️ راوترات 5G وبورتابل بجودة عالية",
//   "🌐 باقات إنترنت غير محدودة",
//   "⭐ تغطية شبكة فائقة في كل مكان",
//   "🛡️ eSIM متاحة لجميع الأجهزة",
// ];

// function RotatingAnnouncements() {
//   const [index, setIndex] = useState(0);
//   // useEffect(() => {
//   //   // const timer = setInterval(() => setIndex((i) => (i + 1) % announcements.length), 3000);
//   //   return () => clearInterval(timer);
//   // }, []);
//   return (
//     // <span className="text-white font-semibold text-center leading-tight relative h-5 overflow-hidden flex items-center justify-center min-w-0 flex-1">
//     //   <span key={index} className="animate-fade-in-out text-[10px] sm:text-xs truncate max-w-full px-1">
//     //     {announcements[index]}
//     //   </span>
//     // </span>
//   );
// }

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ _id: string; name: string; images?: string[]; image?: string; salePrice?: number; originalPrice?: number; price?: number }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const { logo, nameAr, fetchCompany } = useCompanyStore();
  const pathname = usePathname();

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!searchWrapRef.current?.contains(target) && !mobileSearchRef.current?.contains(target)) {
        setSearchOpen(false); setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchResults]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-lg" : ""}`} dir="rtl">

      {/* ── Row 1: Top bar ── */}
      {/* <div style={{ background: "linear-gradient(135deg,#000,#001F44,#003160)" }} className="border-b border-[#001F44]">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 h-9 flex items-center justify-between text-xs gap-1 sm:gap-3">
          <a
            href="https://wa.me/966592014922"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-1.5 text-green-300 font-bold hover:text-green-200 transition-colors shrink-0"
          >
            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="hidden sm:inline">+966 59 201 4922</span>
          </a>
          <RotatingAnnouncements />
          <span className="flex items-center gap-1 sm:gap-1.5 text-gray-200 shrink-0">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FC0] shrink-0" />
            <span className="text-[10px] sm:text-xs">السعودية</span>
          </span>
        </div>
      </div> */}

      {/* ── Row 2: Logo + Search + Icons ── */}
      <div
        className="border-b border-gray-100 backdrop-blur-md"
        style={{ background: "rgba(255,255,255,0.95)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          {/* Hamburger + Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              aria-label="القائمة"
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-[#47A557] hover:bg-green-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              {logo ? (
                <Image src={logo} alt={nameAr || "logo"} width={180} height={72}
                  className="object-contain h-14 w-auto lg:h-16 sm:scale-100 scale-125 origin-right" unoptimized />
              ) : (
                <div className="w-11 h-11 rounded-2xl border-2 border-[#47A557] flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5 text-[#47A557]" />
                </div>
              )}
            </Link>
          </div>

          {/* Desktop nav links — center */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <div key={item.label} className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                      ${isActive ? "text-[#47A557] bg-green-50" : "text-gray-600 hover:text-[#47A557] hover:bg-green-50"}`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 right-3 left-3 h-0.5 bg-[#47A557] rounded-full" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Search + Cart */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Desktop Search */}
            <div ref={searchWrapRef} className="hidden sm:block relative w-44 md:w-56 lg:w-72">
              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-[#47A557] focus-within:bg-white transition-all duration-200 overflow-hidden">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="ابحث..."
                  className="flex-1 min-w-0 px-3 py-2 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
                {searching ? (
                  <div className="px-3"><div className="w-4 h-4 border-2 border-[#47A557] border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                  <button
                    aria-label="بحث"
                    onClick={() => fetchResults(searchQuery)}
                    className="m-1.5 px-3 py-1.5 bg-[#47A557] hover:bg-[#129928] text-white rounded-xl transition-colors flex items-center gap-1 text-sm font-bold shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">بحث</span>
                  </button>
                )}
              </div>
              {searchOpen && results.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {results.map((p) => {
                    const img = p.images?.[0] || p.image;
                    const price = p.salePrice ?? p.originalPrice ?? p.price ?? 0;
                    return (
                      <li key={p._id}>
                        <Link
                          href={`/product/${p._id}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(""); setResults([]); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors"
                        >
                          {img && (
                            <Image
                              src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${img.startsWith("/") ? img : "/" + img}`}
                              alt={p.name} width={44} height={44}
                              className="object-contain rounded-xl border border-gray-100 bg-gray-50 shrink-0" unoptimized
                            />
                          )}
                          <span className="flex-1 text-sm text-gray-800 line-clamp-1 font-medium">{p.name}</span>
                          <span className="text-sm font-bold text-[#47A557] shrink-0">{price.toLocaleString("en-US")} <img src="/money-icon.webp" alt="ر.س" className="inline w-4 h-4 object-contain align-middle" /></span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {searchOpen && !searching && searchQuery.trim() && results.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-8">
                  <p className="text-center text-sm text-gray-400">لا توجد نتائج لـ &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>

            {/* Mobile search icon */}
            <button
              aria-label="بحث"
              className="sm:hidden p-2 text-gray-500 hover:text-[#47A557] transition-colors shrink-0"
              onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="السلة"
              className="relative flex flex-col items-center gap-0.5 p-2 text-gray-500 hover:text-[#47A557] transition-colors shrink-0"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 bg-[#47A557] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-0.5">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-[10px] font-medium">السلة</span>
            </Link>

          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div
        className={`sm:hidden border-b border-gray-100 transition-all duration-200 overflow-hidden ${searchOpen ? "max-h-24" : "max-h-0"}`}
        style={{ background: "rgba(255,255,255,0.98)" }}
      >
        <div ref={mobileSearchRef} className="px-4 py-2 relative">
          <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-[#47A557] transition-all duration-200 overflow-hidden">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="ابحث عن منتج..."
              className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
            {searching ? (
              <div className="px-3"><div className="w-4 h-4 border-2 border-[#47A557] border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <button
                aria-label="بحث"
                onClick={() => fetchResults(searchQuery)}
                className="m-1.5 px-3 py-2 bg-[#47A557] hover:bg-[#129928] text-white rounded-xl transition-colors flex items-center gap-1 text-sm font-bold shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {searchOpen && results.length > 0 && (
            <ul className="absolute right-4 left-4 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-gray-50">
              {results.map((p) => {
                const img = p.images?.[0] || p.image;
                const price = p.salePrice ?? p.originalPrice ?? p.price ?? 0;
                return (
                  <li key={p._id}>
                    <Link
                      href={`/product/${p._id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); setResults([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors"
                    >
                      {img && (
                        <Image
                          src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${img.startsWith("/") ? img : "/" + img}`}
                          alt={p.name} width={40} height={40}
                          className="object-contain rounded-xl border border-gray-100 bg-gray-50 shrink-0" unoptimized
                        />
                      )}
                      <span className="flex-1 text-sm text-gray-800 line-clamp-1 font-medium">{p.name}</span>
                      <span className="text-sm font-bold text-[#47A557] shrink-0">{price.toLocaleString("en-US")} <img src="/money-icon.webp" alt="ر.س" className="inline w-4 h-4 object-contain align-middle" /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {searchOpen && !searching && searchQuery.trim() && results.length === 0 && (
            <div className="absolute right-4 left-4 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-6">
              <p className="text-center text-sm text-gray-400">لا توجد نتائج لـ &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      </div>

      <MobileMenu items={navItems} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </nav>
  );
}
