import { Suspense } from "react";
import AllProductsClient from "./AllProductsClient";

export const metadata = {
  title: "جميع المنتجات | سهلناها التقنية (اتصالات)",
  description: "تصفح جميع منتجاتنا من شرائح وباقات إنترنت بأفضل الأسعار من سهلناها التقنية (اتصالات)",
};

export default function AllProductsPage() {
  return (
    <Suspense>
      <AllProductsClient />
    </Suspense>
  );
}
