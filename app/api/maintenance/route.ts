import { NextRequest, NextResponse } from "next/server";

const BYPASS_TOKEN = process.env.MAINTENANCE_BYPASS_TOKEN || "sahlnaha_bypass_2025";
const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

async function backendFetch(path: string, init?: RequestInit) {
  return fetch(`${BACKEND}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  });
}

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const r = await backendFetch("/api/admin/maintenance", { headers: { cookie } });
  const data = await r.json();
  if (!r.ok) return NextResponse.json(data, { status: r.status });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookie = req.headers.get("cookie") ?? "";
  const r = await backendFetch("/api/admin/maintenance", {
    method: "POST",
    body: JSON.stringify({ enabled: body.enabled }),
    headers: { cookie },
  });
  const data = await r.json();
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  const res = NextResponse.json(data);
  if (!body.enabled) {
    res.cookies.set("maintenance_bypass", BYPASS_TOKEN, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "strict",
    });
  }
  return res;
}

export async function PUT(req: NextRequest) {
  // Grant bypass cookie — no backend call needed, just validate via GET
  const cookie = req.headers.get("cookie") ?? "";
  const r = await backendFetch("/api/admin/maintenance", { headers: { cookie } });
  if (!r.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = NextResponse.json({ success: true });
  res.cookies.set("maintenance_bypass", BYPASS_TOKEN, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "strict",
  });
  return res;
}
