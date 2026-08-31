"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Truck, MapPin, AlertCircle, Search, Loader2, Save, PenLine, CheckCircle2 } from "lucide-react";
import { AddressData, searchAddress, reverseGeocode } from "../../lib/geocoding";
import { SAUDI_REGIONS } from "../../lib/saudiRegions";
import ShippingCompanyPicker from "./ShippingCompanyPicker";

const AddressMap = dynamic(() => import("./AddressMap"), { ssr: false });
const AddressSearch = dynamic(() => import("./AddressSearch"), { ssr: false });

export interface ShippingOption {
  companyId: string;
  companyName: string;
  logo: string;
  workDays: string;
}

export interface SelectedAddress extends Partial<AddressData> {
  buildingDescription: string;
  allowCourierCall: boolean;
  shippingAvailable: boolean;
  shippingCost: number;
}

interface Props {
  onChange: (addr: SelectedAddress) => void;
  onShippingSelect: (option: ShippingOption | null) => void;
  locked?: boolean;
}

export const SHIPPING_COMPANIES: ShippingOption[] = [
  { companyId: "aramex",   companyName: "أرامكس",  logo: "/aramix.webp",  workDays: "3 - 7 أيام عمل" },
  { companyId: "anywhere", companyName: "أي مكان", logo: "/aymakan.webp", workDays: "3 - 7 أيام" },
  { companyId: "imile",    companyName: "iMile",   logo: "/imile.webp",   workDays: "1 - 3 أيام عمل" },
  { companyId: "smsa",     companyName: "سمسا",    logo: "/sm.webp",      workDays: "3 - 10 أيام عمل" },
];

export default function AddressSection({ onChange, onShippingSelect, locked = false }: Props) {
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [addrData, setAddrData] = useState<Partial<AddressData> & { shippingAvailable: boolean; shippingCost: number }>({
    shippingAvailable: true,
    shippingCost: 0,
  });
  const [building, setBuilding] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // manual mode
  const [manualMode, setManualMode] = useState(false);
  const [manualRegion, setManualRegion] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualDistrict, setManualDistrict] = useState("");
  const [manualStreet, setManualStreet] = useState("");
  const [manualErrors, setManualErrors] = useState<Record<string, string>>({});

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<ShippingOption | null>(null);
  const [notSaudi, setNotSaudi] = useState(false);

  const manualCities = SAUDI_REGIONS.find(r => r.region === manualRegion)?.cities ?? [];

  // restore from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout_address");
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.addrData) setAddrData(p.addrData);
      if (p.building) setBuilding(p.building);
      if (p.manualMode !== undefined) setManualMode(p.manualMode);
      if (p.manualRegion) setManualRegion(p.manualRegion);
      if (p.manualCity) setManualCity(p.manualCity);
      if (p.manualDistrict) setManualDistrict(p.manualDistrict);
      if (p.manualStreet) setManualStreet(p.manualStreet);
      if (p.saved) setSaved(true);
    } catch { /* silent */ }
  }, []);

  const allowCall = false;

  const isSaudi = (country: string) =>
    /saudi|arabia|سعودي|السعودية/i.test(country);

  const handleAddressChange = useCallback((data: Partial<AddressData> & { shippingAvailable: boolean; shippingCost: number }) => {
    setAddrData(data);
    setSaved(false);
    setNotSaudi(!!data.country && !isSaudi(data.country));
    if (data.country && !isSaudi(data.country)) { setSelectedCompany(null); onShippingSelect(null); }
    onChange({ ...data, buildingDescription: building, allowCourierCall: allowCall });
  }, [building, onChange]);

  const handleSearchSelect = useCallback((data: Partial<AddressData> & { shippingAvailable: boolean; shippingCost: number; lat: number; lng: number }) => {
    const { lat, lng, ...rest } = data;
    setMarkerPos({ lat, lng });
    setAddrData(rest);
    setSaved(false);
    setNotSaudi(!!rest.country && !isSaudi(rest.country));
    if (rest.country && !isSaudi(rest.country)) { setSelectedCompany(null); onShippingSelect(null); }
    onChange({ ...rest, buildingDescription: building, allowCourierCall: allowCall });
  }, [building, onChange]);

  const hasAddress = !!addrData.address;
  const shortAddress = hasAddress
    ? [addrData.country, addrData.state, addrData.city, addrData.district].filter(Boolean).join(" - ")
    : null;

  const handleBuildingSearch = async () => {
    if (!building.trim()) return;
    setSearching(true);
    setSearchError("");
    const results = await searchAddress(building);
    if (!results.length) { setSearchError("لم يتم العثور على هذا المكان"); setSearching(false); return; }
    const { lat, lon } = results[0];
    const latN = parseFloat(lat), lngN = parseFloat(lon);
    setMarkerPos({ lat: latN, lng: lngN });
    const parsed = await reverseGeocode(latN, lngN);
    if (parsed) {
      const updated = { ...parsed, latitude: latN, longitude: lngN, shippingAvailable: true, shippingCost: 0 };
      setAddrData(updated);
      setSaved(false);
      onChange({ ...updated, buildingDescription: building, allowCourierCall: allowCall });
    }
    setSearching(false);
  };

  const persist = (data: typeof addrData, extra?: Record<string, unknown>) => {
    try {
      localStorage.setItem("checkout_address", JSON.stringify({
        addrData: data, building, manualMode, manualRegion, manualCity,
        manualDistrict, manualStreet, saved: true, ...extra,
      }));
    } catch { /* silent */ }
  };

  const handleSaveMap = () => {
    if (!hasAddress) { setSaveError("يرجى تحديد موقعك على الخريطة أولاً"); return; }
    if (addrData.country && !isSaudi(addrData.country)) {
      setSaveError("لا توجد شركة شحن متوفرة لهذا العنوان. نوفر الشحن داخل المملكة العربية السعودية فقط.");
      return;
    }
    setSaveError("");
    setSaved(true);
    persist(addrData);
    onChange({ ...addrData, buildingDescription: building, allowCourierCall: allowCall });
  };

  const handleSaveManual = () => {
    const e: Record<string, string> = {};
    if (!manualRegion) e.region = "مطلوب";
    if (!manualCity) e.city = "مطلوب";
    if (!manualStreet.trim()) e.street = "مطلوب";
    setManualErrors(e);
    if (Object.keys(e).length) return;

    const fullAddress = [manualStreet, manualDistrict, manualCity, manualRegion, "المملكة العربية السعودية"].filter(Boolean).join("، ");
    const data = {
      address: fullAddress,
      country: "المملكة العربية السعودية",
      state: manualRegion,
      city: manualCity,
      district: manualDistrict,
      shippingAvailable: true,
      shippingCost: 0,
    };
    setAddrData(data);
    setSaved(true);
    setSaveError("");
    persist(data, { manualMode: true, manualRegion, manualCity, manualDistrict, manualStreet });
    onChange({ ...data, buildingDescription: manualDistrict, allowCourierCall: allowCall });
  };

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={15} className="text-gray-500 shrink-0" />
          <div>
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium">عنوان التوصيل</p>
            <p className="text-xs sm:text-sm font-bold text-[#1A2E44] mt-0.5 flex items-center gap-1">
              <MapPin size={11} className="text-[#47A557]" />
              {saved ? (shortAddress ?? "تم تحديد العنوان") : "لم يتم تحديد عنوان"}
            </p>
          </div>
        </div>
        {saved && !locked && (
          <button
            onClick={() => {
              setSaved(false);
              setSelectedCompany(null);
              onShippingSelect(null);
              localStorage.removeItem("checkout_address");
            }}
            className="text-[11px] sm:text-xs font-bold text-gray-400 hover:text-[#1A2E44] transition"
          >
            تعديل
          </button>
        )}
      </div>

      {!locked && !saved && (
        <>
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setManualMode(false); setSaveError(""); }}
              className={`flex-1 py-2 text-[11px] sm:text-xs font-black border transition flex items-center justify-center gap-1.5 ${!manualMode ? "bg-[#1A2E44] text-white border-[#1A2E44]" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"}`}
            >
              <MapPin size={12} /> الخريطة
            </button>
            <button
              onClick={() => { setManualMode(true); setSaveError(""); }}
              className={`flex-1 py-2 text-[11px] sm:text-xs font-black border transition flex items-center justify-center gap-1.5 ${manualMode ? "bg-[#1A2E44] text-white border-[#1A2E44]" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"}`}
            >
              <PenLine size={12} /> إدخال يدوي
            </button>
          </div>

          {/* MAP MODE */}
          {!manualMode && (
            <>
              <AddressSearch onSelect={handleSearchSelect} />
              <div className="border border-gray-100 overflow-hidden shadow-sm">
                <AddressMap markerPos={markerPos} setMarkerPos={setMarkerPos} onAddressChange={handleAddressChange} />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-gray-500 mb-1">
                  وصف المبنى / المكان <span className="font-normal text-gray-300">(اختياري)</span>
                </p>
                <div className="flex gap-2">
                  <input
                    value={building}
                    onChange={e => { setBuilding(e.target.value); setSearchError(""); onChange({ ...addrData, buildingDescription: e.target.value, allowCourierCall: allowCall }); }}
                    onKeyDown={e => { if (e.key === "Enter") handleBuildingSearch(); }}
                    placeholder="مثال: الرياض، برج المملكة، حي النزهة..."
                    className="flex-1 px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 focus:border-[#47A557] focus:outline-none transition placeholder:text-gray-200"
                  />
                  <button
                    onClick={handleBuildingSearch}
                    disabled={searching || !building.trim()}
                    className="px-3 py-2 sm:py-2.5 bg-[#1A2E44] text-white text-[11px] sm:text-xs font-black hover:opacity-80 transition disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                  >
                    {searching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                    بحث
                  </button>
                </div>
                {searchError && <p className="text-red-500 text-[11px] font-bold mt-1">{searchError}</p>}
              </div>
            </>
          )}

          {/* MANUAL MODE */}
          {manualMode && (
            <div className="space-y-3">
              {/* Country fixed */}
              <MField label="الدولة" error="">
                <div className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 text-gray-500 select-none">
                  🇸🇦 المملكة العربية السعودية
                </div>
              </MField>

              <MField label="المنطقة" error={manualErrors.region} required>
                <select
                  value={manualRegion}
                  onChange={e => { setManualRegion(e.target.value); setManualCity(""); setManualErrors(p => ({ ...p, region: "" })); }}
                  className={sel(manualErrors.region)}
                >
                  <option value="">اختر المنطقة</option>
                  {SAUDI_REGIONS.map(r => <option key={r.region} value={r.region}>{r.region}</option>)}
                </select>
              </MField>

              <MField label="المدينة" error={manualErrors.city} required>
                <select
                  value={manualCity}
                  onChange={e => { setManualCity(e.target.value); setManualErrors(p => ({ ...p, city: "" })); }}
                  disabled={!manualRegion}
                  className={sel(manualErrors.city)}
                >
                  <option value="">اختر المدينة</option>
                  {manualCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </MField>

              <MField label="الحي" error="">
                <input value={manualDistrict} onChange={e => setManualDistrict(e.target.value)} placeholder="مثال: حي النزهة" className={inp("")} />
              </MField>

              <MField label="العنوان بالتفصيل" error={manualErrors.street} required>
                <input
                  value={manualStreet}
                  onChange={e => { setManualStreet(e.target.value); setManualErrors(p => ({ ...p, street: "" })); }}
                  placeholder="الشارع، رقم المبنى..."
                  className={inp(manualErrors.street)}
                />
              </MField>
            </div>
          )}

          {saveError && (
            <p className="text-red-500 text-[11px] font-bold flex items-center gap-1">
              <AlertCircle size={11} /> {saveError}
            </p>
          )}

          <button
            onClick={manualMode ? handleSaveManual : handleSaveMap}
            className="w-full py-2.5 text-white text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 hover:opacity-90 transition"
            style={{ background: "linear-gradient(135deg,#47A557,#129928)" }}
          >
            <Save size={12} /> حفظ العنوان
          </button>
        </>
      )}

      {/* Shipping section — header always visible, content only after valid saudi address */}
      <div className="space-y-2 pt-1">
        <div className="border-t border-gray-100" />
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-gray-500" />
            <p className="text-xs sm:text-sm font-black text-[#1A2E44]">شركة الشحن</p>
          </div>
          {selectedCompany && (
            <button
              onClick={() => { setSelectedCompany(null); onShippingSelect(null); }}
              className="text-[11px] sm:text-xs font-bold text-gray-400 hover:text-[#1A2E44] transition"
            >
              تعديل
            </button>
          )}
        </div>

        {!selectedCompany && (
          <p className="text-[11px] sm:text-xs text-gray-400">اختر شركة الشحن التي تناسبك</p>
        )}

        {saved && !selectedCompany && (
          <ShippingCompanyPicker
            options={SHIPPING_COMPANIES}
            selected={null}
            onSelect={opt => { setSelectedCompany(opt); onShippingSelect(opt); }}
          />
        )}

        {selectedCompany && (
          <div className="flex items-center gap-3 px-4 py-3 border border-gray-100 bg-gray-50">
            <div className="w-10 h-10 rounded border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={selectedCompany.logo}
                alt={selectedCompany.companyName}
                className="object-contain w-full h-full p-1"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#1A2E44]">{selectedCompany.companyName}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">{selectedCompany.workDays}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">24 ر.س</span>
              <span className="text-[9px] sm:text-[10px] font-black text-white px-1.5 py-0.5 rounded-md" style={{ background: "#47A557" }}>مجاني</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function sel(error?: string) {
  return `w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition bg-white ${error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#47A557]"}`;
}
function inp(error?: string) {
  return `w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition placeholder:text-gray-200 ${error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#47A557]"}`;
}
function MField({ label, error, required, children }: { label: string; error: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] sm:text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
        {error && <span className="text-red-500 mr-auto text-[10px] sm:text-[11px]">⚠ {error}</span>}
      </label>
      {children}
    </div>
  );
}
