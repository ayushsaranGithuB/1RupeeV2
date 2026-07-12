"use client";

import { useEffect, useState } from "react";
import { formatInr } from "@/lib/public";
import { dashboardRequest, calculateDonationRunway } from "@/lib/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Wallet = { cached_balance: number } | null;

type Pledge = {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  campaign_title?: string;
  tier_title?: string;
  daily_amount?: number;
  monthly_equivalent?: number;
};

const STATUS_VARIANT: Record<Pledge["status"], "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  PAUSED: "secondary",
  CANCELLED: "destructive",
};

export default function PledgesPage() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [wallet, setWallet] = useState<Wallet>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    try {
      const [p, w] = await Promise.all([
        dashboardRequest<Pledge[]>("/pledges"),
        dashboardRequest<Wallet>("/wallets").catch(() => null),
      ]);
      setPledges(Array.isArray(p) ? p : []);
      setWallet(w);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pledges");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Pledge["status"]) {
    if (status === "CANCELLED" && !window.confirm("Cancel this pledge? This can't be undone.")) {
      return;
    }
    setUpdatingId(id);
    setError(null);
    try {
      await dashboardRequest(`/pledges/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pledge");
    } finally {
      setUpdatingId(null);
    }
  }

  const activePledges = pledges.filter((p) => p.status === "ACTIVE");
  const totalDailyAmount = activePledges.reduce((sum, p) => sum + (p.daily_amount || 0), 0);
  const donationRunway = calculateDonationRunway(wallet?.cached_balance || 0, totalDailyAmount);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">Your causes</p>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Active pledges</h1>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && activePledges.length > 0 && (
        <Card className="border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-4">
          <p className="text-sm text-[hsl(var(--primary))] mb-1">Your generosity is funded for</p>
          <p className="text-2xl font-bold text-[hsl(var(--primary))]">
            {donationRunway} more {donationRunway === 1 ? "day" : "days"}
          </p>
          <p className="text-xs text-[hsl(var(--primary))] mt-2">
            across {activePledges.length} {activePledges.length === 1 ? "campaign" : "campaigns"}
          </p>
        </Card>
      )}

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : pledges.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            You haven&apos;t pledged to any campaigns yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pledges.map((pledge) => {
              const pledgeRunway = pledge.status === "ACTIVE" && pledge.daily_amount
                ? calculateDonationRunway(wallet?.cached_balance || 0, pledge.daily_amount)
                : 0;
              return (
                <li key={pledge.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <p className="truncate font-medium text-slate-900">
                        {pledge.campaign_title || "Campaign"}
                      </p>
                      <Badge variant={STATUS_VARIANT[pledge.status]}>
                        {pledge.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {pledge.tier_title || "Support tier"}
                    </p>
                    <div className="mt-2 flex flex-col gap-1 text-sm">
                      <p className="text-slate-700">
                        <span className="font-medium">Daily commitment:</span> {formatInr(pledge.daily_amount || 0)}/day
                      </p>
                      {pledge.status === "ACTIVE" && (
                        <p className="text-slate-700">
                          <span className="font-medium">Remaining coverage:</span> {pledgeRunway} {pledgeRunway === 1 ? "day" : "days"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    {pledge.status === "ACTIVE" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingId === pledge.id}
                          onClick={() => updateStatus(pledge.id, "PAUSED")}
                          className="w-full sm:w-auto"
                        >
                          Pause
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === pledge.id}
                          onClick={() => updateStatus(pledge.id, "CANCELLED")}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {pledge.status === "PAUSED" && (
                      <>
                        <Button
                          size="sm"
                          disabled={updatingId === pledge.id}
                          onClick={() => updateStatus(pledge.id, "ACTIVE")}
                          className="w-full bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 sm:w-auto"
                        >
                          Resume
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === pledge.id}
                          onClick={() => updateStatus(pledge.id, "CANCELLED")}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
