import { formatCurrency } from "@/lib/admin";
import { FundingProgressCard } from "./FundingProgressCard";

interface CampaignRecord {
  id: string;
  ngo_id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  mobile_hero_image: string | null;
  desktop_hero_image: string | null;
  impact_highlights: string[] | null;
  goal_amount: number | null;
  raised_amount: number;
  supporter_count: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
}

interface TierRecord {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  features: string[] | null;
  featured: boolean;
  daily_amount: number;
  monthly_equivalent: number;
  display_order: number;
  active: boolean;
}

interface DonationRecord {
  id: string;
  amount: number;
  donated_at: string;
  campaign_title: string;
  ngo_name: string;
  user_name: string;
  user_email: string;
}

interface AnalyticsTabProps {
  selectedCampaign: CampaignRecord | null;
  tiers: TierRecord[];
  recentDonations: DonationRecord[];
  completionPercent: number;
  tierSummary: { min: number; max: number };
}

export function AnalyticsTab({
  selectedCampaign,
  tiers,
  recentDonations,
  completionPercent,
  tierSummary,
}: AnalyticsTabProps) {
  if (!selectedCampaign) return null;

  return (
    <div className="space-y-6">
      <FundingProgressCard
        completionPercent={completionPercent}
        raised_amount={selectedCampaign.raised_amount}
        goal_amount={selectedCampaign.goal_amount}
        recentDonations={recentDonations}
        campaignId={selectedCampaign.id}
        showLink={false}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Daily Tier Range</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {tiers.length
              ? `${formatCurrency(tierSummary.min)} - ${formatCurrency(tierSummary.max)}`
              : "-"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Recent Donations</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {recentDonations.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Campaign Status</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {selectedCampaign.status}
          </p>
        </div>
      </section>
    </div>
  );
}
