import Link from "next/link";
import {
  getActiveCampaigns,
  getPublicStats,
  formatInr,
  CAMPAIGN_CATEGORY_LABELS,
  CAMPAIGN_CATEGORY_OPTIONS,
  type CampaignCategory,
} from "../../lib/public";
import { buttonVariants } from "@/components/ui/button";
import { CampaignGrid } from "@/components/campaign-grid";
import { cn } from "@/lib/utils";

type CampaignsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function CampaignsPage({
  searchParams,
}: CampaignsPageProps) {
  const { category } = await searchParams;
  const activeCategory = CAMPAIGN_CATEGORY_OPTIONS.some(
    (option) => option.value === category,
  )
    ? (category as CampaignCategory)
    : undefined;

  const [campaigns, stats] = await Promise.all([
    getActiveCampaigns(24, activeCategory),
    getPublicStats(),
  ]);

  const heroStats = [
    {
      label: "Raised so far",
      value: stats ? formatInr(stats.total_raised) : "—",
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
      <section className="relative overflow-hidden border-b border-[hsl(var(--primary))]/20 bg-gradient-to-b from-[hsl(var(--primary))]/5 via-white to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--primary))]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:px-10 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/20 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))] shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
            Active Campaigns
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
            Make every rupee count.
            <span className="block text-[hsl(var(--primary))]">
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
                  "rounded-full px-7 shadow-lg shadow-[hsl(var(--primary-button))]/20",
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
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

        {/* Category filter */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/campaigns#campaigns"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition",
              !activeCategory
                ? "border-[hsl(var(--primary-button))] bg-[hsl(var(--primary-button))] text-[hsl(var(--primary-button-foreground))]"
                : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:text-[hsl(var(--primary-button))]",
            )}
          >
            All causes
          </Link>
          {CAMPAIGN_CATEGORY_OPTIONS.map((option) => {
            const isActive = activeCategory === option.value;
            return (
              <Link
                key={option.value}
                href={`/campaigns?category=${option.value}#campaigns`}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  isActive
                    ? "border-[hsl(var(--primary-button))] bg-[hsl(var(--primary-button))] text-[hsl(var(--primary-button-foreground))]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:text-[hsl(var(--primary-button))]",
                )}
              >
                {option.label}
              </Link>
            );
          })}
        </div>

        <CampaignGrid
          campaigns={campaigns}
          emptyMessage={
            activeCategory
              ? `No active ${CAMPAIGN_CATEGORY_LABELS[activeCategory]} campaigns right now. Try another cause.`
              : "No active campaigns found yet. Please check back soon."
          }
        />
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-20 sm:px-10">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-3xl bg-[hsl(var(--primary))] px-8 py-14 text-center shadow-xl sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[hsl(var(--primary))]/40 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[hsl(var(--primary))]/60 blur-3xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to turn ₹1 a day into real change?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/90">
              Join thousands of everyday givers building a habit of kindness —
              one rupee at a time.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className={buttonVariants({
                  size: "lg",
                  className:
                    "rounded-full bg-white px-8 text-[hsl(var(--primary-button))] hover:bg-amber-50",
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
