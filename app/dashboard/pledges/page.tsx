"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

  useEffect(() => {
    document.title = "1Rupee - My Causes";
  }, []);

  return (
    <div className="space-y-8 py-8">
      {/* Heading */}
      <div className="text-center pb-4">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-2"
          style={{ color: "#4077A4" }}
        >
          Your Causes 📍
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Keep track of all the campaigns you're supporting
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && activePledges.length > 0 && (
        <div className="text-center py-6 px-4">
          <p className="text-sm font-bold mb-2" style={{ color: "#4077A4" }}>
            Your generosity is funded for:
          </p>
          <div className="space-y-2">
            <p
              className="font-kalam text-3xl sm:text-4xl font-bold"
              style={{ color: "#4077A4" }}
            >
              {donationRunway} more {donationRunway === 1 ? "day" : "days"}
            </p>
            <p className="text-xs text-slate-500">
              across {activePledges.length} {activePledges.length === 1 ? "campaign" : "campaigns"}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5 w-full max-w-md mx-auto">
        {loading ? (
          <p className="text-sm text-slate-500 text-center py-8">Loading…</p>
        ) : pledges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">
              You haven&apos;t pledged to any campaigns yet.
            </p>
            <p className="text-xs text-slate-500">
              Head back to the dashboard to explore and support causes you care about.
            </p>
          </div>
        ) : (
          pledges.map((pledge) => {
            const pledgeRunway = pledge.status === "ACTIVE" && pledge.daily_amount
              ? calculateDonationRunway(wallet?.cached_balance || 0, pledge.daily_amount)
              : 0;
            return (
              <Card
                key={pledge.id}
                className="border border-slate-200 bg-white p-4 sm:p-5 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 text-md mb-1">
                        {pledge.campaign_title || "Campaign"}
                      </p>
                      <p className="text-xs text-slate-600 mb-3">
                        {pledge.tier_title || "Support tier"}
                      </p>
                      <Badge variant={STATUS_VARIANT[pledge.status]} className="text-xs">
                        {pledge.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Daily commitment:</span>
                      <span className="font-semibold text-slate-900">
                        {formatInr(pledge.daily_amount || 0)}/day
                      </span>
                    </div>
                    {pledge.status === "ACTIVE" && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Coverage remaining:</span>
                        <span className="font-semibold text-slate-900">
                          {pledgeRunway} {pledgeRunway === 1 ? "day" : "days"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                    {pledge.status === "ACTIVE" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingId === pledge.id}
                          onClick={() => updateStatus(pledge.id, "PAUSED")}
                          className="w-full text-sm"
                        >
                          Pause
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === pledge.id}
                          onClick={() => updateStatus(pledge.id, "CANCELLED")}
                          className="w-full text-sm"
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
                          className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Resume
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === pledge.id}
                          onClick={() => updateStatus(pledge.id, "CANCELLED")}
                          className="w-full text-sm"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
