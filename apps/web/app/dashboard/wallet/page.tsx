"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest, formatDate } from "@/lib/dashboard";
import { buttonVariants } from "@/components/ui/button";

type Wallet = { cached_balance: number } | null;

type Transaction = {
  id: string;
  type: "TOPUP" | "DONATION" | "REFUND" | "ADJUSTMENT";
  amount: number;
  description: string | null;
  created_at: string;
};

const TYPE_LABELS: Record<Transaction["type"], string> = {
  TOPUP: "Top-up",
  DONATION: "Donation",
  REFUND: "Refund",
  ADJUSTMENT: "Adjustment",
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [w, tx] = await Promise.all([
          dashboardRequest<Wallet>("/wallets"),
          dashboardRequest<Transaction[]>("/wallets/transactions"),
        ]);
        if (!active) return;
        setWallet(w);
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">Wallet</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Your balance
        </h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <p className="text-sm font-medium text-emerald-700">Available balance</p>
        <p className="mt-1 text-4xl font-bold text-emerald-900">
          {loading ? "…" : formatInrPaisa(wallet?.cached_balance || 0)}
        </p>
        <Link
          href="/dashboard/wallet/topup"
          className={buttonVariants({
            className: "mt-4 bg-emerald-600 text-white hover:bg-emerald-500",
          })}
        >
          Top up wallet
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Recent transactions
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isCredit = tx.type === "TOPUP" || tx.type === "REFUND";
              return (
                <li key={tx.id} className="flex items-center justify-between py-3">
                  <div>
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
                        ? "text-sm font-semibold text-emerald-600"
                        : "text-sm font-semibold text-slate-700"
                    }
                  >
                    {isCredit ? "+" : "-"}
                    {formatInrPaisa(tx.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
