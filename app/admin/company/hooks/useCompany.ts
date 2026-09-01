"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCompanyStore } from "../../../store/companyStore";
import { API, defaultData, toFullUrl } from "../constants";
import type { CompanyData } from "../types";

export function useCompany() {
  const { setLogo } = useCompanyStore();
  const [data, setData] = useState<CompanyData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/company`)
      .then((r) => r.json())
      .then((res) => {
        const imageKeys = ["logo", "header", "footer", "stamp", "cancelStamp"];
        const merged: CompanyData = { ...defaultData };
        for (const k of Object.keys(defaultData)) {
          if (res[k] !== undefined && res[k] !== "") {
            merged[k] = imageKeys.includes(k) ? toFullUrl(res[k]) : res[k];
          }
        }
        setData(merged);
      })
      .catch(() => toast.error("فشل تحميل بيانات الشركة"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = async (key: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`/api/admin/company/upload/${key}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "فشل رفع الصورة"); return; }
      const fullUrl = json.url.startsWith("http") ? json.url : `${API}${json.url}`;
      handleChange(key, fullUrl);
      if (key === "logo") { setLogo(fullUrl); }
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("فشل رفع الصورة");
    }
  };

  const handleImageDelete = async (key: string): Promise<void> => {
    try {
      const res = await fetch(`/api/admin/company/image/${key}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) { toast.error("فشل حذف الصورة"); return; }
      handleChange(key, "");
      if (key === "logo") setLogo("");
      toast.success("تم حذف الصورة");
    } catch {
      toast.error("فشل حذف الصورة");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only send text fields — images are managed via separate upload/delete endpoints
      const IMAGE_KEYS = ["logo", "header", "footer", "stamp", "cancelStamp"];
      const textPayload = Object.fromEntries(
        Object.entries(data).filter(([k]) => !IMAGE_KEYS.includes(k))
      );
      const res = await fetch(`/api/admin/company`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(textPayload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || "فشل الحفظ");
        return;
      }
      await fetch("/api/revalidate?tag=company", { method: "POST" });
      toast.success("تم حفظ بيانات الشركة");
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return { data, loading, saving, handleChange, handleImageChange, handleImageDelete, handleSave };
}
