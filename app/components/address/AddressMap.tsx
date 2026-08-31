"use client";

import { useEffect, useRef, useState } from "react";
import { Locate, Loader2 } from "lucide-react";
import { reverseGeocode, AddressData } from "../../lib/geocoding";
import { checkShipping } from "../../lib/shippingZones";

interface Props {
  markerPos: { lat: number; lng: number } | null;
  setMarkerPos: (pos: { lat: number; lng: number }) => void;
  onAddressChange: (data: Partial<AddressData> & { shippingAvailable: boolean; shippingCost: number }) => void;
}

export default function AddressMap({ markerPos, setMarkerPos, onAddressChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const initializedRef = useRef(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;

      // fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        center: [24.7136, 46.6753],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        setMarkerPos({ lat, lng });
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        const parsed = await reverseGeocode(lat, lng);
        if (parsed) {
          const shipping = checkShipping(parsed.city, parsed.state);
          onAddressChange({ ...parsed, latitude: lat, longitude: lng, shippingAvailable: shipping.available, shippingCost: shipping.cost });
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        initializedRef.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync marker when search selects a location
  useEffect(() => {
    if (!markerPos || !mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      mapInstanceRef.current!.setView([markerPos.lat, markerPos.lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([markerPos.lat, markerPos.lng]);
      } else {
        markerRef.current = L.marker([markerPos.lat, markerPos.lng]).addTo(mapInstanceRef.current!);
      }
    });
  }, [markerPos]);

  const handleCurrentLocation = () => {
    setLocError("");
    if (!navigator.geolocation) { setLocError("المتصفح لا يدعم تحديد الموقع"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarkerPos({ lat, lng });
        setLocating(false);
        const parsed = await reverseGeocode(lat, lng);
        if (parsed) {
          const shipping = checkShipping(parsed.city, parsed.state);
          onAddressChange({ ...parsed, latitude: lat, longitude: lng, shippingAvailable: shipping.available, shippingCost: shipping.cost });
        }
      },
      () => {
        setLocError("يرجى السماح بالوصول إلى موقعك لتحديد عنوان التوصيل.");
        setLocating(false);
      }
    );
  };

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full h-[300px] md:h-[400px]" />
      <button
        onClick={handleCurrentLocation}
        disabled={locating}
        className="absolute bottom-4 left-4 z-[1000] flex items-center gap-1.5 bg-white border border-gray-200 shadow px-3 py-2 text-xs font-bold text-[#1A2E44] hover:bg-gray-50 transition"
      >
        {locating ? <Loader2 size={13} className="animate-spin" /> : <Locate size={13} />}
        موقعي الحالي
      </button>
      {locError && <p className="text-[11px] text-red-500 font-medium mt-2 px-1">{locError}</p>}
    </div>
  );
}
