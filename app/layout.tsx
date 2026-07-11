import type { Metadata } from "next";
import { Kalam } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ImpersonationBanner } from "@/components/impersonation-banner";

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kalam",
});

export const metadata: Metadata = {
  title: "1Rupee — Recurring Giving Platform",
  description:
    "India's simplest recurring giving platform for daily micro-donations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={kalam.variable}>
      <body>
        <ImpersonationBanner />
        <SiteHeader />
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
