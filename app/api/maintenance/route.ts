import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync } from "fs";
import path from "path";

const ADMIN_SECRET = process.env.MAINTENANCE_ADMIN_SECRET || "sahlnaha_admin_secret_2025";
const BYPASS_TOKEN = process.env.MAINTENANCE_BYPASS_TOKEN || "sahlnaha_bypass_2025";
const ENV_PATH = path.join(process.cwd(), ".env.local");

function getMaintenanceStatus(): boolean {
  try {
    const content = readFileSync(ENV_PATH, "utf-8");
    return /^MAINTENANCE_MODE=true$/m.test(content);
  } catch {
    return false;
  }
}

function setMaintenanceStatus(enabled: boolean) {
  const content = readFileSync(ENV_PATH, "utf-8");
  const updated = content.replace(
    /^MAINTENANCE_MODE=.*/m,
    `MAINTENANCE_MODE=${enabled}`
  );
  writeFileSync(ENV_PATH, updated, "utf-8");
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ maintenance: getMaintenanceStatus() });
}

export async function POST(req: NextRequest) {
  const { secret, enabled } = await req.json();
  if (secret !== ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  setMaintenanceStatus(enabled);

  const res = NextResponse.json({ success: true, maintenance: enabled });

  if (!enabled) {
    // امسح الكوكي لو أوقف الصيانة (مش ضروري لكن نظافة)
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
  // منح الأدمن الكوكي للتجاوز
  const { secret } = await req.json();
  if (secret !== ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = NextResponse.json({ success: true });
  res.cookies.set("maintenance_bypass", BYPASS_TOKEN, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "strict",
  });
  return res;
}
