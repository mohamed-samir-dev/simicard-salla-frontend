"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { searchAddress, reverseGeocode, AddressData } from "../../lib/geocoding";
import { checkShipping } from "../../lib/shippingZones";

interface Suggestion { display_name: string; lat: string; lon: string; }

interface Props {
  onSelect: (data: Partial<AddressData> & { shippingAvailable: boolean; shippingCost: number; lat: number; lng: number }) => void;
}

export default function AddressSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounce.current) clearTimeout(debounce.current);
    if (val.trim().length < 3) { setSuggestions([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchAddress(val);
      setSuggestions(results);
      setOpen(results.length > 0);
      setLoading(false);
    }, 500);
  };

  const handleSelect = async (s: Suggestion) => {
    setQuery(s.display_name);
    setOpen(false);
    setSuggestions([]);
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    const parsed = await reverseGeocode(lat, lng);
    if (parsed) {
      const shipping = checkShipping(parsed.city, parsed.state);
      onSelect({ ...parsed, lat, lng, shippingAvailable: shipping.available, shippingCost: shipping.cost });
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        {loading ? <Loader2 size={14} className="animate-spin text-gray-300" /> : <Search size={14} className="text-gray-300" />}
      </div>
      <input
        value={query}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="إبحث عن عنوان..."
        dir="rtl"
        className="w-full pr-9 pl-3 py-2.5 text-sm border border-gray-200 focus:border-[#47A557] focus:outline-none transition placeholder:text-gray-300"
      />
      {open && (
        <ul className="absolute z-[1001] w-full bg-white border border-gray-200 shadow-lg mt-1 max-h-52 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li key={i} onMouseDown={() => handleSelect(s)}
              className="px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 leading-relaxed">
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
