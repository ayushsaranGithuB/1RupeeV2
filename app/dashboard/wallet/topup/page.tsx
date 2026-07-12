"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
      amount: amountRupees,
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
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Top up</h1>
      </div>

      <Card className="border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          Payments are simulated in this environment — no real money moves.
        </p>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Choose an amount</p>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              {PRESET_AMOUNTS_RUPEES.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  variant={amount === preset ? "default" : "outline"}
                  className={
                    amount === preset
                      ? "rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "rounded-full"
                  }
                >
                  ₹{preset}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Custom amount (₹)
            </label>
            <Input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Enter amount"
            />
          </div>

          {error ? (
            <Card className="border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </Card>
          ) : null}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {submitting ? "Processing…" : `Top up ₹${amount || 0}`}
          </Button>
        </form>
      </Card>
    </div>
  );
}
