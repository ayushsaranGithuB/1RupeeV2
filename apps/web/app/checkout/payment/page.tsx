"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest } from "@/lib/dashboard";
import { AlertCircle, Loader } from "lucide-react";

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

export default function PaymentPage() {
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
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const planLengthMonths = plan_length ? parseInt(plan_length) : 6;
  const daysInPlan = planLengthMonths * 30;
  const totalPrice = tier ? tier.daily_amount * daysInPlan : 0;

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

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setPaymentError(null);

    try {
      // Simulate payment processing delay
      await new Promise((r) => setTimeout(r, 2000));

      // Mock: 90% success rate
      const success = Math.random() < 0.9;

      if (!success) {
        setPaymentError("Payment declined. Insufficient funds.");
        setSubmitting(false);
        return;
      }

      // Create pledge via API
      const pledgeResult = (await dashboardRequest("/pledges", {
        method: "POST",
        body: JSON.stringify({
          campaign_tier_id: tier_id,
          plan_length_months: planLengthMonths,
          reference_id: crypto.randomUUID(),
        }),
      })) as any;

      if (!pledgeResult?.success) {
        setPaymentError(pledgeResult?.error?.message || "Failed to create pledge");
        setSubmitting(false);
        return;
      }

      // Success - redirect to success page
      router.push(
        `/checkout/success?pledge_id=${pledgeResult.data?.pledge?.id}`
      );
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError("Payment processing failed. Please try again.");
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

        {/* Payment form */}
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Payment details</h2>

            {paymentError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{paymentError}</div>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Card number
              </span>
              <input
                type="text"
                maxLength={16}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="1234 5678 9012 3456"
                disabled={submitting}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Cardholder name
              </span>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                disabled={submitting}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Expiry</span>
                <input
                  type="text"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                    setCardExpiry(val);
                  }}
                  placeholder="MM/YY"
                  disabled={submitting}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">CVV</span>
                <input
                  type="text"
                  maxLength={3}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                  placeholder="123"
                  disabled={submitting}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400"
                  required
                />
              </label>
            </div>

            <p className="text-xs text-slate-500 rounded-lg bg-slate-50 p-3">
              💡 This is a mock payment gateway for demo purposes. Any values accepted.
            </p>
          </div>

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
              type="submit"
              disabled={submitting || !cardNumber || !cardName || !cardExpiry || !cardCvv}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatInrPaisa(totalPrice)}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
