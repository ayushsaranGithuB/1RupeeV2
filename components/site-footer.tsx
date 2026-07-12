"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerSections = [
  {
    title: "Platform",
    links: [
      { label: "Campaigns", href: "/campaigns" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export function SiteFooter() {
  const pathname = usePathname();

  // Only hide footer on admin and auth pages
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/auth")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="flex items-center gap-1 text-base font-semibold text-slate-900">
              <span className="text-emerald-600">1</span>
              <span>Rupee</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              India's simplest recurring giving platform for daily micro-donations.
            </p>
          </div>

          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-slate-900">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link, idx) => (
                  <li key={`${section.title}-${idx}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-600">
            © 2026 1Rupee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
