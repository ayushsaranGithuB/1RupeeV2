"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest } from "@/lib/dashboard";
import { CheckCircle } from "lucide-react";

type Pledge = {
  id: string;
  campaign_title: string;
  tier_title: string;
  daily_amount: number;
  plan_length_months: number;
  started_at: string;
};

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const pledge_id = searchParams.get("pledge_id");

  const [pledge, setPledge] = useState<Pledge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (!pledge_id) {
      setError("Missing pledge ID");
      return;
    }

    async function fetchPledge() {
      try {
        setLoading(true);
        const result = (await dashboardRequest(`/pledges?limit=100`)) as any;

        if (!result?.success) {
          setError("Failed to load pledge details");
          return;
        }

        // Find the pledge by ID
        const pledges = (result?.data || []) as any[];
        const foundPledge = pledges.find((p: any) => p.id === pledge_id);

        if (!foundPledge) {
          setError("Pledge not found");
          return;
        }

        setPledge(foundPledge);
      } catch (err) {
        console.error("Error fetching pledge:", err);
        setError("Failed to load pledge details");
      } finally {
        setLoading(false);
      }
    }

    fetchPledge();
  }, [session, pledge_id, router]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-slate-600">Loading your pledge details...</p>
      </main>
    );
  }

  if (error || !pledge) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Failed to load pledge"}
        </div>
        <Button onClick={() => router.push("/dashboard")} className="mt-4">
          Go to dashboard
        </Button>
      </main>
    );
  }

  const daysInPlan = pledge.plan_length_months * 30;
  const totalCharged = pledge.daily_amount * daysInPlan;
  const monthlyCharge = pledge.daily_amount * 30;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {/* Success banner */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Pledge successful!
        </h1>
        <p className="text-lg text-slate-600">
          Thank you for supporting {pledge.campaign_title}
        </p>
      </div>

      {/* Pledge details */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Your pledge</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Campaign</p>
              <p className="text-lg font-semibold text-slate-900">
                {pledge.campaign_title}
              </p>
            </div>

            <div className="border-t border-emerald-200 pt-4">
              <p className="text-sm text-slate-600">Tier</p>
              <p className="text-lg font-semibold text-slate-900">
                {pledge.tier_title}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {formatInrPaisa(pledge.daily_amount)} per day
              </p>
            </div>

            <div className="border-t border-emerald-200 pt-4">
              <p className="text-sm text-slate-600">Plan duration</p>
              <p className="text-lg font-semibold text-slate-900">
                {pledge.plan_length_months} months ({daysInPlan} days)
              </p>
            </div>

            <div className="border-t border-emerald-200 pt-4 bg-white rounded-lg p-4 -mx-6 px-6">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-900">
                  Total charged today:
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatInrPaisa(totalCharged)}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                Monthly recurring charge: {formatInrPaisa(monthlyCharge)}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Transaction details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Transaction ID</span>
              <span className="font-mono text-slate-900">{pledge.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date</span>
              <span className="text-slate-900">
                {new Date(pledge.started_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status</span>
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 font-medium">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">What's next?</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Your pledge is active and begins immediately</li>
            <li>✓ Monthly charge of {formatInrPaisa(monthlyCharge)} will recur automatically</li>
            <li>✓ You can manage your pledge from your dashboard</li>
            <li>✓ View impact updates from {pledge.campaign_title}</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/campaigns")}
            className="flex-1"
          >
            See more campaigns
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
