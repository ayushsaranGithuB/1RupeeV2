"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatInr } from "@/lib/public";
import { dashboardRequest, formatDate, calculateDonationRunway } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Wallet = { cached_balance: number } | null;

type Transaction = {
  id: string;
  type: "TOPUP" | "DONATION" | "REFUND" | "ADJUSTMENT";
  amount: number;
  description: string | null;
  created_at: string;
};

type Pledge = {
  id: string;
  status: string;
  daily_amount?: number;
};

const TYPE_LABELS: Record<Transaction["type"], string> = {
  TOPUP: "Extended impact",
  DONATION: "Supported cause",
  REFUND: "Refund",
  ADJUSTMENT: "Adjustment",
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [w, p, tx] = await Promise.all([
          dashboardRequest<Wallet>("/wallets"),
          dashboardRequest<Pledge[]>("/pledges").catch(() => []),
          dashboardRequest<Transaction[]>("/wallets/transactions"),
        ]);
        if (!active) return;
        setWallet(w);
        setPledges(Array.isArray(p) ? p : []);
        setTransactions(tx);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load wallet");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const activePledges = pledges.filter((p) => p.status === "ACTIVE");
  const totalDailyAmount = activePledges.reduce((sum, p) => sum + (p.daily_amount || 0), 0);
  const donationRunway = calculateDonationRunway(wallet?.cached_balance || 0, totalDailyAmount);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">Donation Runway</p>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Your impact timeline
        </h1>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && totalDailyAmount > 0 ? (
        <Card className="border-emerald-100 bg-emerald-50 p-6">
          <p className="text-sm font-medium text-emerald-700">Donation Runway</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900 sm:text-4xl">
            {donationRunway} days remaining
          </p>
          <div className="mt-4 space-y-2 text-sm text-emerald-700">
            <p>Supporting {activePledges.length} {activePledges.length === 1 ? "campaign" : "campaigns"}</p>
            <p>Daily commitment: {formatInr(totalDailyAmount)}/day</p>
          </div>
          <Link href="/dashboard/wallet/topup" className="mt-4 inline-block">
            <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-500 sm:w-auto">
              Extend My Impact
            </Button>
          </Link>
          <p className="mt-3 text-xs text-emerald-600">
            Current wallet balance: {formatInr(wallet?.cached_balance || 0)}
          </p>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-medium text-amber-800">Your support has paused</p>
          <p className="mt-2 text-amber-900">
            Recharge to continue helping the causes you've chosen.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link href="/dashboard/wallet/topup" className="block">
              <Button className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto">
                Continue Supporting
              </Button>
            </Link>
            <Link href="/dashboard/pledges" className="block">
              <Button variant="outline" className="w-full sm:w-auto">
                Recharge Wallet
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Activity history
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No activity yet.</p>
        ) : (
          <ul className="mt-4 space-y-3 divide-y divide-slate-100">
            {transactions.map((tx, index) => {
              const isCredit = tx.type === "TOPUP" || tx.type === "REFUND";
              return (
                <li
                  key={tx.id}
                  className={index === 0 ? "flex flex-col gap-2 py-0 sm:flex-row sm:items-center sm:justify-between" : "flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {TYPE_LABELS[tx.type]}
                    </p>
                    <p className="text-sm text-slate-500">
                      {tx.description || formatDate(tx.created_at)}
                    </p>
                  </div>
                  <span
                    className={
                      isCredit
                        ? "text-sm font-semibold text-emerald-600 shrink-0"
                        : "text-sm font-semibold text-slate-700 shrink-0"
                    }
                  >
                    {isCredit ? "+" : "-"}
                    {formatInr(tx.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
