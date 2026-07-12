import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  logo_url: string | null;
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

interface OverviewTabProps {
  selectedCampaign: CampaignRecord | null;
  tiers: TierRecord[];
  recentDonations: DonationRecord[];
  completionPercent: number;
}

export function OverviewTab({
  selectedCampaign,
  tiers,
  recentDonations,
  completionPercent,
}: OverviewTabProps) {
  if (!selectedCampaign) return null;

  return (
    <div className="space-y-6">
      <FundingProgressCard
        completionPercent={completionPercent}
        raised_amount={selectedCampaign.raised_amount}
        goal_amount={selectedCampaign.goal_amount}
        recentDonations={recentDonations}
        campaignId={selectedCampaign.id}
        showLink={true}
        supporterCount={selectedCampaign.supporter_count}
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Raised</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatCurrency(selectedCampaign.raised_amount)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Goal</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatCurrency(selectedCampaign.goal_amount || 0)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Supporters</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {selectedCampaign.supporter_count}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Status</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {selectedCampaign.status}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[18px] font-semibold text-slate-900">
          Description
        </h2>
        <p className="text-sm text-slate-700">
          {selectedCampaign.description || "No description added yet."}
        </p>
        <Link
          href="?tab=settings"
          className="text-sm text-[hsl(var(--primary))] hover:underline"
        >
          Edit Description
        </Link>
      </section>

      <section className="space-y-3 border border-slate-200 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-slate-900">
            Support Tiers
          </h2>
          <Link
            href="?tab=tiers"
            className="text-sm text-[hsl(var(--primary))] hover:underline"
          >
            Edit Tiers →
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tier</TableHead>
              <TableHead>Daily</TableHead>
              <TableHead>Monthly</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-slate-500">
                  No tiers configured.
                </TableCell>
              </TableRow>
            ) : (
              tiers
                .slice()
                .sort((a, b) => a.display_order - b.display_order)
                .map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="font-medium text-slate-900">
                      {tier.title}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(tier.daily_amount)}/day
                    </TableCell>
                    <TableCell>
                      {formatCurrency(tier.monthly_equivalent)}
                    </TableCell>
                    <TableCell>{tier.active ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-3 border border-slate-200 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-slate-900">
            Recent Activity
          </h2>
          <Link
            href={`/admin/donations?campaign_id=${selectedCampaign?.id}`}
            className="text-sm text-[hsl(var(--primary))] hover:underline"
          >
            See all activities →
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentDonations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-sm text-slate-500">
                  No recent donations.
                </TableCell>
              </TableRow>
            ) : (
              recentDonations.slice(0, 5).map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium text-slate-900">
                    {donation.user_name}
                  </TableCell>
                  <TableCell>{formatCurrency(donation.amount)}</TableCell>
                  <TableCell>
                    {new Date(donation.donated_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
