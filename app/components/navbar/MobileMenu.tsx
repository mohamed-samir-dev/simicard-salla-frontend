"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { NavItem } from "./data";

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export default function MobileMenu({ items, isOpen, onClose, pathname }: MobileMenuProps) {
  return (
    <div
      dir="rtl"
      className={`lg:hidden fixed inset-x-0 top-0 z-[9999] bg-white transition-all duration-500 ease-in-out ${
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
    >
      {/* Green top accent */}
      <div className="h-1 w-full bg-[#63D3A8]" />

      {/* Close button row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="text-sm font-bold text-gray-400 tracking-wide">القائمة</span>
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#e8f9f4] hover:text-[#63D3A8] text-gray-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav links — full width cards */}
      <div className="px-4 py-4 space-y-2">
        {items.map((item, i) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl text-base font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[#63D3A8] text-white shadow-md shadow-[#63D3A8]/30"
                  : "bg-gray-50 text-gray-700 hover:bg-[#e8f9f4] hover:text-[#63D3A8]"
              }`}
              style={{ transitionDelay: isOpen ? `${i * 60}ms` : "0ms" }}
            >
              <span>{item.label}</span>
              <span className={`text-lg ${isActive ? "text-white/70" : "text-gray-300"}`}>←</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom padding */}
      <div className="h-4" />
    </div>
  );
}
