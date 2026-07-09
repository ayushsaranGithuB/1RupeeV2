"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "NGOs", href: "/admin/ngos" },
  { label: "Campaigns", href: "/admin/campaigns" },
  { label: "Support Tiers", href: "/admin/tiers" },
  { label: "Users", href: "/admin/users" },
  { label: "Donations", href: "/admin/donations" },
  { label: "Ledger", href: "/admin/ledger" },
  { label: "Payouts", href: "/admin/payouts" },
  { label: "Transparency", href: "/admin/reports" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentSection =
    menuItems
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find(
        (item) =>
          pathname === item.href || pathname.startsWith(item.href + "/"),
      )?.label ?? "Dashboard";

  return (
    <div className="relative flex min-h-screen bg-[radial-gradient(circle_at_15%_0%,#dff5ec_0%,transparent_35%),radial-gradient(circle_at_100%_0%,#dbeafe_0%,transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef5ff_100%)] text-slate-900">
      <aside
        className={cn(
          "sticky top-0 z-20 h-screen border-r border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all duration-300",
          sidebarOpen ? "w-56" : "w-20",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-5">
            <div className={cn("space-y-1", !sidebarOpen && "hidden")}>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
                1Rupee
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                Admin Console
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="Toggle sidebar"
              className="border-slate-200 bg-white"
            >
              {sidebarOpen ? "-" : "+"}
            </Button>
          </div>

          <nav className="space-y-1.5 p-3">
            {menuItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-slate-900 text-white shadow-[0_10px_30px_-14px_rgba(15,23,42,0.8)]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    !sidebarOpen && "justify-center px-2 text-center",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-semibold",
                      active
                        ? "border-white/30 bg-white/20 text-white"
                        : "border-slate-200 bg-white text-slate-500",
                    )}
                  >
                    {item.label.charAt(0)}
                  </span>
                  <span className={cn(!sidebarOpen && "hidden")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className={cn("mt-auto px-4 pb-5", !sidebarOpen && "hidden")}>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Platform Health
              </p>
              <p className="mt-2 text-sm text-emerald-900">
                All core admin systems are operational.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
