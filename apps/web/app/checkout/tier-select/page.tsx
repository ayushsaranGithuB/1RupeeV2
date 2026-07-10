"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest } from "@/lib/dashboard";

const PRESET_PLANS = [
  { label: "3 months", months: 3 },
  { label: "6 months", months: 6 },
  { label: "12 months", months: 12 },
];

type Tier = {
  id: string;
  title: string;
  daily_amount: number;
  description?: string | null;
  campaign_id: string;
};

type Campaign = {
  id: string;
  title: string;
};

export default function TierSelectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const tier_id = searchParams.get("tier_id");
  const campaign_id = searchParams.get("campaign_id");
  const campaign_slug = searchParams.get("campaign_slug");

  const [tier, setTier] = useState<Tier | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [planLength, setPlanLength] = useState<number | null>(null);
  const [customLength, setCustomLength] = useState("");
  const [customInputValue, setCustomInputValue] = useState("");
  const [customInputError, setCustomInputError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<{ cached_balance: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    if (!tier_id || !campaign_id) {
      setError("Missing tier or campaign ID");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        let campaign: any = null;

        // If we have the campaign slug, use it to fetch directly with tiers
        if (campaign_slug) {
          const campaignRes = await fetch(`/api/proxy/campaigns/${campaign_slug}`);
          const campaignData = await campaignRes.json();

          if (campaignData.success && campaignData.data) {
            campaign = campaignData.data;
          }
        }

        // Fall back to fetching all campaigns if no slug
        if (!campaign) {
          const campaignsRes = await fetch(`/api/proxy/campaigns?limit=100`);
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

        // Fetch wallet balance
        const walletRes = (await dashboardRequest("/wallets")) as any;
        if (walletRes?.success) {
          setWallet(walletRes.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load campaign data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session, tier_id, campaign_id, router]);

  if (loading) {
    return <main className="mx-auto max-w-2xl px-6 py-10">Loading...</main>;
  }

  if (error || !tier || !campaign) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Failed to load campaign"}
        </div>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mt-4"
        >
          Go back
        </Button>
      </main>
    );
  }

  const selectedPlanMonths = customLength ? parseInt(customLength) : (planLength || 0);
  const daysInPlan = selectedPlanMonths * 30;
  const totalPrice = tier ? tier.daily_amount * daysInPlan : 0;
  const hasSelectedDuration = planLength !== null || customLength !== "";
  const isValidDuration = customLength === "" || (parseInt(customLength) >= 1 && parseInt(customLength) <= 12);

  function handleSaveCustomDuration() {
    if (!customInputValue) {
      setCustomInputError("Please enter a duration");
      return;
    }

    const months = parseInt(customInputValue);
    if (isNaN(months) || months < 1 || months > 12) {
      setCustomInputError("Duration must be between 1-12 months");
      return;
    }

    setCustomLength(customInputValue);
    setPlanLength(null); // Clear preset selection
    setCustomInputValue("");
    setCustomInputError(null);
  }

  function handleNext() {
    if (!hasSelectedDuration || !isValidDuration) {
      return;
    }
    const finalPlanLength = customLength ? parseInt(customLength) : planLength;
    router.push(
      `/checkout/cart?tier_id=${tier_id}&campaign_id=${campaign_id}${campaign_slug ? `&campaign_slug=${campaign_slug}` : ''}&plan_length=${finalPlanLength}`
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Choose your pledge duration</h1>
        <p className="mt-2 text-slate-600">{campaign.title}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        {/* Tier info */}
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-sm text-slate-600">Selected tier</p>
          <p className="text-lg font-semibold text-slate-900">{tier.title}</p>
          <p className="text-sm text-slate-600 mt-1">
            {formatInrPaisa(tier.daily_amount)} per day
          </p>
        </div>

        {/* Preset plan buttons */}
        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">Choose duration</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_PLANS.map((plan) => (
              <button
                key={plan.months}
                onClick={() => {
                  setPlanLength(plan.months);
                  setCustomLength("");
                }}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                  planLength === plan.months && customLength === ""
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price calculation */}
        <div className="rounded-lg bg-slate-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Daily amount:</span>
            <span className="font-medium text-slate-900">
              {formatInrPaisa(tier.daily_amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Duration:</span>
            <span className="font-medium text-slate-900">{selectedPlanMonths} months ({daysInPlan} days)</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between">
            <span className="font-semibold text-slate-900">Total amount:</span>
            <span className="text-lg font-bold text-emerald-600">
              {formatInrPaisa(totalPrice)}
            </span>
          </div>
        </div>

        {/* Wallet info */}
        {wallet && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm text-slate-600">Current wallet balance</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatInrPaisa(wallet.cached_balance)}
            </p>
            {wallet.cached_balance < totalPrice && (
              <p className="text-sm text-blue-700 mt-2">
                You need {formatInrPaisa(totalPrice - wallet.cached_balance)} more. You can add funds on the next page.
              </p>
            )}
          </div>
        )}

        {/* Custom amount toggle/form */}
        {/* Custom duration input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Or enter a custom duration (1-12 months)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="12"
              value={customInputValue}
              onChange={(e) => {
                setCustomInputValue(e.target.value);
                setCustomInputError(null);
              }}
              placeholder="e.g., 2, 5, 8"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
            />
            <button
              onClick={handleSaveCustomDuration}
              className="rounded-lg bg-slate-600 text-white px-4 py-2 font-medium hover:bg-slate-700 whitespace-nowrap disabled:opacity-50"
              disabled={!customInputValue}
            >
              Set
            </button>
          </div>
          {customInputError && (
            <p className="text-sm text-red-600">{customInputError}</p>
          )}
        </div>

        {customLength && (
          <div className="flex justify-between items-center rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-sm text-slate-600">
              Selected: <span className="font-semibold text-slate-900">{customLength} months</span>
            </p>
            <button
              onClick={() => {
                setCustomLength("");
                setCustomInputValue("");
                setPlanLength(null);
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              Clear
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasSelectedDuration || !isValidDuration}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            Review & Continue
          </Button>
        </div>
      </div>
    </main>
  );
}
