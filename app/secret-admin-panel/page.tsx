"use client";

import { useState, useEffect } from "react";

const ADMIN_SECRET = "sahlnaha_admin_secret_2025";

export default function SecretAdminPanel() {
  const [maintenance, setMaintenance] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/maintenance?secret=${ADMIN_SECRET}`)
      .then((r) => r.json())
      .then((d) => setMaintenance(d.maintenance));

    // منح الكوكي للأدمن تلقائيًا عند فتح الصفحة
    fetch("/api/maintenance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: ADMIN_SECRET }),
    });
  }, []);

  const toggle = async () => {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: ADMIN_SECRET, enabled: !maintenance }),
    });
    const data = await res.json();
    if (data.success) {
      setMaintenance(data.maintenance);
      setMsg(data.maintenance ? "✅ وضع الصيانة مفعّل" : "✅ الموقع شغّال الآن");
    }
    setLoading(false);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4"
    >
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
        <h1 className="text-2xl font-bold mb-2">لوحة التحكم السرية</h1>
        <p className="text-slate-400 text-sm mb-6">التحكم في وضع الصيانة</p>

        <div className="mb-6">
          <span className="text-sm text-slate-400">الحالة الحالية:</span>
          <div className="mt-2">
            {maintenance === null ? (
              <span className="text-slate-500">جاري التحميل...</span>
            ) : maintenance ? (
              <span className="bg-red-500/20 text-red-400 px-4 py-1 rounded-full text-sm font-medium">
                🔴 الموقع تحت الصيانة
              </span>
            ) : (
              <span className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm font-medium">
                🟢 الموقع شغّال
              </span>
            )}
          </div>
        </div>

        <button
          onClick={toggle}
          disabled={loading || maintenance === null}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            maintenance
              ? "bg-green-600 hover:bg-green-500"
              : "bg-red-600 hover:bg-red-500"
          } disabled:opacity-50`}
        >
          {loading ? "جاري..." : maintenance ? "تشغيل الموقع" : "تفعيل الصيانة"}
        </button>

        {msg && <p className="mt-4 text-sm text-slate-300">{msg}</p>}

        <p className="mt-6 text-xs text-slate-600">
          أنت تتصفح الموقع بشكل طبيعي حتى لو الصيانة مفعّلة
        </p>
      </div>
    </div>
  );
}
