"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoCartOutline,
  IoCheckmarkCircle,
  IoFlash,
  IoWifiOutline,
} from "react-icons/io5";
import type { Product } from "./types";
import { useCartStore } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

export default function ProductCard({
  product,
  priority = false,
  rank,
}: {
  product: Product;
  priority?: boolean;
  rank?: number;
}) {
  const {
    name,
    discountPercent = 0,
    brand,
    inStock,
    installment,
    network,
  } = product;

  const image = product.images?.[0] || product.image;
  const resolvedImage = image ? resolveImg(image) : undefined;
  const originalPrice = product.originalPrice || product.price || 0;
  const salePrice =
    product.salePrice && product.salePrice > 0 ? product.salePrice : undefined;
  const hasDiscount = salePrice != null && salePrice < originalPrice;
  const displayPrice = hasDiscount ? salePrice : originalPrice;
  const savings = hasDiscount ? originalPrice - salePrice : 0;

  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (added) return;
    addItem(product);
    setAdded(true);
    setToast(true);
    setTimeout(() => {
      setToast(false);
      setAdded(false);
      window.scrollTo(0, 0);
      router.push("/cart");
    }, 1100);
  };

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-2.5 text-sm font-bold"
          >
            <IoCheckmarkCircle size={20} />
            تمت إضافة المنتج للسلة
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative h-full"
      >
        <Link
          href={`/product/${product._id}`}
          dir="rtl"
          className="group relative flex flex-col h-full rounded-[20px] overflow-hidden transition-transform duration-300 hover:-translate-y-1"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow:
              "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[20px]"
            style={{
              boxShadow: "0 0 0 1px rgba(71,165,87,0.3), 0 8px 32px rgba(71,165,87,0.1)",
            }}
          />

          {/* ══ IMAGE ZONE ══ */}
          <div className="relative w-full overflow-hidden">
            {/* Rank badge */}
            {rank != null && (
              <div
                className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg"
                style={
                  rank === 1
                    ? {
                        background: "linear-gradient(135deg, #47A557 0%, #129928 100%)",
                        color: "#ffffff",
                        boxShadow: "0 2px 10px rgba(71,165,87,0.4)",
                      }
                    : {
                        background: "rgba(71,165,87,0.1)",
                        color: "#47A557",
                        border: "1px solid rgba(71,165,87,0.3)",
                      }
                }
              >
                {rank}
              </div>
            )}

            {/* Product image */}
            {resolvedImage ? (
              <Image
                src={resolvedImage}
                alt={name}
                width={600}
                height={600}
                className="w-full h-auto object-cover block max-h-32 sm:max-h-48 transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
            ) : (
              <div className="flex items-center justify-center h-28 sm:h-40 text-4xl sm:text-5xl">📱</div>
            )}
          </div>

          {/* ══ CONTENT ZONE ══ */}
          <div className="flex flex-col flex-1 px-2.5 sm:px-3.5 pt-2 sm:pt-3 pb-2.5 sm:pb-3.5 gap-1.5 sm:gap-2">

            {/* Brand + network row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {brand && (
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-none"
                  style={{
                    background: "rgba(71,165,87,0.1)",
                    border: "1px solid rgba(71,165,87,0.25)",
                    color: "#47A557",
                  }}
                >
                  {brand}
                </span>
              )}
              {network && (
                <span
                  className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none"
                  style={{
                    background: "rgba(71,165,87,0.08)",
                    border: "1px solid rgba(71,165,87,0.2)",
                    color: "#47A557",
                  }}
                >
                  <IoWifiOutline size={8} />
                  {network}
                </span>
              )}
            </div>

            {/* Product name */}
            <h3 className="text-[11px] sm:text-[14px] font-bold text-gray-900 leading-[1.4] line-clamp-2 flex-1">
              {name}
            </h3>

            {/* Divider */}
            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(90deg, rgba(71,165,87,0.2), rgba(71,165,87,0.05) 60%, transparent)",
              }}
            />

            {/* Price block */}
            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                {hasDiscount && (
                  <span className="text-[11px] line-through leading-none text-gray-400">
                    {fmt(originalPrice)} <img src="/money-icon.webp" alt="ر.س" className="inline w-3.5 h-3.5 object-contain align-middle" />
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-[16px] sm:text-[26px] font-black leading-none tracking-tight"
                    style={{ color: hasDiscount ? "#129928" : "#111827" }}
                  >
                    {fmt(displayPrice!)}
                  </span>
                  <img src="/money-icon.webp" alt="ر.س" className="w-3.5 sm:w-5 h-3.5 sm:h-5 object-contain mb-0.5" />
                </div>
              </div>

              {hasDiscount && savings > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="shrink-0 text-center"
                >
                  <div className="text-[8px] text-gray-400 leading-none mb-0.5">وفّرت</div>
                  <div
                    className="text-[10px] font-black px-2 py-0.5 rounded-lg leading-none whitespace-nowrap"
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#fca5a5",
                    }}
                  >
                    {fmt(savings)} <img src="/money-icon.webp" alt="ر.س" className="inline w-3 h-3 object-contain align-middle" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Cart button */}
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.97 }}
              className={`cart-btn ${added ? "added" : ""}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2"
                  >
                    <IoCheckmarkCircle size={16} />
                    تمت الإضافة
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2"
                  >
                    <IoCartOutline size={16} />
                    أضف للسلة
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </Link>
      </motion.div>
    </>
  );
}
