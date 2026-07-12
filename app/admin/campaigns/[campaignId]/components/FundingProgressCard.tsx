import Link from "next/link";
import { formatCurrency } from "@/lib/admin";

interface DonationRecord {
  id: string;
  amount: number;
  donated_at: string;
  campaign_title: string;
  ngo_name: string;
  user_name: string;
  user_email: string;
}

interface FundingProgressCardProps {
  completionPercent: number;
  raised_amount: number;
  goal_amount: number | null;
  recentDonations: DonationRecord[];
  campaignId?: string;
  showLink?: boolean;
  supporterCount?: number;
}

export function FundingProgressCard({
  completionPercent,
  raised_amount,
  goal_amount,
  recentDonations,
  campaignId,
  showLink = true,
  supporterCount,
}: FundingProgressCardProps) {
  const getSevenDayDonations = () => {
    return recentDonations
      .filter((d) => {
        const donatedDate = new Date(d.donated_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return donatedDate >= sevenDaysAgo;
      })
      .reduce((sum, d) => sum + d.amount, 0);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-start justify-between">
        <h2 className="text-[18px] font-semibold text-slate-900">
          Funding Progress
        </h2>
        {showLink && (
          <Link
            href={`?tab=analytics`}
            className="text-sm text-[hsl(var(--primary))] hover:underline"
          >
            View details →
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Circular Progress */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 120 120"
            >
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeDasharray={`${
                  (completionPercent / 100) * Math.PI * 100
                } ${Math.PI * 100}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-slate-900">
                {completionPercent}%
              </p>
              <p className="text-xs text-slate-500">of goal</p>
            </div>
          </div>
        </div>

        {/* Amount and Progress */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-10">
              {formatCurrency(raised_amount)}
            </p>
            <p className="text-sm text-slate-600">
              raised of {formatCurrency(goal_amount || 0)} goal, from{" "}
              <span className="font-semibold text-slate-900">
                {supporterCount !== undefined ? supporterCount.toLocaleString() : "0"}
              </span>{" "}
              supporters
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex gap-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="bg-[hsl(var(--primary))] rounded-full"
                style={{ width: `${completionPercent}%` }}
              />
              <div className="flex-1 bg-slate-200 rounded-full" />
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))]" />
                <span className="text-slate-600">Raised</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(raised_amount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-slate-600">Remaining</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(
                    Math.max(0, (goal_amount || 0) - raised_amount),
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
