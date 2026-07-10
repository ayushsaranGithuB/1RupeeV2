import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInrPaisa, getCampaignBySlug } from "../../../lib/public";
import { Star, Check, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const tiers = campaign.tiers ?? [];
  const impactHighlights = campaign.impact_highlights ?? [];

  const progress =
    campaign.goal_amount && campaign.goal_amount > 0
      ? Math.min(
          100,
          Math.round((campaign.raised_amount / campaign.goal_amount) * 100),
        )
      : null;
  const mobileHero = campaign.mobile_hero_image || campaign.desktop_hero_image;
  const desktopHero = campaign.desktop_hero_image || campaign.mobile_hero_image;

  return (
    <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-10 sm:px-10">
      <Link
        href="/campaigns"
        className="mb-6 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
      >
        Back to campaigns
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Micro-Giving, Macro Impact
        </p>
        <h1 className="mb-1 text-4xl text-slate-900">{campaign.title}</h1>
        {campaign.ngo_name ? (
          <p className="mb-4 text-sm font-medium text-slate-500">
            by {campaign.ngo_name}
          </p>
        ) : null}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50">
          {mobileHero ? (
            <img
              src={mobileHero}
              alt={`${campaign.title} mobile hero`}
              className="block aspect-[3/4] w-full object-cover md:hidden"
            />
          ) : (
            <div className="block aspect-[3/4] bg-slate-100 md:hidden" />
          )}
          {desktopHero ? (
            <img
              src={desktopHero}
              alt={`${campaign.title} desktop hero`}
              className="hidden aspect-[4/3] w-full object-cover md:block"
            />
          ) : (
            <div className="hidden aspect-[4/3] bg-slate-100 md:block" />
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div id="campaign-description" className="mb-6 md:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 pt-4">
              About this Campaign
            </p>
            <p className="mb-6 text-md text-slate-600 pb-6 max-w-4xl">
              {campaign.description ||
                "Others ask for thousands. We ask for just ₹1 a day, because real change starts with small, consistent action."}
            </p>
          </div>

          {impactHighlights.length > 0 ? (
            <div
              id="impact-highlights"
              className="mb-6 bg-amber-50 rounded-xl border border-amber-100 p-4 max-w-sm"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 pt-4">
                Impact Highlights
              </p>
              <ul className="text-sm text-slate-600 space-y-2">
                {impactHighlights.map((highlight, index) => (
                  <li key={index}>
                    <Star size={16} className="inline-block mr-1" /> {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Raised so far</p>
            <p className="text-xl font-bold text-emerald-900">
              {formatInrPaisa(campaign.raised_amount)}
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Supporters</p>
            <p className="text-xl font-bold text-amber-900">
              {campaign.supporter_count}
            </p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm text-sky-700">Goal</p>
            <p className="text-xl font-bold text-sky-900">
              {campaign.goal_amount
                ? formatInrPaisa(campaign.goal_amount)
                : "Not specified"}
            </p>
          </div>
        </div>

        {progress !== null && (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
              <span>{progress}% funded</span>
              <span>
                {formatInrPaisa(campaign.raised_amount)} of{" "}
                {formatInrPaisa(campaign.goal_amount)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3">
          <Link
            href="/auth/sign-up"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          ></Link>
          <Link
            href="/transparency"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            View transparency reports
          </Link>
        </div>
        {tiers.length > 0 ? (
          <>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 pt-12">
                Support Tiers
              </p>
              <p className="mb-6 text-md text-slate-600 pb-6 max-w-4xl">
                See how you can contribute to this campaign and make a
                difference. Choose a support tier that fits your budget and
                commitment level. Every contribution counts, and together we can
                create a lasting impact.
              </p>
            </div>
            <section className="mx-auto max-w-7xl px-6 py-20">
              <div className="grid gap-8 lg:grid-cols-3 items-center">
                {tiers.map((tier) => {
                  const dailyRupees = Math.round(tier.daily_amount / 100);
                  return (
                    <div
                      key={tier.id}
                className={`
              relative rounded-3xl border transition-all duration-300

              ${
                tier.featured
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-2xl lg:scale-105 py-10"
                  : "bg-white border-neutral-200 py-8"
              }

              px-8
            `}
              >
                {/* Icon */}

                <div
                  className={`
                mb-6 flex h-16 w-16 items-center justify-center rounded-full

                ${
                  tier.featured
                    ? "bg-white text-neutral-950"
                    : "bg-neutral-100 text-neutral-800"
                }
              `}
                >
                  <Droplets size={28} />
                </div>

                {/* Badge */}

                <span
                  className={`
                inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide

                ${
                  tier.featured
                    ? "bg-white text-neutral-900"
                    : "bg-neutral-900 text-white"
                }
              `}
                >
                  {tier.title}
                </span>

                {/* Price */}

                <div className="mt-6 flex items-start">
                  <span className="mr-1 mt-2 text-xl">₹</span>
                  <span className="text-6xl font-bold leading-none">
                    {dailyRupees.toLocaleString()}
                  </span>
                  <span className="ml-1 mt-6 text-sm text-neutral-400 tracking-wide">
                    /day
                  </span>
                </div>

                {/* Description */}

                <p
                  className={`mt-6 text-base leading-6 ${
                    tier.featured ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  {tier.description}
                </p>

                {/* Features */}

                <ul className="mt-8 space-y-5">
                  {(tier.features ?? []).map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className={`
                      mt-0.5 flex h-5 w-5 items-center justify-center rounded-full

                      ${
                        tier.featured
                          ? "bg-white text-neutral-900"
                          : "bg-neutral-900 text-white"
                      }
                    `}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>

                      <span
                        className={
                          tier.featured
                            ? "text-neutral-100"
                            : "text-neutral-700"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}

                <Button
                  className={`
                mt-10 w-full rounded-full py-3 font-medium transition

                ${
                  tier.featured
                    ? "bg-white text-neutral-950 hover:bg-neutral-200"
                    : "border border-neutral-300 hover:bg-neutral-100"
                }
              `}
                >
                  Start with ₹{dailyRupees.toLocaleString()} a day
                </Button>
              </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
