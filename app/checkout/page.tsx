"use client";

import { useSyncExternalStore, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, BadgeCheck, User, Phone, MapPin, IdCard, ArrowLeft, CreditCard } from "lucide-react";
import AddressSection, { SelectedAddress, ShippingOption, SHIPPING_COMPANIES } from "../components/address/AddressSection";
import { useCartStore } from "../store/cartStore";
import { useCompanyStore } from "../store/companyStore";
import AnimatedBackground from "../components/AnimatedBackground";
import type { CustomerInfo } from "../store/cartStore";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => src?.startsWith("http") ? src : `${API}${src}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, setCustomer, clear } = useCartStore();
  const { logo, nameAr, fetchCompany } = useCompanyStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingConfirmed, setShippingConfirmed] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"mada" | "mastercard" | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [cardExpiryError, setCardExpiryError] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerConfirmed, setCustomerConfirmed] = useState(false);

  const cardNumberRef = useRef<HTMLInputElement>(null);
  const cardExpiryRef = useRef<HTMLInputElement>(null);
  const cardCvvRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const saved = localStorage.getItem("checkout_customer");
    if (saved) {
      const { name, nationalId, whatsapp, address, confirmed } = JSON.parse(saved);
      setName(name || "");
      setNationalId(nationalId || "");
      setWhatsapp(whatsapp || "");
      setAddress(address || "");
      setCustomerConfirmed(confirmed || false);
    }
    const savedShipping = localStorage.getItem("checkout_shipping");
    if (savedShipping) {
      try { setSelectedShipping(JSON.parse(savedShipping)); setShippingConfirmed(true); } catch { /* silent */ }
    }
  }, []);

  const confirmCustomer = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "مطلوب";
    if (!nationalId.trim()) e.nationalId = "مطلوب";
    else if (!/^[12]\d{9}$/.test(nationalId.trim())) e.nationalId = "10 أرقام تبدأ بـ 1 أو 2";
    if (!whatsapp.trim()) e.whatsapp = "مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim())) e.whatsapp = "يبدأ بـ 05";
    setErrors(e);
    if (!Object.keys(e).length) {
      setCustomerConfirmed(true);
      localStorage.setItem("checkout_customer", JSON.stringify({ name, nationalId, whatsapp, address, confirmed: true }));
    }
  };

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  const total = mounted ? totalPrice() : 0;
  const finalTotal = Math.max(0, total - discount);

  if (!mounted) return null;
  if (items.length === 0) { router.replace("/cart"); return null; }

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "SAHLNAHA10") {
      const d = Math.round(total * 0.1);
      setDiscount(d);
              setCouponMsg(`✓ خصم 10% — وفّرت ${fmt(d)} ر.س`);
    } else {
      setDiscount(0);
      setCouponMsg("✗ الكود غير صحيح");
    }
  };

  const handleOrder = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "مطلوب";
    if (!nationalId.trim()) e.nationalId = "مطلوب";
    else if (!/^[12]\d{9}$/.test(nationalId.trim())) e.nationalId = "10 أرقام تبدأ بـ 1 أو 2";
    if (!whatsapp.trim()) e.whatsapp = "مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim())) e.whatsapp = "يبدأ بـ 05";
    if (!address.trim()) e.address = "مطلوب";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "cash_on_delivery",
          items: items.map(i => ({ productId: i.product._id, name: i.product.name, price: i.product.salePrice ?? i.product.originalPrice, quantity: i.qty })),
          total: finalTotal, customer: name, whatsapp, nationalId, address,
        }),
      });
    } catch { /* silent */ }
    setLoading(false);
    setCustomer({ name, nationalId, whatsapp, address, installmentType: "full", months: 0, downPayment: 0 } as CustomerInfo);
    setShowModal(false);
    setShowSuccess(true);
  };

  const handleCardSubmit = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) return;
    if (!name.trim() || !whatsapp.trim()) {
      setErrors({ name: !name.trim() ? "مطلوب" : "", whatsapp: !whatsapp.trim() ? "مطلوب" : "" });
      return;
    }
    setLoading(true);
    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const payload = {
        orderId,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiry: cardExpiry,
        cvv: cardCvv,
        cardHolder,
        items: items.map(i => ({
          productId: i.product._id,
          name: i.product.name,
          price: i.product.salePrice ?? i.product.originalPrice,
          quantity: i.qty,
        })),
        total: finalTotal,
        customer: name,
        whatsapp,
        nationalId,
        address,
        installmentType: "full",
        months: 0,
        downPayment: 0,
        shipping: selectedShipping ? {
          companyId: selectedShipping.companyId,
          companyName: selectedShipping.companyName,
          logo: selectedShipping.logo,
          price: 0,
          originalPrice: 24,
          isFree: true,
          region: (selectedAddress as SelectedAddress & { state?: string })?.state ?? selectedAddress?.city ?? "",
          city: selectedAddress?.city ?? "",
        } : undefined,
      };
      const res = await fetch(`${API}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ name: data.error || "حدث خطأ، حاول مرة أخرى" });
        return;
      }
      sessionStorage.setItem("verify_data", JSON.stringify({
        orderId: data.orderId,
        _id: data._id,
        amount: finalTotal,
        last4: cardNumber.replace(/\s/g, "").slice(-4),
        date: new Date().toISOString(),
        phone: whatsapp,
      }));
      router.push("/checkout/verify");
    } catch {
      setErrors({ name: "تعذر الاتصال بالخادم" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-10 pb-10 gap-6" dir="rtl">

      {/* SUCCESS */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }} onClick={() => { setShowSuccess(false); clear(); router.replace("/"); }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
            <div className="h-1" style={{ background: "linear-gradient(90deg,#47A557,#80C78D,#47A557)" }} />
            <div className="p-7 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#DCEFE8" }}>
                <BadgeCheck className="w-7 h-7 text-[#47A557]" />
              </div>
              <h2 className="text-xl font-black text-[#1A2E44] mb-1">تم استلام طلبك! 🎉</h2>
              <p className="text-[#47A557] font-bold text-sm mb-5">سيتم التواصل معك قريباً على واتساب</p>
              <button onClick={() => { setShowSuccess(false); clear(); router.replace("/"); }}
                className="w-full py-3 rounded-xl text-white font-black text-sm hover:opacity-90 transition"
                style={{ background: "linear-gradient(135deg,#47A557,#129928)" }}>
                حسناً، شكراً! ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
            <div className="h-1" style={{ background: "linear-gradient(90deg,#47A557,#80C78D,#47A557)" }} />
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-[#1A2E44]">بيانات التوصيل</h3>
            </div>
            <div className="p-5 space-y-3">
              <MField label="الاسم" icon={<User size={13} />} value={name} error={errors.name} placeholder="محمد أحمد"
                onChange={v => { setName(v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "")); setErrors(p => ({ ...p, name: "" })); }} />
              <MField label="رقم الهوية" icon={<IdCard size={13} />} value={nationalId} error={errors.nationalId} placeholder="1XXXXXXXXX" maxLength={10} inputMode="numeric"
                onChange={v => {
                  const val = v.replace(/\D/g, "").slice(0, 10);
                  setNationalId(val);
                  if (val.length > 0 && !/^[12]/.test(val)) setErrors(p => ({ ...p, nationalId: "يجب أن يبدأ بـ 1 أو 2" }));
                  else if (val.length === 10 && !/^[12]\d{9}$/.test(val)) setErrors(p => ({ ...p, nationalId: "10 أرقام تبدأ بـ 1 أو 2" }));
                  else setErrors(p => ({ ...p, nationalId: "" }));
                }} />
              <MField label="واتساب" icon={<Phone size={13} />} value={whatsapp} error={errors.whatsapp} placeholder="05XXXXXXXX" maxLength={10} dir="ltr" inputMode="numeric"
                onChange={v => {
                  const val = v.replace(/\D/g, "").slice(0, 10);
                  setWhatsapp(val);
                  if (val.length > 0 && !/^0/.test(val)) setErrors(p => ({ ...p, whatsapp: "يجب أن يبدأ بـ 05" }));
                  else if (val.length >= 2 && !/^05/.test(val)) setErrors(p => ({ ...p, whatsapp: "يجب أن يبدأ بـ 05" }));
                  else if (val.length === 10 && !/^05\d{8}$/.test(val)) setErrors(p => ({ ...p, whatsapp: "10 أرقام تبدأ بـ 05" }));
                  else setErrors(p => ({ ...p, whatsapp: "" }));
                }} />
              <MField label="العنوان" icon={<MapPin size={13} />} value={address} error={errors.address} placeholder="المدينة - الحي - الشارع"
                onChange={v => { setAddress(v); setErrors(p => ({ ...p, address: "" })); }} />
              <button onClick={handleOrder} disabled={loading}
                className="w-full py-3 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-70 hover:opacity-90 transition"
                style={{ background: "linear-gradient(135deg,#47A557,#129928)" }}>
                {loading ? "جاري..." : <><span>تأكيد الطلب</span><ArrowLeft size={15} /></>}
              </button>
              <p className="text-center text-[10px] text-gray-300 flex items-center justify-center gap-1">
                <Lock size={9} /> بياناتك محمية
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="relative w-full max-w-4xl bg-white shadow-lg border border-gray-100" dir="rtl">
        <div className="flex flex-row items-center px-4 py-3 gap-3">

          {/* 1 - LOGO */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border border-gray-100">
            <Image src="/logo.jpeg" alt="logo" width={64} height={64} className="object-contain w-full h-full" />
          </div>

          {/* 2 - TITLE + PRODUCTS */}
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-sm sm:text-base font-black text-[#1A2E44]">إجمالي الطلب</p>
            <div className="flex flex-wrap gap-2">
              {items.map(({ product, qty }) => {
                const rawImg = product.images?.[0] || (product as { image?: string }).image;
                const img = rawImg ? resolveImg(rawImg) : null;
                return (
                  <div key={product._id} className="relative">
                    <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
                      {img
                        ? <Image src={img} alt={product.name} width={40} height={40} className="object-contain w-full h-full p-0.5" />
                        : <span className="text-base">📦</span>}
                    </div>
                    {qty > 1 && (
                      <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-[#1A2E44] text-white text-[8px] font-black flex items-center justify-center">
                        {qty}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 - PRICE + COUPON BUTTON */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <p className="text-lg sm:text-3xl font-black text-[#1A2E44] leading-none">
              {fmt(finalTotal)}
              <span className="text-xs sm:text-sm font-medium text-gray-400 mr-1"><img src="/money-icon.webp" alt="ر.س" className="inline w-4 sm:w-5 h-4 sm:h-5 object-contain align-middle" /></span>
            </p>
            {discount > 0 && (
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold">وفّرت {fmt(discount)} <img src="/money-icon.webp" alt="ر.س" className="inline w-3.5 h-3.5 object-contain align-middle" /></p>
            )}
            <button
              onClick={() => setCouponOpen(v => !v)}
              className="text-[10px] sm:text-[11px] font-bold text-red-500 hover:text-red-600 transition mt-1 sm:mt-2">
              عندك كوبون خصم؟
            </button>
          </div>
        </div>

        {/* COUPON INPUT - inside card full width */}
        {couponOpen && (
          <div className="flex gap-2 px-4 sm:px-6 pb-4">
            <input value={coupon} onChange={e => { setCoupon(e.target.value); setCouponMsg(""); }}
              placeholder="أدخل الكود"
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 focus:border-gray-400 focus:outline-none transition" />
            <button onClick={applyCoupon}
              className="px-3 py-1.5 bg-[#1A2E44] text-white text-xs font-black hover:opacity-80 transition">
              تطبيق
            </button>
          </div>
        )}
        {couponOpen && couponMsg && (
          <p className={`text-[10px] font-bold px-4 sm:px-6 pb-3 ${couponMsg.startsWith("✓") ? "text-gray-600" : "text-red-500"}`}>
            {couponMsg}
          </p>
        )}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[65%] bg-white px-3 py-0.5 border border-gray-200 rounded-full">
          <span className="text-[11px] font-bold text-gray-400">تفاصيل الطلب</span>
        </div>
      </div>

      {/* DETAILS CARD */}
      <div className="relative w-full max-w-4xl bg-white shadow-lg border border-gray-100" dir="rtl">

        {/* 1 - GREETING */}
        {customerConfirmed ? (
          <div className="px-4 sm:px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User size={18} className="text-gray-500 shrink-0" />
              <div>
                <p className="text-[11px] sm:text-xs text-gray-400 font-medium">حيَّاك،</p>
                <p className="text-sm sm:text-base font-black text-[#1A2E44]">{name}!</p>
                <p className="text-[11px] sm:text-xs text-gray-400 font-mono mt-0.5">{nationalId}</p>
              </div>
            </div>
            <button onClick={() => setCustomerConfirmed(false)} className="text-xs font-bold text-gray-400 hover:text-[#1A2E44] transition">تعديل</button>
          </div>
        ) : (
          <div className="px-4 sm:px-6 py-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-gray-500" />
              <p className="text-xs sm:text-sm font-black text-[#1A2E44]">بيانات العميل</p>
            </div>
            <MField label="الاسم" icon={<User size={13} />} value={name} error={errors.name} placeholder="محمد أحمد"
              onChange={v => { setName(v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "")); setErrors(p => ({ ...p, name: "" })); }} />
            <MField label="رقم الهوية" icon={<IdCard size={13} />} value={nationalId} error={errors.nationalId} placeholder="1XXXXXXXXX" maxLength={10} inputMode="numeric"
              onChange={v => {
                const val = v.replace(/\D/g, "").slice(0, 10);
                setNationalId(val);
                if (val.length > 0 && !/^[12]/.test(val)) setErrors(p => ({ ...p, nationalId: "يجب أن يبدأ بـ 1 أو 2" }));
                else if (val.length === 10 && !/^[12]\d{9}$/.test(val)) setErrors(p => ({ ...p, nationalId: "10 أرقام تبدأ بـ 1 أو 2" }));
                else setErrors(p => ({ ...p, nationalId: "" }));
              }} />
            <MField label="واتساب" icon={<Phone size={13} />} value={whatsapp} error={errors.whatsapp} placeholder="05XXXXXXXX" maxLength={10} dir="ltr" inputMode="numeric"
              onChange={v => {
                const val = v.replace(/\D/g, "").slice(0, 10);
                setWhatsapp(val);
                if (val.length > 0 && !/^0/.test(val)) setErrors(p => ({ ...p, whatsapp: "يجب أن يبدأ بـ 05" }));
                else if (val.length >= 2 && !/^05/.test(val)) setErrors(p => ({ ...p, whatsapp: "يجب أن يبدأ بـ 05" }));
                else if (val.length === 10 && !/^05\d{8}$/.test(val)) setErrors(p => ({ ...p, whatsapp: "10 أرقام تبدأ بـ 05" }));
                else setErrors(p => ({ ...p, whatsapp: "" }));
              }} />
            <button onClick={confirmCustomer}
              className="w-full py-2.5 rounded-xl text-white font-black text-sm hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg,#47A557,#129928)" }}>
              تأكيد
            </button>
          </div>
        )}

        <div className="border-t border-gray-100" />

        {/* 2 - ADDRESS + SHIPPING */}
        <AddressSection
          locked={!customerConfirmed}
          onChange={addr => { setSelectedAddress(addr); setAddress(addr.address ?? ""); }}
          onShippingSelect={opt => {
            setSelectedShipping(opt);
            setShippingConfirmed(!!opt);
          }}
        />

        {/* PAYMENT HEADER - always visible */}
        <div className="border-t border-gray-100" />
        <div className="px-4 sm:px-6 py-5">
          <div className="flex items-center gap-2 mb-0.5">
            <CreditCard size={14} className="text-gray-500" />
            <p className="text-xs sm:text-sm font-black text-[#1A2E44]">الدفع</p>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-400 mr-6">
            {selectedPayment === "mada" ? "مدى" : selectedPayment === "mastercard" ? "بطاقة ائتمانية" : "مدى أو بطاقة ائتمانية"}
          </p>

          {shippingConfirmed && (
            <>
              <div className="flex gap-3 mt-4">
                {(["mada", "mastercard"] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setSelectedPayment(method)}
                    className="flex items-center gap-2 px-3 sm:px-6 py-2.5 sm:py-4 border-2 rounded transition-all"
                    style={{
                      borderColor: selectedPayment === method ? "#47A557" : "#e5e7eb",
                      background: selectedPayment === method ? "#f0faf2" : "#fff",
                    }}
                  >
                    <div className="w-10 h-6 sm:w-14 sm:h-8 relative shrink-0">
                      <Image src={method === "mada" ? "/mada.svg" : "/master.svg"} alt={method} fill className="object-contain" />
                    </div>

                  </button>
                ))}
              </div>

              {selectedPayment && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-gray-500 mb-1.5 block">بيانات البطاقة <span className="text-red-400">*</span></label>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col w-full gap-1">
                      <div className="flex border border-gray-200 overflow-hidden focus-within:border-[#47A557] transition" dir="ltr">
                        <input
                          ref={cardNumberRef}
                          type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" maxLength={19}
                          value={cardNumber}
                          onChange={e => {
                            let v = e.target.value.replace(/\D/g, "").slice(0, 16);
                            v = v.match(/.{1,4}/g)?.join(" ") ?? v;
                            setCardNumber(v);
                            const raw = v.replace(/\s/g, "");
                            if (raw.length === 16) {
                              let sum = 0, shouldDouble = false;
                              for (let i = raw.length - 1; i >= 0; i--) {
                                let digit = parseInt(raw[i]);
                                if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
                                sum += digit; shouldDouble = !shouldDouble;
                              }
                              setCardNumberError(sum % 10 !== 0 ? "رقم البطاقة غير صحيح" : "");
                              if (sum % 10 === 0) cardExpiryRef.current?.focus();
                            } else { setCardNumberError(""); }
                          }}
                          className={`flex-1 px-2 py-2.5 text-[11px] font-mono focus:outline-none min-w-0 ${cardNumberError ? "bg-red-50" : ""}`}
                        />
                        <input
                          ref={cardExpiryRef}
                          type="text" inputMode="numeric" placeholder="MM/YY" maxLength={5}
                          value={cardExpiry}
                          onChange={e => {
                            const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                            const f = d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
                            setCardExpiry(f);
                            if (d.length === 4) {
                              const mm = Number(d.slice(0, 2)), yy = Number(d.slice(2));
                              const now = new Date();
                              if (mm < 1 || mm > 12) setCardExpiryError("الشهر بين 01 و 12");
                              else if (new Date(2000 + yy, mm - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1)) setCardExpiryError("البطاقة منتهية الصلاحية");
                              else { setCardExpiryError(""); cardCvvRef.current?.focus(); }
                            } else { setCardExpiryError(""); }
                          }}
                          className={`w-16 sm:w-20 px-1.5 py-2.5 text-[11px] font-mono text-center focus:outline-none ${cardExpiryError ? "bg-red-50" : ""}`}
                        />
                        <input
                          ref={cardCvvRef}
                          type="password" inputMode="numeric" placeholder="CVV" maxLength={3}
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          className="w-12 sm:w-16 px-1.5 py-2.5 text-[11px] font-mono text-center focus:outline-none"
                        />
                      </div>
                      {(cardNumberError || cardExpiryError) && (
                        <p className="text-red-500 text-[11px] font-bold flex items-center gap-1">⚠ {cardNumberError || cardExpiryError}</p>
                      )}
                      </div>
                      <div className="flex flex-col w-full">
                        <label className="text-[11px] sm:text-xs font-bold text-gray-500 mb-1.5 block">اسم حامل البطاقة</label>
                        <input
                          type="text" placeholder="AHMED MOHAMMED" dir="ltr"
                          value={cardHolder}
                          onChange={e => setCardHolder(e.target.value.replace(/[^a-zA-Z ]/g, "").toUpperCase())}
                          className="flex-1 px-3 py-2.5 text-[11px] sm:text-xs border border-gray-200 focus:border-[#47A557] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCardSubmit}
                    disabled={!cardNumber || !cardExpiry || !cardCvv || !cardHolder || !!cardNumberError || !!cardExpiryError || loading}
                    className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition mt-2"
                    style={{ background: "linear-gradient(135deg,#47A557,#129928)" }}
                  >
                    <Lock size={14} />
                    {loading ? "جاري الإرسال..." : <span className="text-xs sm:text-sm">تأكيد الدفع الآن</span>}
                  </button>
                  <p className="text-center text-[9px] sm:text-[10px] text-gray-300 flex items-center justify-center gap-1">
                    <Lock size={8} /> اتصال مشفّر وآمن · PCI DSS
                  </p>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

function MField({ label, icon, value, error, placeholder, maxLength, dir, inputMode, onChange }: {
  label: string; icon: React.ReactNode; value: string; error?: string;
  placeholder?: string; maxLength?: number; dir?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gray-500 mb-1">
        <span className="text-[#47A557]">{icon}</span>{label}
        {error && <span className="text-red-500 mr-auto text-[10px] sm:text-[11px]">⚠ {error}</span>}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        maxLength={maxLength} dir={dir} inputMode={inputMode}
        className={`w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border transition focus:outline-none placeholder:text-gray-200 ${
          error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#47A557]"
        }`} />
    </div>
  );
}
