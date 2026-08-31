import Image from "next/image";
import { FaWhatsapp, FaMobileAlt, FaEnvelope } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getCompany() {
  try {
    const r = await fetch(`${API}/api/admin/company`, { next: { revalidate: 60 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export default async function Footer() {
  const c = await getCompany();

  function ensureAbsolute(url: string) {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  }

  function toInlineUrl(url: string) {
    if (!url) return "";
    return `/file-view?url=${encodeURIComponent(url)}`;
  }

  const qrSrc: string = c.qrImage || "";
  const qrLinkType: string = c.qrFile ? "file" : (c.qrLinkType || "link");
  const qrLink: string = qrLinkType === "file" ? toInlineUrl(c.qrFile || "") : ensureAbsolute(c.qrLink || "");

  const footerItems: { image: string; linkType: string; link: string; file: string }[] =
    (c.footerItems || []).filter((item: { image: string }) => item.image);

  const img1: string = c.img1 || "";
  const linkType1: string = c.file1 ? "file" : (c.link1Type || c.linkType1 || "link");
  const link1: string = linkType1 === "file" ? toInlineUrl(c.file1 || "") : ensureAbsolute(c.link1 || "");
  const img2: string = c.img2 || "";
  const linkType2: string = c.file2 ? "file" : (c.link2Type || c.linkType2 || "link");
  const link2: string = linkType2 === "file" ? toInlineUrl(c.file2 || "") : ensureAbsolute(c.link2 || "");

  function getHref(item: { linkType: string; link: string; file: string }) {
    if (item.file) return toInlineUrl(item.file);
    return item.linkType === "link" ? ensureAbsolute(item.link) : toInlineUrl(item.file);
  }

  const hasImages = qrSrc || footerItems.length > 0 || img1 || img2;

  return (
    <footer dir="rtl" className="text-white mt-16 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0d2e14 0%, #0a2410 40%, #071a0c 100%)" }}>

      {/* Top green accent line */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #47A557 30%, #80C78D 70%, transparent)" }} />

      {/* Decorative circles */}
      <div className="absolute rounded-full opacity-20 pointer-events-none"
        style={{ width: "400px", height: "400px", background: "radial-gradient(circle,#47A557,transparent 70%)", top: "-20%", left: "-5%" }} />
      <div className="absolute rounded-full border border-[#80C78D]/15 pointer-events-none"
        style={{ width: "300px", height: "300px", bottom: "-10%", right: "-5%" }} />

      <div className="relative max-w-6xl mx-auto px-5 pt-12 pb-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-[#80C78D]" />
              <h2 className="text-2xl font-black text-white">سهلناها</h2>
            </div>
            <p className="text-sm leading-7 max-w-sm text-white/55">
              {c.details || "منصتك الأولى لشراء شرائح الاتصال بكل سهولة وأمان، خدمة موثوقة وتوصيل سريع لباب بيتك."}
            </p>
            <div className="flex gap-3 mt-1">
              {c.whatsapp && (
                <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-110"
                  style={{ background: "rgba(128,199,141,0.12)", border: "1px solid rgba(128,199,141,0.3)" }}>
                  <FaWhatsapp size={17} className="text-[#80C78D]" />
                </a>
              )}
              {c.phone && (
                <a href={`tel:${c.phone}`}
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-110"
                  style={{ background: "rgba(128,199,141,0.12)", border: "1px solid rgba(128,199,141,0.3)" }}>
                  <FaMobileAlt size={17} className="text-[#80C78D]" />
                </a>
              )}
              {c.email && (
                <a href={`mailto:${c.email}`}
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-110"
                  style={{ background: "rgba(128,199,141,0.12)", border: "1px solid rgba(128,199,141,0.3)" }}>
                  <FaEnvelope size={17} className="text-[#80C78D]" />
                </a>
              )}
            </div>
          </div>

          {/* Commercial Register */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-[#80C78D]" />
              <h3 className="text-base font-bold text-white">السجل التجاري</h3>
            </div>
            <div className="flex flex-col gap-2 p-5 rounded-2xl"
              style={{ background: "rgba(128,199,141,0.07)", border: "1px solid rgba(128,199,141,0.2)" }}>
              <span className="text-xs text-white/45">رقم السجل التجاري</span>
              <span className="text-base font-black text-[#80C78D] tracking-wider">314781690600003</span>
              <span className="text-xs text-white/35">المملكة العربية السعودية</span>
            </div>
          </div>

          {/* Contact details */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-[#80C78D]" />
              <h3 className="text-base font-bold text-white">تواصل معنا</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {c.whatsapp && (
                <li>
                  <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors" dir="ltr">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                      style={{ background: "rgba(128,199,141,0.12)", border: "1px solid rgba(128,199,141,0.2)" }}>
                      <FaWhatsapp size={14} className="text-[#80C78D]" />
                    </span>
                    {c.whatsapp}
                  </a>
                </li>
              )}
              {c.phone && (
                <li>
                  <a href={`tel:${c.phone}`}
                    className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors" dir="ltr">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                      style={{ background: "rgba(128,199,141,0.12)", border: "1px solid rgba(128,199,141,0.2)" }}>
                      <FaMobileAlt size={14} className="text-[#80C78D]" />
                    </span>
                    {c.phone}
                  </a>
                </li>
              )}
              {c.email && (
                <li>
                  <a href={`mailto:${c.email}`}
                    className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors" dir="ltr">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                      style={{ background: "rgba(128,199,141,0.12)", border: "1px solid rgba(128,199,141,0.2)" }}>
                      <FaEnvelope size={14} className="text-[#80C78D]" />
                    </span>
                    {c.email}
                  </a>
                </li>
              )}
            </ul>

            {hasImages && (
              <div className="flex gap-2 items-center flex-wrap mt-1">
                {qrSrc && (
                  qrLink
                    ? <a href={qrLink} target="_blank" rel="noreferrer" className="shrink-0">
                        <Image src={qrSrc} alt="qr" width={200} height={200} className="rounded-lg bg-white p-1 h-auto w-auto max-h-14" style={{ border: "1px solid rgba(128,199,141,0.3)" }} />
                      </a>
                    : <Image src={qrSrc} alt="qr" width={200} height={200} className="rounded-lg bg-white p-1 shrink-0 h-auto w-auto max-h-14" style={{ border: "1px solid rgba(128,199,141,0.3)" }} />
                )}
                {footerItems.map((item, i) => {
                  const href = getHref(item);
                  const el = <Image key={i} src={item.image} alt={`footer-item-${i}`} width={200} height={200} className="rounded-lg h-auto w-auto max-h-14" />;
                  return href
                    ? <a key={i} href={href} target="_blank" rel="noreferrer" className="shrink-0">{el}</a>
                    : <span key={i} className="shrink-0">{el}</span>;
                })}
                {img1 && (link1
                  ? <a href={link1} target="_blank" rel="noreferrer" className="shrink-0"><Image src={img1} alt="img1" width={200} height={200} className="rounded-lg h-auto w-auto max-h-14" /></a>
                  : <Image src={img1} alt="img1" width={200} height={200} className="rounded-lg shrink-0 h-auto w-auto max-h-14" />
                )}
                {img2 && (link2
                  ? <a href={link2} target="_blank" rel="noreferrer" className="shrink-0"><Image src={img2} alt="img2" width={200} height={200} className="rounded-lg h-auto w-auto max-h-14" /></a>
                  : <Image src={img2} alt="img2" width={200} height={200} className="rounded-lg shrink-0 h-auto w-auto max-h-14" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(128,199,141,0.35), transparent)" }} />

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/mastercard.webp" alt="mastercard" width={40} height={25} className="object-contain rounded" style={{ height: "24px", width: "auto" }} />
            <Image src="/visa.webp" alt="visa" width={40} height={25} className="object-contain rounded" style={{ height: "24px", width: "auto" }} />
            <Image src="/unnamed.jpg" alt="payment" width={40} height={25} className="object-contain rounded" style={{ height: "24px", width: "auto" }} />
          </div>
          <p className="text-xs text-center text-white/35">
            جميع الحقوق محفوظة © {new Date().getFullYear()} — سهلنها
          </p>
        </div>
      </div>
    </footer>
  );
}
