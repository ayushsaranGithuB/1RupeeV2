import Link from "next/link";
import {
  getActiveCampaigns,
  getPublicStats,
  formatInrPaisa,
  CAMPAIGN_CATEGORY_LABELS,
} from "../../lib/public";
import { buttonVariants } from "@/components/ui/button";

export default async function CampaignsPage() {
  const [campaigns, stats] = await Promise.all([
    getActiveCampaigns(24),
    getPublicStats(),
  ]);

  const heroStats = [
    {
      label: "Raised so far",
      value: stats ? formatInrPaisa(stats.total_raised) : "—",
    },
    {
      label: "Active supporters",
      value: stats ? stats.total_supporters.toLocaleString("en-IN") : "—",
    },
    {
      label: "Live campaigns",
      value: stats ? stats.active_campaigns.toLocaleString("en-IN") : "—",
    },
  ];

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:px-10 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active Campaigns
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
            Make every rupee count.
            <span className="block text-emerald-600">
              Change lives from ₹1 a day.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Not just crowdfunding — it&apos;s micro-giving. Back real impact
            across education, healthcare, women &amp; child welfare, the
            environment, disaster relief, and more.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#campaigns"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className:
                  "rounded-full bg-emerald-600 px-7 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700",
              })}
            >
              Explore campaigns
            </a>
            <Link
              href="/"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "rounded-full px-7",
              })}
            >
              Back home
            </Link>
          </div>

          {/* Impact stat strip */}
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-6 py-5 shadow-sm backdrop-blur"
              >
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Campaign grid */}
      <section
        id="campaigns"
        className="mx-auto max-w-[1400px] scroll-mt-24 px-6 py-16 sm:px-10 sm:py-20"
      >
        <div className="mb-10 flex flex-col gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Causes that need you
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Pick a cause. Start your daily habit of giving.
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
            Every contribution — however small — compounds into lasting change
            for the people who need it most.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
            No active campaigns found yet. Please check back soon.
          </div>
        ) : (
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
                    className="relative block overflow-hidden"
                  >
                    {heroImage ? (
                      <img
                        src={heroImage}
                        alt={campaign.title}
                        className=" w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className=" w-full bg-gradient-to-br from-emerald-50 via-white to-sky-50" />
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
                      <p className="text-xs text-slate-400">
                        by {campaign.ngo_name}
                      </p>
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
                          {formatInrPaisa(campaign.raised_amount)}
                          <span className="font-normal text-slate-400">
                            {campaign.goal_amount
                              ? ` of ${formatInrPaisa(campaign.goal_amount)}`
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
                      <span className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {campaign.supporter_count.toLocaleString("en-IN")}
                        </span>{" "}
                        supporters
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
        )}
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-20 sm:px-10">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-3xl bg-emerald-700 px-8 py-14 text-center shadow-xl sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/40 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-emerald-900/40 blur-3xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to turn ₹1 a day into real change?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-emerald-50/90">
              Join thousands of everyday givers building a habit of kindness —
              one rupee at a time.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/sign-up"
                className={buttonVariants({
                  size: "lg",
                  className:
                    "rounded-full bg-white px-8 text-emerald-700 hover:bg-emerald-50",
                })}
              >
                Create your account
              </Link>
              <a
                href="#campaigns"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "rounded-full border-white/40 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white",
                })}
              >
                Browse campaigns
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
