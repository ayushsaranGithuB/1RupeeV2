"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/public";
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
  ngo_name?: string;
  logo_url?: string | null;
};

export default function TierSelectPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl px-6 py-10">Loading...</main>
      }
    >
      <TierSelectContent />
    </Suspense>
  );
}

function TierSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const tier_id = searchParams.get("tier_id");
  const campaign_id = searchParams.get("campaign_id");
  const campaign_slug = searchParams.get("campaign_slug");

  const [tier, setTier] = useState<Tier | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [planLength, setPlanLength] = useState<number | null>(6);
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

          campaign = (campaignsData.data as any[]).find(
            (c: any) => c.id === campaign_id,
          );
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

        setCampaign({
          id: campaign.id,
          title: campaign.title,
          ngo_name: campaign.ngo_name,
          logo_url: campaign.logo_url,
        } as Campaign);
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

  const selectedPlanMonths = customLength
    ? parseInt(customLength)
    : planLength || 0;
  const daysInPlan = selectedPlanMonths * 30;
  const totalPrice = tier ? tier.daily_amount * daysInPlan : 0;
  const hasSelectedDuration = planLength !== null || customLength !== "";
  const isValidDuration =
    customLength === "" ||
    (parseInt(customLength) >= 1 && parseInt(customLength) <= 12);

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
      `/checkout/cart?tier_id=${tier_id}&campaign_id=${campaign_id}${
        campaign_slug ? `&campaign_slug=${campaign_slug}` : ""
      }&plan_length=${finalPlanLength}`,
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 min-h-[calc(80vh-80px)]">
      <div className="mb-8 flex gap-3 items-center">
        {campaign.logo_url && (
          <img
            src={campaign.logo_url}
            alt={campaign.ngo_name || campaign.title}
            className="h-[60px] md:h-[100px]  object-contain"
          />
        )}
        <div>
          <h1 className="text-xl font-medium text-slate-900">
            You're pledging to
            <span className="font-bold text-[hsl(var(--primary))] ml-1">
              {campaign.title}
            </span>
          </h1>
          <p className="text-sm text-slate-500 ">
            {campaign.ngo_name && ` by ${campaign.ngo_name}`}
          </p>
          <h2 className="mt-2 text-md font-normal text-slate-500">
            Selected tier:{" "}
            <span className="font-semibold ">
              {tier?.title} @ {formatInr(tier?.daily_amount)} per day
            </span>
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        {/* Preset plan buttons */}
        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">
            Choose duration:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_PLANS.map((plan) => (
              <Button
                key={plan.months}
                onClick={() => {
                  setPlanLength(plan.months);
                  setCustomLength("");
                }}
                variant={
                  planLength === plan.months && customLength === ""
                    ? "default"
                    : "outline"
                }
                className={
                  planLength === plan.months && customLength === ""
                    ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                    : ""
                }
              >
                {plan.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Price calculation */}
        <div className="rounded-lg bg-slate-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Daily amount:</span>
            <span className="font-medium text-slate-900">
              {formatInr(tier.daily_amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Duration:</span>
            <span className="font-medium text-slate-900">
              {selectedPlanMonths} months ({daysInPlan} days)
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between">
            <span className="font-semibold text-slate-900">Total amount:</span>
            <span className="text-lg font-bold text-[hsl(var(--primary))]">
              {formatInr(totalPrice)}
            </span>
          </div>
        </div>

        {/* Wallet info */}
        {wallet && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm text-slate-600">Current wallet balance</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatInr(wallet.cached_balance)}
            </p>
            {wallet.cached_balance < totalPrice && (
              <p className="text-sm text-blue-700 mt-2">
                You need {formatInr(totalPrice - wallet.cached_balance)} more.
                You can add funds on the next page.
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-between pt-4">
          <Button variant="outline" onClick={() => router.back()} className="">
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasSelectedDuration || !isValidDuration}
            className="text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 rounded-xl h-[48px] px-12"
          >
            Review & Continue
          </Button>
        </div>
      </div>
    </main>
  );
}
