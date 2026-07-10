import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInrPaisa, getCampaignBySlug } from "../../../lib/public";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const progress =
    campaign.goal_amount && campaign.goal_amount > 0
      ? Math.min(
          100,
          Math.round((campaign.raised_amount / campaign.goal_amount) * 100),
        )
      : null;
  const mobileHero = campaign.mobile_hero_image || campaign.hero_image;
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
        <h1 className="mb-4 text-4xl text-slate-900">{campaign.title}</h1>
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
        <p className="mb-6 text-lg text-slate-600">
          {campaign.description ||
            campaign.short_description ||
            "Others ask for thousands. We ask for just ₹1 a day, because real change starts with small, consistent action."}
        </p>
        <p className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
          See the change with complete transparency through stories, photos, and
          milestones from the projects you support.
        </p>

        <div className="mb-6 grid grid-cols-1 gap-4">
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

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/sign-up"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Start with ₹1 a day
          </Link>
          <Link
            href="/transparency"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            View transparency reports
          </Link>
        </div>
      </section>
    </main>
  );
}
