"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import type { Product } from "./products/types";
import ProductCard from "./products/ProductCard";

export default function MostDemandedSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const BRANDS = ["stc", "موبايلي", "زين", "سلام موبايل"];

  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL || "";
    Promise.all(
      BRANDS.map((brand) =>
        fetch(`${BASE}/api/products?brand=${encodeURIComponent(brand)}&sort=price_desc&limit=1`)
          .then((r) => r.json())
          .then((data) => (Array.isArray(data) ? data[0] : null))
          .catch(() => null)
      )
    )
      .then((results) => setProducts(results.filter(Boolean) as Product[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section dir="rtl" className="w-full px-2 sm:px-6 lg:px-8 py-8 sm:py-14">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-[#63D3A8]" />
            <div>
              <h2 className="text-xl sm:text-3xl font-black text-gray-900">الأكثر طلباً</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">منتجات يختارها عملاؤنا باستمرار</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(99,211,168,0.1)", border: "1px solid rgba(99,211,168,0.25)" }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#63D3A8]" />
            <span className="text-[#63D3A8] text-xs font-bold">الأعلى مبيعاً</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{ background: "#e5e7eb", height: "220px" }}
              />
            ))}
          </div>
        ) : products.length === 0 ? null : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} priority={i < 2} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
