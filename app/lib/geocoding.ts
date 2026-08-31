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

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

export async function reverseGeocode(lat: number, lng: number): Promise<Omit<AddressData, "latitude" | "longitude"> | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ar&key=${KEY}`
    );
    const data = await res.json();
    if (data.status !== "OK" || !data.results?.length) return null;
    const components: { long_name: string; types: string[] }[] = data.results[0].address_components;
    const get = (...types: string[]) => components.find(c => types.some(t => c.types.includes(t)))?.long_name ?? "";
    return {
      address: data.results[0].formatted_address ?? "",
      country: get("country"),
      city: get("locality", "administrative_area_level_2"),
      state: get("administrative_area_level_1"),
      district: get("sublocality", "sublocality_level_1", "neighborhood"),
      postalCode: get("postal_code"),
    };
  } catch {
    return null;
  }
}

export async function searchAddress(query: string): Promise<{ display_name: string; lat: string; lon: string }[]> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&language=ar&region=SA&key=${KEY}`
    );
    const data = await res.json();
    if (data.status !== "OK") return [];
    return data.results.slice(0, 5).map((r: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }) => ({
      display_name: r.formatted_address,
      lat: String(r.geometry.location.lat),
      lon: String(r.geometry.location.lng),
    }));
  } catch {
    return [];
  }
}
