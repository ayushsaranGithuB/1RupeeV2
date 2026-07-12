"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest, calculateDonationRunway, formatRunwayDays } from "@/lib/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Wallet = { cached_balance: number } | null;

type Pledge = {
  id: string;
  status: string;
  campaign_title?: string;
  tier_title?: string;
  daily_amount?: number;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<Wallet>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [w, p] = await Promise.all([
        dashboardRequest<Wallet>("/wallets").catch(() => null),
        dashboardRequest<Pledge[]>("/pledges").catch(() => []),
      ]);
      if (!active) return;
      setWallet(w ?? null);
      setPledges(Array.isArray(p) ? p : []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const activePledges = pledges.filter((p) => p.status === "ACTIVE");
  const totalDailyAmount = activePledges.reduce((sum, p) => sum + (p.daily_amount || 0), 0);
  const donationRunway = calculateDonationRunway(wallet?.cached_balance || 0, totalDailyAmount);
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Hero section: Impact-first messaging */}
      <div className="space-y-4 rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6">
        <p className="text-sm font-medium text-emerald-700">Good morning, {firstName} 👋</p>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-emerald-600 mb-1">You're currently supporting</p>
            <p className="text-3xl font-bold text-emerald-900 sm:text-4xl">
              ❤️ {loading ? "…" : activePledges.length} {activePledges.length === 1 ? "cause" : "causes"}
            </p>
          </div>

          <div>
            <p className="text-sm text-emerald-600 mb-1">Your generosity is funded for</p>
            <p className="text-3xl font-bold text-emerald-900 sm:text-4xl">
              {loading ? "…" : `${donationRunway} ${donationRunway === 1 ? "more day" : "more days"}`}
            </p>
          </div>

          {!loading && activePledges.length > 0 && (
            <div>
              <p className="text-sm text-emerald-600 mb-1">Your next recommended top-up is</p>
              <p className="text-sm font-medium text-emerald-900">
                {new Date(Date.now() + donationRunway * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric"
                })}
              </p>
            </div>
          )}
        </div>

        {!loading && activePledges.length > 0 && (
          <Link href="/dashboard/wallet/topup" className="inline-block">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
              Extend My Impact
            </Button>
          </Link>
        )}
      </div>

      {/* Donation runway card - detailed breakdown */}
      {!loading && activePledges.length > 0 && (
        <Link href="/dashboard/wallet" className="block transition hover:opacity-90">
          <Card className="border-emerald-100 bg-emerald-50 p-6">
            <p className="text-sm font-medium text-emerald-700">Donation Runway</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900 sm:text-4xl">
              {donationRunway} days remaining
            </p>
            <p className="mt-2 text-sm text-emerald-700">
              Supporting {activePledges.length} {activePledges.length === 1 ? "campaign" : "campaigns"}
            </p>
            <p className="mt-3 text-xs text-emerald-600">
              Daily commitment: {formatInrPaisa(totalDailyAmount)}/day
            </p>
            <p className="mt-3 text-sm text-emerald-700">
              View wallet details and extend →
            </p>
          </Card>
        </Link>
      )}

      {/* Active pledges preview */}
      <Link href="/dashboard/pledges" className="block transition hover:opacity-90">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Active causes ({loading ? "…" : activePledges.length})
          </h2>
          {loading ? (
            <p className="mt-2 text-sm text-slate-500">Loading…</p>
          ) : activePledges.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Start supporting causes that matter to you.</p>
          ) : (
            <ul className="mt-4 space-y-3 divide-y divide-slate-100">
              {activePledges.slice(0, 3).map((pledge) => (
                <li key={pledge.id} className="flex flex-col gap-1 py-2 first:pt-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {pledge.campaign_title || "Campaign"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {pledge.tier_title || "Support tier"}
                      </p>
                    </div>
                    {typeof pledge.daily_amount === "number" && (
                      <span className="text-sm font-semibold text-slate-700">
                        {formatInrPaisa(pledge.daily_amount)}/day
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-slate-500">Manage all causes →</p>
        </Card>
      </Link>
    </div>
  );
}
