"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { adminRequest, formatCurrency } from "@/lib/admin";

interface OverviewStats {
  total_users: number;
  active_donors: number;
  active_pledges: number;
  total_donation_volume: number;
  wallet_balance_across_platform: number;
  active_campaigns: number;
  pending_ngo_applications: number;
}

const quickLinks = [
  {
    href: "/admin/ngos",
    title: "Review NGOs",
    description: "Approve applications, update logos, and manage verification.",
  },
  {
    href: "/admin/users",
    title: "Support Users",
    description: "Inspect profiles, adjust wallets, and suspend accounts.",
  },
  {
    href: "/admin/payouts",
    title: "Run Payouts",
    description: "Generate reports, review totals, and mark payouts complete.",
  },
  {
    href: "/admin/reports",
    title: "Publish Reports",
    description: "Upload transparency, annual, and audit reports.",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminRequest<OverviewStats>("/admin/overview");
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load overview",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cards = [
    {
      label: "Total Users",
      value: stats?.total_users ?? 0,
    },
    {
      label: "Active Donors",
      value: stats?.active_donors ?? 0,
    },
    {
      label: "Active Pledges",
      value: stats?.active_pledges ?? 0,
    },
    {
      label: "Donation Volume",
      value: formatCurrency(stats?.total_donation_volume ?? 0),
    },
    {
      label: "Wallet Balance",
      value: formatCurrency(stats?.wallet_balance_across_platform ?? 0),
    },
    {
      label: "Active Campaigns",
      value: stats?.active_campaigns ?? 0,
    },
    {
      label: "Pending NGO Applications",
      value: stats?.pending_ngo_applications ?? 0,
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-500">Admin / Dashboard</p>
        <h1 className="text-[30px] font-semibold">Operations Dashboard</h1>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.label}
            className="overflow-hidden border-slate-200 bg-white"
          >
            <CardContent className="px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {loading ? "--" : card.value}
                  </p>
                </div>
                <div className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-1 text-[11px] font-semibold text-[hsl(var(--primary))]">
                  Live
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr,1fr]">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
            Quick Actions
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {link.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

       
      </div>
    </div>
  );
}
