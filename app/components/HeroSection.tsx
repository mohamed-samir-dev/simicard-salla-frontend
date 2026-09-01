"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Image from "next/image";
import { ShoppingBag, Truck, ShieldCheck, Headphones, Star } from "lucide-react";

interface Slide {
  image: string;
  mobileImage?: string;
  description: string;
  btn: { label: string; href: string };
}

const slides: Slide[] = [
  {
    image: "hero1.webp",
    mobileImage: "hero1-res.webp",
    description: "شرائح stc وزين وموبايلي بأسعار مضمونة — توصيل سريع لجميع مناطق المملكة وخدمة عملاء على مدار الساعة.",
    btn: { label: "تسوق الآن", href: "/sim-cards" },
  },
];

const slideVariants: Variants = {
  enter:  { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit:   { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    if (index === current) return;
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, paused]);

  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    };
    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchend", onEnd);
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [next, prev]);

  const s = slides[current];


  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-4 sm:mx-8 lg:mx-16 my-4">
      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={current}
          dir="rtl"
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative flex items-center overflow-hidden rounded-3xl"
          style={{ minHeight: "clamp(220px, 40vh, 680px)" }}
        >
          {/* background image */}
          <Image
            src={`/${s.image}`}
            alt="hero"
            fill
            priority
            className="object-cover object-center hidden sm:block"
            sizes="100vw"
          />
          {s.mobileImage && (
            <Image
              src={`/${s.mobileImage}`}
              alt="hero"
              fill
              priority
              className="object-cover object-center sm:hidden"
              sizes="100vw"
            />
          )}

          {/* subtle overlay for readability */}
          <div className="absolute inset-0 bg-white/50 z-0" />

          {/* content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16">
            <motion.div
              className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {/* badge */}
             

              <motion.h1
                variants={item}
                className="leading-snug mb-3 sm:mb-5"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(1.5rem, 4vw, 3.2rem)",
                  lineHeight: 1.3,
                  color: "#1e1e2e",
                }}
              >
                <span style={{ color: "#4224A0" }}>مسار الجوال</span>
                <br />
                وجهتك الأولى
                <br />
                لشراء  الشرائح
              </motion.h1>

              <motion.p
                variants={item}
                className="leading-relaxed mb-6 sm:mb-8 text-base sm:text-base md:text-lg"
                style={{
                  fontFamily: "Cairo, sans-serif",
                  fontWeight: 700,
                  color: "#1e1e2e",
                  lineHeight: 1.8,
                }}
              >
                شرائح <span style={{ color: "#4224A0" }}>stc</span> و<span style={{ color: "#4224A0" }}>زين</span> و<span style={{ color: "#4224A0" }}>موبايلي</span> بأسعار مضمونة — <span style={{ color: "#4224A0" }}>توصيل سريع</span> لجميع مناطق المملكة و<span style={{ color: "#4224A0" }}>خدمة عملاء</span> على مدار الساعة.
              </motion.p>

              {/* stats row */}
              <motion.div variants={item} className="flex flex-wrap gap-4 mb-5">
                {[
                  { num: "+5000", label: "عميل راضٍ" },
                  { num: "+20",   label: "شريحة متاحة" },
                  { num: "4.9",   label: "تقييم العملاء" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div style={{ fontFamily: "Cairo", fontWeight: 900, fontSize: "clamp(0.9rem, 2.5vw, 1.5rem)", color: "#4224A0" }}>
                      {stat.num}
                    </div>
                    <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: "clamp(0.6rem, 1.5vw, 0.78rem)", color: "#6B7280" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={item}>
                <Link
                  href={s.btn.href}
                  className="inline-flex items-center gap-3 px-8 sm:px-12 py-3 sm:py-4 rounded-2xl text-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #4224A0 0%, #6236E3 100%)",
                    fontFamily: "Cairo, sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
                    boxShadow: "0 8px 28px #6236E360",
                  }}
                >
                  <ShoppingBag size={20} strokeWidth={2.2} />
                  {s.btn.label}
                </Link>
              </motion.div>
            </motion.div>
          </div>

       
        </motion.section>
      </AnimatePresence>
      </div>

      {/* dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`slide ${i + 1}`}
              animate={{
                width: i === current ? 24 : 8,
                background: i === current ? "#80C78D" : "rgba(255,255,255,0.35)",
              }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
