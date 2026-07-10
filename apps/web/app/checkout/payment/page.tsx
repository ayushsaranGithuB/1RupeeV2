"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest } from "@/lib/dashboard";
import { Loader } from "lucide-react";

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

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const tier_id = searchParams.get("tier_id");
  const campaign_id = searchParams.get("campaign_id");
  const campaign_slug = searchParams.get("campaign_slug");
  const plan_length = searchParams.get("plan_length");

  const [tier, setTier] = useState<Tier | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const planLengthMonths = plan_length ? parseInt(plan_length) : 6;
  const daysInPlan = planLengthMonths * 30;
  const totalPrice = tier ? tier.daily_amount * daysInPlan : 0;

  // Try to fetch wallet balance to verify it exists
  useEffect(() => {
    if (session?.user) {
      dashboardRequest("/wallets")
        .then((wallet: any) => {
          console.log("Wallet available:", wallet);
        })
        .catch((err: any) => {
          console.warn("Could not fetch wallet:", err.message);
        });
    }
  }, [session?.user]);

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
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session, tier_id, campaign_id, plan_length, router]);

  async function handleProceedToPayment() {
    setSubmitting(true);
    console.log("Attempting to create pledge with:", {
      campaign_tier_id: tier_id,
      plan_length_months: planLengthMonths,
    });

    try {
      // Create pledge via API before redirecting to payment gateway
      const pledgeResult = await dashboardRequest("/pledges", {
        method: "POST",
        body: JSON.stringify({
          campaign_tier_id: tier_id,
          plan_length_months: planLengthMonths,
          reference_id: crypto.randomUUID(),
        }),
      });

      console.log("Pledge created successfully:", pledgeResult);

      // In production: redirect to Razorpay with order ID
      // For now: redirect to success page
      router.push(
        `/checkout/success?pledge_id=${(pledgeResult as any).pledge?.id}`
      );
    } catch (err) {
      console.error("Pledge creation error:", err);
      let errorMessage = "Failed to create pledge";

      if (err instanceof Error) {
        errorMessage = err.message;
        // Extract API error message if available (format: "StatusCode: message")
        if (errorMessage.includes("Insufficient wallet balance")) {
          errorMessage = "Insufficient wallet balance. Please add funds and try again.";
        } else if (errorMessage.includes("already have an active pledge")) {
          errorMessage = "You already have an active pledge to this tier.";
        } else if (errorMessage.includes("not found")) {
          errorMessage = "Campaign or tier not found. Please try again.";
        }
      }

      setError(errorMessage);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-2xl px-6 py-10">Loading...</main>;
  }

  if (error || !tier || !campaign) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Failed to load payment"}
        </div>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          Go back
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Complete payment</h1>
        <p className="mt-2 text-slate-600">
          Mock payment gateway (for demo purposes)
        </p>
      </div>

      <div className="space-y-6">
        {/* Order summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Order summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">{campaign.title}</span>
              <span className="font-medium text-slate-900">{tier.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">
                {planLengthMonths} months ({daysInPlan} days)
              </span>
              <span className="font-medium text-slate-900">
                {formatInrPaisa(tier.daily_amount)}/day
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="font-semibold text-slate-900">Total to charge:</span>
              <span className="text-xl font-bold text-emerald-600">
                {formatInrPaisa(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment gateway notice */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Ready to pay</h2>
          <p className="text-sm text-slate-600">
            You'll be redirected to Razorpay to securely complete your payment.
          </p>
          <p className="text-lg font-semibold text-emerald-600">
            Amount to pay: {formatInrPaisa(totalPrice)}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-semibold text-red-900 mb-2">Payment Error</p>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            {error.includes("Insufficient") && (
              <p className="text-xs text-red-600">
                💡 Go back to add more funds to your wallet and try again.
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleProceedToPayment}
            disabled={submitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={<main className="mx-auto max-w-2xl px-6 py-10">Loading...</main>}
    >
      <PaymentContent />
    </Suspense>
  );
}
