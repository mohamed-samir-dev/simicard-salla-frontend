export interface AddressData {
  address: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  state: string;
  district: string;
  postalCode: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<Omit<AddressData, "latitude" | "longitude"> | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
      { headers: { "User-Agent": "sahlnaha-simcard/1.0" } }
    );
    const data = await res.json();
    if (!data || data.error) return null;
    const a = data.address ?? {};
    return {
      address: data.display_name ?? "",
      country: a.country ?? "",
      city: a.city || a.town || a.village || a.county || "",
      state: a.state ?? "",
      district: a.suburb || a.neighbourhood || a.district || "",
      postalCode: a.postcode ?? "",
    };
  } catch {
    return null;
  }
}

export async function searchAddress(query: string): Promise<{ display_name: string; lat: string; lon: string }[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&accept-language=ar&countrycodes=sa`,
      { headers: { "User-Agent": "sahlnaha-simcard/1.0" } }
    );
    return await res.json();
  } catch {
    return [];
  }
}
