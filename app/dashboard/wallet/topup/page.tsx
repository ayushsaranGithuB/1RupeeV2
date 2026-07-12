"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { dashboardRequest } from "@/lib/dashboard";

const PRESET_AMOUNTS_RUPEES = [100, 500, 1000];

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

type Pledge = {
  id: string;
  status: string;
  daily_amount?: number;
};

export default function TopupPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | "">(500);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p = await dashboardRequest<Pledge[]>("/pledges").catch(() => []);
        if (!active) return;
        setPledges(Array.isArray(p) ? p : []);
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
  const extensionDays = totalDailyAmount > 0 ? Math.floor((amount || 0) / totalDailyAmount) : 0;

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
      setError(err instanceof Error ? err.message : "Extension failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">Donation Runway</p>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Extend your impact</h1>
      </div>

      <Card className="border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          Payments are simulated in this environment — no real money moves.
        </p>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">How long would you like to extend your support?</p>
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

          {!loading && totalDailyAmount > 0 && amount && (
            <Card className="border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700 mb-1">This will extend your support by</p>
              <p className="text-2xl font-bold text-emerald-900">
                {extensionDays} {extensionDays === 1 ? "more day" : "more days"}
              </p>
            </Card>
          )}

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
            {submitting ? "Processing…" : `Extend for ₹${amount || 0}`}
          </Button>
        </form>
      </Card>
    </div>
  );
}
