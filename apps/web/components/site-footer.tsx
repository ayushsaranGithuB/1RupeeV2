"use client";

import { usePathname } from "next/navigation";

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
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex max-w-8xl items-center justify-between px-6 sm:px-10">
        <div>
          <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
            <span className="text-emerald-600">1</span>
            <span>Rupee</span>
          </p>
          <p className="text-xs text-slate-500">
            © 2026 1Rupee. Powering small donations at scale.
          </p>
        </div>
      </div>
    </footer>
  );
}
