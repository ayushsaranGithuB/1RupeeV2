import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/admin";
import { adminRequest } from "@/lib/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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

interface SupporterRecord {
  user_id: string;
  user_name: string;
  tier_title: string;
  total_contribution: number;
  donation_count: number;
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
  const [supporters, setSupporters] = useState<SupporterRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadSupporters() {
      if (!selectedCampaign) return;
      setLoading(true);
      try {
        const data = await adminRequest<SupporterRecord[]>(
          `/admin/campaigns/${selectedCampaign.id}/supporters`
        );
        setSupporters(data);
      } catch (err) {
        console.error("Failed to load supporters:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSupporters();
  }, [selectedCampaign]);

  const totalPages = Math.ceil(supporters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSupporters = supporters.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

      <section className="space-y-3 border border-slate-200 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-slate-900">
            Supporters
          </h2>
          <p className="text-sm text-slate-600">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supporter</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Donations</TableHead>
              <TableHead className="text-right">Total Contribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSupporters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-slate-500">
                  No supporters yet.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSupporters.map((supporter) => (
                <TableRow key={supporter.user_id}>
                  <TableCell className="font-medium text-slate-900">
                    {supporter.user_name}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {supporter.tier_title}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {supporter.donation_count}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    {formatCurrency(supporter.total_contribution)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, supporters.length)} of{" "}
              {supporters.length} supporters
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
