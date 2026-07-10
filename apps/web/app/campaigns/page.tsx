import Link from "next/link";
import { getActiveCampaigns, formatInrPaisa } from "../../lib/public";

export default async function CampaignsPage() {
  const campaigns = await getActiveCampaigns(24);

  return (
    <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-10 sm:px-10">
      <div className="mb-8 flex flex-col items-start gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">
            Project Categories
          </p>
          <h1 className="text-4xl text-slate-900">
            Join the Movement - Make Every Rupee Count!
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
            Not just crowdfunding. It&apos;s micro-giving. Start with just ₹1 a
            day and support real impact across education, healthcare, women and
            child welfare, eco and animal welfare, disaster relief, livelihoods,
            and creative projects.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back home
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-600">
          No active campaigns found yet. Please check back soon.
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-5">
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
            const mobileHero =
              campaign.mobile_hero_image || campaign.hero_image;
            const tabletHero =
              campaign.tablet_hero_image ||
              campaign.desktop_hero_image ||
              campaign.hero_image ||
              mobileHero;
            const desktopHero =
              campaign.desktop_hero_image ||
              campaign.tablet_hero_image ||
              campaign.hero_image ||
              mobileHero;

            return (
              <article
                key={campaign.id}
                className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50">
                  {mobileHero ? (
                    <img
                      src={mobileHero}
                      alt={`${campaign.title} mobile hero`}
                      className="block aspect-[3/4] w-full object-cover md:hidden"
                    />
                  ) : (
                    <div className="block aspect-[3/4] bg-slate-100 md:hidden" />
                  )}
                  {tabletHero ? (
                    <img
                      src={tabletHero}
                      alt={`${campaign.title} tablet hero`}
                      className="hidden aspect-[5/3] w-full object-cover md:block lg:hidden"
                    />
                  ) : (
                    <div className="hidden aspect-[5/3] bg-slate-100 md:block lg:hidden" />
                  )}
                  {desktopHero ? (
                    <img
                      src={desktopHero}
                      alt={`${campaign.title} desktop hero`}
                      className="hidden aspect-[9/3] w-full object-cover lg:block"
                    />
                  ) : (
                    <div className="hidden aspect-[9/3] bg-slate-100 lg:block" />
                  )}
                </div>
                <h2 className="mb-2 text-2xl leading-tight text-slate-900">
                  {campaign.title}
                </h2>
                <p className="mb-4 line-clamp-3 text-sm text-slate-600">
                  {campaign.short_description ||
                    campaign.description ||
                    "Small contributions, big change. This campaign will be updated with stories, milestones, and impact snapshots soon."}
                </p>
                <p className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                  A daily habit. Endless possibilities. Choose one campaign or
                  many and make every rupee count.
                </p>
                <div className="mb-4 flex items-center justify-between text-sm text-slate-700">
                  <span>Raised: {formatInrPaisa(campaign.raised_amount)}</span>
                  <span>{campaign.supporter_count} supporters</span>
                </div>
                {progress !== null && (
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                      <span>{progress}% funded</span>
                      <span>Goal {formatInrPaisa(campaign.goal_amount)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  View campaign
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
