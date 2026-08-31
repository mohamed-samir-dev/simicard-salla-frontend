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

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

declare global {
  interface Window {
    google: typeof google;
    initGoogleMap?: () => void;
  }
}

export default function AddressMap({ markerPos, setMarkerPos, onAddressChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  // كل الـ callbacks في refs عشان الـ map listener يشوف أحدث نسخة دايماً
  const onAddressChangeRef = useRef(onAddressChange);
  const setMarkerPosRef = useRef(setMarkerPos);
  useEffect(() => { onAddressChangeRef.current = onAddressChange; }, [onAddressChange]);
  useEffect(() => { setMarkerPosRef.current = setMarkerPos; }, [setMarkerPos]);

  const placeMarkerRef = useRef((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else {
      markerRef.current = new window.google.maps.Marker({ position: { lat, lng }, map });
    }
    map.panTo({ lat, lng });
  });

  // handleLatLng كـ ref — الـ map listener بيكلمها دايماً بأحدث نسخة
  const handleLatLngRef = useRef(async (lat: number, lng: number) => {
    setMarkerPosRef.current({ lat, lng });
    placeMarkerRef.current(lat, lng);
    const parsed = await reverseGeocode(lat, lng);
    if (parsed) {
      const shipping = checkShipping(parsed.city, parsed.state);
      onAddressChangeRef.current({
        ...parsed,
        latitude: lat,
        longitude: lng,
        shippingAvailable: shipping.available,
        shippingCost: shipping.cost,
      });
    }
  });

  useEffect(() => {
    const initMap = () => {
      if (!containerRef.current || mapRef.current) return;
      const map = new window.google.maps.Map(containerRef.current, {
        center: { lat: 24.7136, lng: 46.6753 },
        zoom: 6,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });
      // الـ listener بيكلم الـ ref مباشرة — مش بيتأثر بأي re-render
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        handleLatLngRef.current(e.latLng.lat(), e.latLng.lng());
      });
      mapRef.current = map;
    };

    if (window.google?.maps) {
      initMap();
    } else {
      window.initGoogleMap = initMap;
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&callback=initGoogleMap&language=ar`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  // sync marker when search selects a location
  useEffect(() => {
    if (!markerPos || !mapRef.current) return;
    mapRef.current.setZoom(15);
    placeMarkerRef.current(markerPos.lat, markerPos.lng);
  }, [markerPos]);

  const handleCurrentLocation = () => {
    setLocError("");
    if (!navigator.geolocation) { setLocError("المتصفح لا يدعم تحديد الموقع"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        await handleLatLngRef.current(pos.coords.latitude, pos.coords.longitude);
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
