"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { formatInr } from "@/lib/public";
import { dashboardRequest, calculateDonationRunway } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Confetti } from "@/components/confetti";

type Wallet = { cached_balance: number } | null;

type Pledge = {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  campaign_title?: string;
  tier_title?: string;
  daily_amount?: number;
  monthly_equivalent?: number;
  campaign_logo?: string;
  ngo_logo?: string;
};

const STATUS_VARIANT: Record<Pledge["status"], "active" | "paused" | "cancelled"> = {
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
};

export default function PledgesPage() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [wallet, setWallet] = useState<Wallet>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"pause" | "cancel" | null>(null);
  const [selectedPledgeId, setSelectedPledgeId] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

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

  async function handleConfirm() {
    if (!selectedPledgeId || !dialogType) return;

    setUpdatingId(selectedPledgeId);
    setError(null);
    setDialogOpen(false);

    try {
      const newStatus = dialogType === "pause" ? "PAUSED" : "CANCELLED";
      await dashboardRequest(`/pledges/${selectedPledgeId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await load();

      const message =
        dialogType === "pause"
          ? "Pledge paused. You can resume anytime!"
          : "Pledge cancelled. We hope to see you back soon!";
      toast.success(message);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update pledge";
      toast.error(message);
      setError(message);
    } finally {
      setUpdatingId(null);
      setSelectedPledgeId(null);
      setDialogType(null);
    }
  }

  async function handleResume(id: string) {
    setUpdatingId(id);
    setError(null);

    try {
      await dashboardRequest(`/pledges/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      await load();
      setCelebratingId(id);
      toast.success("Your support is back on! 🎉");

      setTimeout(() => setCelebratingId(null), 3500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resume pledge";
      toast.error(message);
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  }

  function openDialog(pledgeId: string, type: "pause" | "cancel") {
    setSelectedPledgeId(pledgeId);
    setDialogType(type);
    setDialogOpen(true);
  }

  const activePledges = pledges.filter((p) => p.status === "ACTIVE");
  const totalDailyAmount = activePledges.reduce((sum, p) => sum + (p.daily_amount || 0), 0);
  const donationRunway = calculateDonationRunway(wallet?.cached_balance || 0, totalDailyAmount);

  useEffect(() => {
    document.title = "1Rupee - My Causes";
  }, []);

  const selectedPledge = pledges.find((p) => p.id === selectedPledgeId);

  return (
    <div className="space-y-8 py-8">
      {celebratingId && <Confetti />}

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
            const isResumed = celebratingId === pledge.id;

            return (
              <div key={pledge.id}>
                {isResumed && (
                  <div className="mb-4 text-center animate-bounce">
                    <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                      🎉 Hooray! Welcome back to making an impact! 🎉
                    </div>
                  </div>
                )}
                <Card
                  className="border border-slate-200 bg-white p-4 sm:p-5 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex gap-4 items-start mb-2">
                      <div className="shrink-0">
                        {pledge.ngo_logo || pledge.campaign_logo ? (
                          <Image
                            src={pledge.ngo_logo || pledge.campaign_logo || ""}
                            alt={pledge.campaign_title || "Campaign"}
                            width={56}
                            height={56}
                            className="rounded-lg object-cover w-14 h-14"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {pledge.campaign_title?.charAt(0) || "C"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-md mb-1">
                          {pledge.campaign_title || "Campaign"}
                        </p>
                        <p className="text-xs text-slate-600 mb-3">
                          {pledge.tier_title || "Support tier"}
                        </p>
                        <StatusBadge variant={STATUS_VARIANT[pledge.status]}>
                          {pledge.status}
                        </StatusBadge>
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

                    <div className="pt-3 border-t border-slate-100">
                      {pledge.status === "ACTIVE" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingId === pledge.id}
                            onClick={() => openDialog(pledge.id, "pause")}
                            className="flex-1 text-sm"
                          >
                            Pause
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updatingId === pledge.id}
                            onClick={() => openDialog(pledge.id, "cancel")}
                            className="flex-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {pledge.status === "PAUSED" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={updatingId === pledge.id}
                            onClick={() => handleResume(pledge.id)}
                            className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                          >
                            ✨ Resume Supporting ✨
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updatingId === pledge.id}
                            onClick={() => openDialog(pledge.id, "cancel")}
                            className="flex-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          dialogType === "pause"
            ? "Pause your support?"
            : "Cancel your pledge?"
        }
        description=""
        onConfirm={handleConfirm}
        confirmText={dialogType === "pause" ? "Yes, pause" : "Yes, cancel"}
        cancelText="Keep supporting"
        isDangerous={dialogType === "cancel"}
      >
        <div className="space-y-3 text-sm text-slate-700">
          <p className="font-medium">
            We&apos;re sorry to see you go, but we understand.
          </p>
          {dialogType === "pause" ? (
            <div className="space-y-2">
              <p>
                Your pledge to <strong>{selectedPledge?.campaign_title}</strong> will be paused.
              </p>
              <p>
                You can resume your support anytime, and your wallet will continue to fund this cause when you do.
              </p>
              <p className="text-xs text-slate-500 pt-2">
                Your current wallet balance will be preserved.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                Cancelling your pledge to <strong>{selectedPledge?.campaign_title}</strong> means you&apos;ll no longer contribute to this campaign.
              </p>
              <p>
                But don&apos;t worry—you can always pledge to this or other causes again in the future.
              </p>
              <p className="text-xs text-slate-500 pt-2">
                This action cannot be undone.
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
