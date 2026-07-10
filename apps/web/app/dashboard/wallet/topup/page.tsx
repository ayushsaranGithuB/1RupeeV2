"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { dashboardRequest } from "@/lib/dashboard";

const PRESET_AMOUNTS_RUPEES = [100, 500, 1000];

// Credits the wallet directly through the mock payment provider (see
// docs/PAYMENTS.md) — there's no live Razorpay checkout wired up yet. When
// real Razorpay credentials land, only this function needs to change: create
// a Razorpay order, launch Checkout.js, and let the webhook confirm the
// credit instead of crediting here directly.
async function submitTopup(amountRupees: number) {
  const referenceId = crypto.randomUUID();
  return dashboardRequest("/wallets/topup", {
    method: "POST",
    body: JSON.stringify({
      amount: amountRupees * 100,
      reference_id: referenceId,
    }),
  });
}

export default function TopupPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | "">(500);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Enter an amount greater than ₹0.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitTopup(amount);
      router.push("/dashboard/wallet");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Top-up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">Wallet</p>
        <h1 className="text-3xl font-semibold text-slate-900">Top up</h1>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Payments are simulated in this environment — no real money moves.
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Choose an amount
          </p>
          <div className="flex gap-2">
            {PRESET_AMOUNTS_RUPEES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={
                  amount === preset
                    ? "rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                }
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Custom amount (₹)
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
        >
          {submitting ? "Processing…" : `Top up ₹${amount || 0}`}
        </Button>
      </form>
    </div>
  );
}
