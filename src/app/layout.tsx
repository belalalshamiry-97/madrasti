import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "@/components/common/PWARegister";

export const metadata: Metadata = {
  title: "مدرستي — منصة التعلّم الإلكتروني",
  description: "المنصة التعليمية المتكاملة للمرحلة الثانوية — مدرستي",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "مدرستي",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-brand-cyan/20 selection:text-brand-cyan">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
