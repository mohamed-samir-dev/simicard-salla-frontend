"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Truck, ShieldCheck, Headphones, CreditCard,
  MapPin, Zap, Smartphone, Shield, Wifi,
} from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────

interface SlideBase {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryBtn:   { label: string; href: string };
  image: string;
}

interface SplitSlide extends SlideBase {
  type: "split";
  note?: string;
  features: { icon: React.ElementType; title: string; desc: string }[];
}

type Slide = SplitSlide;

// ─── data ─────────────────────────────────────────────────────────────────

const slides: Slide[] = [
  {
    type: "split",
    image: "hero1.webp",
    badge: "تقنية أسهل.. اتصال أسرع",
    title: "كل اتصال",
  description: "نوفر لك أفضل الشرائح والباقات من شركات الاتصالات السعودية في مكان واحد، لتختار ما يناسبك بكل سهولة.",
    titleHighlight: "سهلناه عليك",
    primaryBtn:   { label: "تسوق الآن",     href: "/sim-cards" },
    features: [],
  },
  {
    type: "split",
    image: "hero2.webp",
    badge: " تقنية أسهل.. اتصال أقوى",
    title: "شرائح إلكترونية",
    titleHighlight: "لكل احتياج",
        description: "        اختر الشريحة المناسبة لك من جميع شركات الاتصالات السعودية وتمتع باتصال سريع وتغطية قوية في كل مكان.",

    primaryBtn:   { label: " تسوق الآن", href: "/sim-cards" },
    features: [],
  },
];



// ─── animation variants ───────────────────────────────────────────────────

const slideVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit:  { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const chipItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

// ─── shared slide background + decorations ────────────────────────────────

function SlideShell({ image, children }: { image: string; children: React.ReactNode }) {
  return (
    <section
      dir="rtl"
      className="relative flex items-center overflow-hidden"
      style={{
        minHeight: "clamp(280px, 45vh, 900px)",
        backgroundImage: `url('/${image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >


      {/* decorative circles */}
      <div className="absolute rounded-full opacity-30 pointer-events-none"
        style={{ width: "clamp(200px,40vw,500px)", height: "clamp(200px,40vw,500px)", background: "radial-gradient(circle,#5B6187,transparent 70%)", top: "-15%", right: "-10%" }} />
      <div className="absolute rounded-full border-2 border-[#80C78D]/20 pointer-events-none hidden sm:block"
        style={{ width: "clamp(260px,38vw,500px)", height: "clamp(260px,38vw,500px)", top: "50%", right: "5%", transform: "translateY(-50%)" }} />
      <div className="absolute rounded-full border border-[#80C78D]/10 pointer-events-none hidden sm:block"
        style={{ width: "clamp(180px,27vw,350px)", height: "clamp(180px,27vw,350px)", top: "50%", right: "10%", transform: "translateY(-50%)" }} />

      {children}
    </section>
  );
}

// ─── slide renderers ──────────────────────────────────────────────────────

function SplitSlideContent({ s }: { s: SplitSlide }) {
  return (
    <SlideShell image={s.image}>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-20">
        <motion.div
          className="w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-xl"
          variants={container} initial="hidden" animate="show"
        >
          <motion.div variants={item}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border border-[#80C78D]/50 text-black text-[10px] sm:text-sm font-semibold mb-3 sm:mb-6">
            <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-[#80C78D]" />
            {s.badge}
          </motion.div>

          <motion.h1 variants={item}
            className="font-black leading-tight text-black mb-3 sm:mb-5"
            style={{ fontSize: "clamp(1.5rem, 5vw, 4.5rem)" }}>
            {s.title}<br /><span className="text-[#80C78D]">{s.titleHighlight}</span>
          </motion.h1>

          <motion.p variants={item}
            className="text-black/70 font-bold leading-relaxed mb-4 sm:mb-8"
            style={{ fontSize: "clamp(0.75rem, 1.8vw, 1.15rem)" }}>
            {s.description}
          </motion.p>

          {/* features chips */}
          <motion.div variants={item} className="flex flex-wrap gap-1.5 sm:gap-3 mb-4 sm:mb-8">
            {s.features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} variants={chipItem}
                custom={i}
                className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/10"
                style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}>
                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border border-[#80C78D]/25 flex items-center justify-center shrink-0"
                  style={{ background: "rgba(128,199,141,0.08)" }}>
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-[#80C78D]" />
                </div>
                <div>
                  <p className="text-black font-bold text-[10px] sm:text-sm leading-none mb-0.5">{title}</p>
                  <p className="text-black/50 text-[9px] sm:text-xs hidden sm:block">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Link href={s.primaryBtn.href}
              className="px-8 sm:px-14 py-3 sm:py-5 rounded-2xl bg-[#47A557] text-white font-bold text-base sm:text-xl hover:-translate-y-1 transition-transform duration-200 shadow-lg shadow-[#47A557]/20">
              {s.primaryBtn.label}
            </Link>
         
          </motion.div>

          {s.note && (
            <motion.div variants={item}
              className="inline-block px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/10 text-white/60 text-xs sm:text-sm"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              {s.note}
            </motion.div>
          )}
        </motion.div>
      </div>
    </SlideShell>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number, dir?: number) => {
    if (index === current) return;
    setDirection(dir ?? (index > current ? 1 : -1));
    setCurrent(index);
  }, [current]);

  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length, -1), [current, goTo]);
  const next = useCallback(() => goTo((current + 1) % slides.length, 1), [current, goTo]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, paused]);

  // swipe
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
    <>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* slide */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <SplitSlideContent s={s} />
          </motion.div>
        </AnimatePresence>



        {/* dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, i) => (
              <motion.button
                key={i} onClick={() => goTo(i)} aria-label={`slide ${i + 1}`}
                animate={{ width: i === current ? 24 : 8, background: i === current ? "#80C78D" : "rgba(255,255,255,0.3)" }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
        )}
      </div>

 
    </>
  );
}
