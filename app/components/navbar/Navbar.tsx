"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./data";
import { Menu, X, Wifi, User } from "lucide-react";
import { IoBagHandleOutline } from "react-icons/io5";
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
  const [scrolled, setScrolled] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const cartTotal = useCartStore((s) => s.totalPrice());
  const { logo, nameAr, fetchCompany } = useCompanyStore();
  const pathname = usePathname();

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-[#63D3A8] hover:bg-[#e8f9f4] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              {logo ? (
                <Image src={logo} alt={nameAr || "logo"} width={180} height={72}
                  className="object-contain h-10 w-auto sm:h-12 lg:h-16" unoptimized />
              ) : (
                <div className="w-11 h-11 rounded-2xl border-2 border-[#63D3A8] flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5 text-[#63D3A8]" />
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
                      ${isActive ? "text-[#63D3A8] bg-[#e8f9f4]" : "text-gray-600 hover:text-[#63D3A8] hover:bg-[#e8f9f4]"}`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 right-3 left-3 h-0.5 bg-[#63D3A8] rounded-full" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* User */}
            <Link href="/account" aria-label="حسابي" className="flex items-center gap-2 p-2 text-gray-500 hover:text-[#63D3A8] transition-colors shrink-0">
              <User className="w-6 h-6 sm:w-7 sm:h-7" />
            </Link>

            {/* Cart */}
            <Link href="/cart" aria-label="السلة" className="relative flex items-center gap-3 p-2 text-gray-500 hover:text-[#63D3A8] transition-colors shrink-0">
              <div className="relative">
                <IoBagHandleOutline className="w-6 h-6 sm:w-7 sm:h-7" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 bg-[#63D3A8] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-0.5">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-0.5 text-base font-bold text-gray-800">
                {mounted ? cartTotal.toLocaleString("ar-SA") : "0"}
                <img src="/money-icon.webp" alt="ر.س" className="w-7 h-7 object-contain translate-y-0.5" />
              </span>
            </Link>

          </div>
        </div>
      </div>

      <MobileMenu items={navItems} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </nav>
  );
}
