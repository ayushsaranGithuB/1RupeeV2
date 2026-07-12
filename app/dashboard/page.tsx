"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest, calculateDonationRunway, formatRunwayDays } from "@/lib/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

type Wallet = { cached_balance: number } | null;

type Pledge = {
  id: string;
  status: string;
  campaign_title?: string;
  tier_title?: string;
  daily_amount?: number;
};

type Donation = {
  amount: number;
  created_at?: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<Wallet>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [w, p, d] = await Promise.all([
        dashboardRequest<Wallet>("/wallets").catch(() => null),
        dashboardRequest<Pledge[]>("/pledges").catch(() => []),
        dashboardRequest<Donation[]>("/donations").catch(() => []),
      ]);
      if (!active) return;
      setWallet(w ?? null);
      setPledges(Array.isArray(p) ? p : []);
      setDonations(Array.isArray(d) ? d : []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const activePledges = pledges.filter((p) => p.status === "ACTIVE");
  const totalDailyAmount = activePledges.reduce((sum, p) => sum + (p.daily_amount || 0), 0);
  const donationRunway = calculateDonationRunway(wallet?.cached_balance || 0, totalDailyAmount);
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Friend";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-900">
          Hello, {firstName} 👋
        </h1>
      </div>

      {/* Currently Supporting Section */}
      {!loading && activePledges.length > 0 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-4">You're currently supporting:</p>
          </div>
          <div className="space-y-3">
            {activePledges.slice(0, 3).map((pledge) => (
              <Card key={pledge.id} className="border border-slate-200 bg-white p-4 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">
                      {pledge.campaign_title || "Campaign"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {pledge.tier_title || "Support tier"}
                      {typeof pledge.daily_amount === "number" && (
                        <span className="ml-2 text-slate-700">
                          • {formatInrPaisa(pledge.daily_amount)}/day
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      ACTIVE
                    </span>
                    <span className="text-slate-400">→</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {activePledges.length > 3 && (
            <p className="text-sm text-slate-600 mt-2">
              <Link href="/dashboard/pledges" className="text-blue-600 hover:text-blue-700 font-medium">
                Manage all causes →
              </Link>
            </p>
          )}
          <p className="text-xs text-slate-500 mt-4">Thank You for your support</p>
        </div>
      )}

      {/* Generosity Funded For Section */}
      {!loading && activePledges.length > 0 && (
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 p-8">
          <p className="text-sm font-medium text-blue-700 mb-6">Your generosity is funded for:</p>
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-lg bg-white border-2 border-blue-200 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-4xl sm:text-5xl font-bold text-blue-900 mb-2">
                {donationRunway} more {donationRunway === 1 ? "day" : "days"}
              </p>
              <p className="text-sm text-blue-700 mb-6">
                Total Daily Commitment • {formatInrPaisa(totalDailyAmount)}
              </p>
              <Link href="/dashboard/wallet/topup" className="inline-block">
                <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-semibold px-6 py-2">
                  Extend My Impact →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Your Impact Section */}
      <div className="rounded-lg bg-white border border-slate-200 p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6">Your Impact</h2>
        <p className="text-slate-600 mb-4">
          Your one small daily action helps fuels life-changing causes across India
        </p>
        <div className="text-5xl sm:text-6xl font-bold text-blue-900 mb-2">
          {loading ? "…" : `₹${formatInrPaisa(totalRaised)}`}
        </div>
        {donations.length > 0 && (
          <p className="text-sm text-slate-600">
            Raised so far towards {activePledges.length} {activePledges.length === 1 ? "campaign" : "campaigns"} over {Math.ceil(donations.length / Math.max(activePledges.length, 1))} days
          </p>
        )}
      </div>
    </div>
  );
}
