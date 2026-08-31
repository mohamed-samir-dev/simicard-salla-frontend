"use client";

import Link from "next/link";
import { NavItem } from "./data";
import { X, Wifi } from "lucide-react";

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ items, isOpen, onClose }: MobileMenuProps) {
  return (
    <>
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`lg:hidden fixed top-0 right-0 w-[80vw] max-w-[340px] h-dvh z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "#ffffff" }}
        dir="rtl"
      >
        <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl border-2 border-[#47A557] flex items-center justify-center">
              <Wifi className="w-4 h-4 text-[#47A557]" />
            </div>
            <div>
              <p className="text-[#1A2E44] font-black text-lg tracking-tight">سهلناها</p>
              <p className="text-[#47A557]/80 text-[10px]">التقنية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {items.map((item) => (
            <div key={item.label} className="border-b border-gray-50 last:border-0">
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center px-5 py-3.5 text-sm font-semibold text-gray-600 hover:text-[#47A557] hover:bg-green-50 transition-colors"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">📞 +966 59 201 4922</p>
        </div>
      </div>
    </>
  );
}
