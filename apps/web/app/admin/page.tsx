"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ngos: 0,
    campaigns: 0,
    pendingPayouts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("📡 [Admin Page] Fetching stats via proxy...");

        const [ngosRes, campaignsRes, payoutsRes] = await Promise.all([
          fetch("/api/proxy/admin/ngos", {
            method: "GET",
            headers: { Authorization: "Bearer test-token" },
          }),
          fetch("/api/proxy/admin/campaigns", {
            method: "GET",
            headers: { Authorization: "Bearer test-token" },
          }),
          fetch("/api/proxy/admin/payouts", {
            method: "GET",
            headers: { Authorization: "Bearer test-token" },
          }),
        ]);

        console.log("✅ [Admin Page] All responses received");
        console.log("📊 [Admin Page] NGOs response:", {
          status: ngosRes.status,
          ok: ngosRes.ok,
        });
        console.log("📊 [Admin Page] Campaigns response:", {
          status: campaignsRes.status,
          ok: campaignsRes.ok,
        });
        console.log("📊 [Admin Page] Payouts response:", {
          status: payoutsRes.status,
          ok: payoutsRes.ok,
        });

        const ngosData = (await ngosRes.json()) as ApiResponse<any>;
        const campaignsData = (await campaignsRes.json()) as ApiResponse<any>;
        const payoutsData = (await payoutsRes.json()) as ApiResponse<any>;

        setStats({
          ngos: Array.isArray(ngosData.data) ? ngosData.data.length : 0,
          campaigns: Array.isArray(campaignsData.data)
            ? campaignsData.data.length
            : 0,
          pendingPayouts: Array.isArray(payoutsData.data)
            ? payoutsData.data.length
            : 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: number;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-3xl font-bold mt-2">{loading ? "—" : value}</p>
          </div>
          <span className="text-4xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Manage your 1Rupee platform from here
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon="🏢" label="Total NGOs" value={stats.ngos} />
        <StatCard icon="📢" label="Campaigns" value={stats.campaigns} />
        <StatCard
          icon="💰"
          label="Pending Payouts"
          value={stats.pendingPayouts}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/admin/ngos", label: "Create NGO", icon: "➕" },
              {
                href: "/admin/campaigns",
                label: "Create Campaign",
                icon: "➕",
              },
              { href: "/admin/tiers", label: "Add Tier", icon: "➕" },
              { href: "/admin/users", label: "Search Users", icon: "🔍" },
              { href: "/admin/payouts", label: "Generate Payout", icon: "💸" },
              { href: "/admin", label: "View Reports", icon: "📊" },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-medium">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent/5 border-accent/20">
        <CardHeader>
          <CardTitle className="text-base">API Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            API Server:{" "}
            <span className="font-mono bg-background px-2 py-1 rounded text-xs">
              {process.env.NEXT_PUBLIC_API_URL}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            All endpoints are protected with Bearer token authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
