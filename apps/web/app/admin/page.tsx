"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        setError(err instanceof Error ? err.message : "Failed to load overview");
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
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Active Donors",
      value: stats?.active_donors ?? 0,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Active Pledges",
      value: stats?.active_pledges ?? 0,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Donation Volume",
      value: formatCurrency(stats?.total_donation_volume ?? 0),
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "Wallet Balance",
      value: formatCurrency(stats?.wallet_balance_across_platform ?? 0),
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Active Campaigns",
      value: stats?.active_campaigns ?? 0,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Pending NGO Applications",
      value: stats?.pending_ngo_applications ?? 0,
      tone: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Admin Screens</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          This workspace now surfaces the full operations checklist from the roadmap:
          NGO approvals, campaign operations, support tiers, donor support,
          ledger visibility, payouts, and transparency publishing.
        </p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {loading ? "--" : card.value}
                  </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${card.tone}`}>
                  Live
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump directly into the most important operator workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">{link.title}</p>
                <p className="mt-2 text-sm text-slate-500">{link.description}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operations Checklist</CardTitle>
            <CardDescription>
              The admin area now includes screens for every feature called out in
              FEATURES.md.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>NGO approvals and archive controls</p>
            <p>Campaign creation, editing, and hero image management</p>
            <p>3-5 tier configuration with impact description editing</p>
            <p>User search, profile review, wallet actions, and suspension</p>
            <p>Donation search, ledger visibility, payouts, and reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}