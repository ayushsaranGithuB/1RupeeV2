"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest } from "@/lib/dashboard";

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
  const user = session?.user;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">Your account</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {user?.name || user?.email}
        </h1>
      </div>

      <Link
        href="/dashboard/wallet"
        className="block rounded-2xl border border-emerald-100 bg-emerald-50 p-6 transition hover:border-emerald-200"
      >
        <p className="text-sm font-medium text-emerald-700">Wallet balance</p>
        <p className="mt-1 text-4xl font-bold text-emerald-900">
          {loading ? "…" : formatInrPaisa(wallet?.cached_balance || 0)}
        </p>
        <p className="mt-2 text-sm text-emerald-700">
          View transactions and top up →
        </p>
      </Link>

      <Link
        href="/dashboard/pledges"
        className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Active pledges ({loading ? "…" : activePledges.length})
        </h2>
        {loading ? (
          <p className="mt-1 text-sm text-slate-500">Loading…</p>
        ) : activePledges.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500">No active pledges yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {activePledges.slice(0, 3).map((pledge) => (
              <li
                key={pledge.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="font-medium text-slate-900">
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
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-slate-500">Manage all pledges →</p>
      </Link>
    </div>
  );
}
