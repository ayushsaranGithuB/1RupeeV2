"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { formatInrPaisa } from "@/lib/public";

type Wallet = { cached_balance: number } | null;

type Pledge = {
  id: string;
  status: string;
  campaign_title?: string;
  tier_title?: string;
  daily_amount?: number;
};

async function proxyGet<T>(path: string): Promise<T | null> {
  const res = await fetch(`/api/proxy${path}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: T };
  return json.success ? json.data : null;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    (async () => {
      const [w, p] = await Promise.all([
        proxyGet<Wallet>("/wallets"),
        proxyGet<Pledge[]>("/pledges"),
      ]);
      if (!active) return;
      setWallet(w ?? null);
      setPledges(Array.isArray(p) ? p : []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [session]);

  if (isPending || !session) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-slate-600">
        Loading your dashboard…
      </main>
    );
  }

  const user = session.user;
  const activePledges = pledges.filter((p) => p.status === "ACTIVE");

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Your account</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {user.name || user.email}
          </h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.push("/auth/sign-in");
          }}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <p className="text-sm font-medium text-emerald-700">Wallet balance</p>
        <p className="mt-1 text-4xl font-bold text-emerald-900">
          {loading ? "…" : formatInrPaisa(wallet?.cached_balance || 0)}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Active pledges ({activePledges.length})
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : activePledges.length === 0 ? (
          <p className="text-sm text-slate-500">No active pledges yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activePledges.map((pledge) => (
              <li
                key={pledge.id}
                className="flex items-center justify-between py-3"
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
      </section>
    </main>
  );
}
