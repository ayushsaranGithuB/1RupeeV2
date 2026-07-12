import Link from "next/link";
import {
  formatInr,
  CAMPAIGN_CATEGORY_LABELS,
  type PublicCampaign,
} from "@/lib/public";
import { buttonVariants } from "@/components/ui/button";
import { Users } from "lucide-react";

type CampaignGridProps = {
  campaigns: PublicCampaign[];
  emptyMessage?: string;
};

export function CampaignGrid({
  campaigns,
  emptyMessage = "No active campaigns found yet. Please check back soon.",
}: CampaignGridProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 ">
      {campaigns.map((campaign) => {
        const progress =
          campaign.goal_amount && campaign.goal_amount > 0
            ? Math.min(
                100,
                Math.round(
                  (campaign.raised_amount / campaign.goal_amount) * 100,
                ),
              )
            : null;
        const heroImage =
          campaign.desktop_hero_image || campaign.mobile_hero_image;

        return (
          <article
            key={campaign.id}
            className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5"
          >
            <Link
              href={`/campaigns/${campaign.slug}`}
              className="relative block aspect-[16/9] overflow-hidden bg-slate-100"
            >
              {heroImage ? (
                <>
                  <img
                    src={heroImage}
                    aria-hidden
                    className="absolute inset-0 h-full w-full scale-110 object-cover object-center blur-2xl brightness-95"
                  />
                  <img
                    src={heroImage}
                    alt={campaign.title}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-sky-50" />
              )}
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
                Active
              </span>
              {campaign.category ? (
                <span className="absolute right-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
                  {CAMPAIGN_CATEGORY_LABELS[campaign.category]}
                </span>
              ) : null}
            </Link>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-lg font-semibold leading-snug tracking-tight text-slate-900 line-clamp-2">
                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="font-medium text-xl text-emerald-700"
                >
                  {campaign.title}
                </Link>
              </h3>
              {campaign.ngo_name ? (
                <p className="text-xs text-slate-400">by {campaign.ngo_name}</p>
              ) : null}
              {campaign.description ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
                  {campaign.description}
                </p>
              ) : null}

              {/* Progress */}
              <div className="mt-5">
                {progress !== null ? (
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900">
                    {formatInr(campaign.raised_amount)}
                    <span className="font-normal text-slate-400">
                      {campaign.goal_amount
                        ? ` of ${formatInr(campaign.goal_amount)}`
                        : " raised"}
                    </span>
                  </span>
                  {progress !== null ? (
                    <span className="font-semibold text-emerald-600">
                      {progress}%
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-emerald-700 flex items-center">
                  <Users size={12} className="mr-0.5 inline text-emerald-700" />
                  <span className="font-semibold mr-1">
                    {campaign.supporter_count.toLocaleString("en-IN")}
                  </span>
                  <span className="text-slate-600">supporters</span>
                </span>
                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "rounded-full bg-emerald-600 px-5 text-white hover:bg-emerald-700",
                  })}
                >
                  Support
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
