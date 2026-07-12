"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/public";
import { dashboardRequest } from "@/lib/dashboard";

type Tier = {
  id: string;
  title: string;
  daily_amount: number;
  campaign_id: string;
};

type Campaign = {
  id: string;
  title: string;
};

type Wallet = {
  id: string;
  cached_balance: number;
};

const QUICK_TOPUP_AMOUNTS = [100, 500, 1000]; // In rupees

export default function CartPage() {
  return (
    <Suspense
      fallback={<main className="mx-auto max-w-2xl px-6 py-10">Loading...</main>}
    >
      <CartContent />
    </Suspense>
  );
}

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const tier_id = searchParams.get("tier_id");
  const campaign_id = searchParams.get("campaign_id");
  const campaign_slug = searchParams.get("campaign_slug");
  const plan_length = searchParams.get("plan_length");

  const [tier, setTier] = useState<Tier | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);

  const planLengthMonths = plan_length ? parseInt(plan_length) : 6;
  const daysInPlan = planLengthMonths * 30;
  const totalPrice = tier ? tier.daily_amount * daysInPlan : 0;
  const balanceAfter = wallet ? wallet.cached_balance - totalPrice : 0;
  const shortfall = Math.max(0, totalPrice - (wallet?.cached_balance || 0));

  useEffect(() => {
    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    if (!tier_id || !campaign_id || !plan_length) {
      setError("Missing required parameters");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        let campaign: any = null;

        // If we have the campaign slug, use it to fetch directly with tiers
        if (campaign_slug) {
          const campaignRes = await fetch(`/api/campaigns/${campaign_slug}`);
          const campaignData = await campaignRes.json();

          if (campaignData.success && campaignData.data) {
            campaign = campaignData.data;
          }
        }

        // Fall back to fetching all campaigns if no slug
        if (!campaign) {
          const campaignsRes = await fetch(`/api/campaigns?limit=100`);
          const campaignsData = await campaignsRes.json();

          if (!campaignsData.success || !campaignsData.data) {
            setError("Failed to load campaigns");
            return;
          }

          campaign = (campaignsData.data as any[]).find((c: any) => c.id === campaign_id);
        }

        if (!campaign) {
          setError("Campaign not found");
          return;
        }

        const tiers = (campaign.tiers || []) as Tier[];
        const selectedTier = tiers.find((t: Tier) => t.id === tier_id);

        if (!selectedTier) {
          setError("Tier not found");
          return;
        }

        setCampaign({ id: campaign.id, title: campaign.title } as Campaign);
        setTier(selectedTier);

        // Fetch wallet balance (non-blocking - show error but allow proceeding)
        try {
          const walletData = await dashboardRequest<Wallet>("/wallets");
          setWallet(walletData);
        } catch (walletErr) {
          console.error("Error fetching wallet:", walletErr);
          // Don't fail the entire page load for wallet fetch - user can still top up
        }
      } catch (err) {
        console.error("Error fetching campaign/tier:", err);
        if (err instanceof Error) {
          if (err.message.includes("Campaign")) {
            setError("Campaign not found");
          } else if (err.message.includes("Tier")) {
            setError("Tier not found");
          } else {
            setError("Failed to load campaign details");
          }
        } else {
          setError("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session, tier_id, campaign_id, plan_length, router]);

  async function handleQuickTopup(amount: number) {
    await handleTopup(amount);
  }

  async function handleCustomTopup() {
    if (!topupAmount || isNaN(parseInt(topupAmount))) {
      setTopupError("Please enter a valid amount");
      return;
    }
    await handleTopup(parseInt(topupAmount));
  }

  async function handleTopup(amount: number) {
    if (!wallet) return;

    setTopupLoading(true);
    setTopupError(null);

    try {
      // Mock payment - simulate with delay
      await new Promise((r) => setTimeout(r, 2000));

      // Call topup endpoint
      const result = (await dashboardRequest("/wallets/topup", {
        method: "POST",
        body: JSON.stringify({
          amount,
          reference_id: crypto.randomUUID(),
        }),
      })) as any;

      if (!result?.success) {
        setTopupError(result?.error?.message || "Top-up failed");
        return;
      }

      // Refresh wallet and reset form
      const walletRes = (await dashboardRequest("/wallets")) as any;
      if (walletRes?.success) {
        setWallet(walletRes.data);
        setTopupAmount("");
      }
    } catch (err) {
      console.error("Top-up error:", err);
      setTopupError("Failed to process top-up");
    } finally {
      setTopupLoading(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-2xl px-6 py-10">Loading...</main>;
  }

  if (error || !tier || !campaign) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Failed to load cart"}
        </div>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          Go back
        </Button>
      </main>
    );
  }

  const hasSufficientBalance = wallet ? wallet.cached_balance >= totalPrice : false;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Review your pledge</h1>
        <p className="mt-2 text-slate-600">Confirm the details below</p>
      </div>

      <div className="space-y-6">
        {/* Order summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-600">Campaign</p>
            <p className="text-lg font-semibold text-slate-900">{campaign.title}</p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">Tier</p>
            <p className="text-lg font-semibold text-slate-900">{tier.title}</p>
            <p className="text-sm text-slate-600 mt-1">
              {formatInr(tier.daily_amount)} per day
            </p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">Duration</p>
            <p className="text-lg font-semibold text-slate-900">
              {planLengthMonths} months ({daysInPlan} days)
            </p>
          </div>

          <div className="border-t border-slate-200 pt-4 bg-slate-50 -mx-6 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">Total to charge today:</span>
              <span className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatInr(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Your wallet</h2>

          {!wallet ? (
            <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-4">
              <p className="text-sm text-yellow-700">Loading wallet balance...</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                <p className="text-sm text-slate-600">Current balance</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatInr(wallet.cached_balance)}
                </p>
              </div>

              {hasSufficientBalance ? (
                <div className="rounded-lg bg-[hsl(var(--primary))]/5 border border-[hsl(var(--primary))]/20 p-4">
                  <p className="text-sm text-slate-600">Balance after pledge</p>
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                    {formatInr(balanceAfter)}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                  <p className="text-sm text-red-700">Insufficient balance</p>
                  <p className="text-lg font-semibold text-red-900 mt-1">
                    You need {formatInr(shortfall)} more
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Top-up section (if insufficient) */}
        {!hasSufficientBalance && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Add funds to wallet</h2>

            {topupError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {topupError}
              </div>
            )}

            {/* Quick topup buttons */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Quick add</p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_TOPUP_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => handleQuickTopup(amount)}
                    disabled={topupLoading}
                    variant="outline"
                    size="sm"
                  >
                    +₹{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom amount (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Enter amount in rupees"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
                  disabled={topupLoading}
                />
                <Button
                  onClick={handleCustomTopup}
                  disabled={topupLoading || !topupAmount}
                  className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                >
                  {topupLoading ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={() =>
              router.push(
                `/checkout/payment?tier_id=${tier_id}&campaign_id=${campaign_id}${campaign_slug ? `&campaign_slug=${campaign_slug}` : ''}&plan_length=${plan_length}`
              )
            }
            disabled={!hasSufficientBalance}
            className="flex-1"
          >
            {hasSufficientBalance ? "Proceed to Payment" : "Add Funds to Continue"}
          </Button>
        </div>
      </div>
    </main>
  );
}
