import Link from "next/link";
import {
  getPublicStats,
  getActiveCampaigns,
  formatInrPaisa,
} from "../lib/public";
import { CampaignGrid } from "@/components/campaign-grid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, campaigns] = await Promise.all([
    getPublicStats(),
    getActiveCampaigns(),
  ]);

  return (
    <main className="bg-white">
      <section
        className="min-h-[90vh] p-8 md:p-12 shadow-xl flex items-end md:justify-start justify-center"
        style={{
          backgroundImage: "url('/home_hero_bg.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right bottom",
          backgroundSize: "cover",
        }}
      >
        <div className="max-w-3xl bg-black/20 backdrop-blur-sm p-12 rounded-xl h-min mb-5 md:mb-8">
          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-emerald-400">
            Daily Giving, Reimagined
          </p>
          <h1 className="mb-6 text-4xl leading-tighter text-white sm:text-5xl">
            Build a habit of kindness from just{" "}
            <span className="text-emerald-400">₹1 a day</span>.
          </h1>
          <p className="mb-8 max-w-xl text-md text-white">
            Pick a cause, choose a support tier, and let your daily
            micro-donations become long-term impact.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              href="/campaigns"
            >
              Explore campaigns
            </Link>
            <Link
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              href="/sign-up"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
      <aside className="grid gap-3 p-8 md:grid-cols-3 md:p-12">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">Total Raised</p>
          <p className="text-2xl font-bold text-emerald-900">
            {stats ? formatInrPaisa(stats.total_raised) : "Loading"}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">Active Campaigns</p>
          <p className="text-2xl font-bold text-amber-900">
            {stats?.active_campaigns ?? "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm text-sky-800">Active Supporters</p>
          <p className="text-2xl font-bold text-sky-900">
            {stats?.total_supporters ?? "-"}
          </p>
        </div>
      </aside>
      <section className="px-8 py-12 md:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Causes that need you
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Active campaigns
            </h2>
          </div>
          <Link
            href="/campaigns"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View all campaigns
          </Link>
        </div>
        <CampaignGrid campaigns={campaigns} />
      </section>
    </main>
  );
}
