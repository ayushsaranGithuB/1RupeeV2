import type { Metadata } from "next";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
