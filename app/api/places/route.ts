import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

// GET /api/places?type=autocomplete&input=...
// GET /api/places?type=details&place_id=...
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");

  let url = "";
  if (type === "autocomplete") {
    const input = searchParams.get("input") ?? "";
    url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&language=ar&components=country:sa&key=${KEY}`;
  } else if (type === "details") {
    const place_id = searchParams.get("place_id") ?? "";
    url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=geometry&language=ar&key=${KEY}`;
  } else {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}
