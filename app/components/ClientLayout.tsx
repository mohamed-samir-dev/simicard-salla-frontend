"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";
import AddToCartPopup from "./AddToCartPopup";

export default function ClientLayout({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isFileView = pathname.startsWith("/file-view");
  const isVerify = pathname === "/checkout/verify";
  const hideChrome = isAdmin || isFileView || isVerify;

  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && footer}
      {!hideChrome && <WhatsappButton />}
      {!hideChrome && <AddToCartPopup />}
    </>
  );
}
