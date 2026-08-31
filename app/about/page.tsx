import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "من نحن - تعرف على سهلناها التقنية (اتصالات) ورؤيتنا وخدماتنا",
  description: "تعرف على سهلناها التقنية (اتصالات) - رؤيتنا ورسالتنا والخدمات المميزة التي نقدمها لعملائنا في جميع أنحاء المملكة العربية السعودية. شرائح اتصال وباقات إنترنت بأسعار مميزة وتوصيل سريع.",
};

export default function AboutPage() {
  return <AboutClient />;
}
