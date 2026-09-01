import { create } from "zustand";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface CompanyStore {
  logo: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  details: string;
  fetched: boolean;
  fetchCompany: () => Promise<void>;
  setLogo: (url: string) => void;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  logo: "",
  nameAr: "",
  nameEn: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  details: "",
  fetched: false,
  fetchCompany: async () => {
    if (get().fetched) return;
    try {
      const res = await fetch(`/api/company`);
      const data = await res.json();
      const fullLogo = data.logo
        ? (data.logo.startsWith("http") ? data.logo : `${API}${data.logo}`)
        : "";
      set({
        logo: fullLogo,
        nameAr: data.nameAr || "",
        nameEn: data.nameEn || "",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        website: data.website || "",
        details: data.details || "",
        fetched: true,
      });
    } catch (e) { console.error(e); }
  },
  setLogo: (url) => set({ logo: url }),
}));

// backward compat alias
export const useCompanyStoreLegacy = useCompanyStore;
