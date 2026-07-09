"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: "📊", label: "Dashboard", href: "/admin" },
    { icon: "🏢", label: "NGOs", href: "/admin/ngos" },
    { icon: "📢", label: "Campaigns", href: "/admin/campaigns" },
    { icon: "⭐", label: "Support Tiers", href: "/admin/tiers" },
    { icon: "👥", label: "Users", href: "/admin/users" },
    { icon: "💰", label: "Payouts", href: "/admin/payouts" },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } border-r border-slate-200 bg-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h1 className={`text-lg font-bold ${!sidebarOpen && "hidden"}`}>
            1Rupee Admin
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ←
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold">Operations Dashboard</h2>
          <p className="text-sm text-slate-500">
            Manage platform, NGOs, campaigns, and payouts
          </p>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
