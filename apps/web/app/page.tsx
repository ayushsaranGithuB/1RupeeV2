import Link from "next/link";
import { getPublicStats, formatInrPaisa } from "../lib/public";

export default async function Home() {
  const stats = await getPublicStats();

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:px-10">
      <header className="mb-16 flex flex-wrap items-center justify-between gap-4">
        <div className="rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm text-emerald-700 shadow-sm backdrop-blur">
          1Rupee Public MVP
        </div>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link
            className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-emerald-800 transition hover:bg-emerald-50"
            href="/campaigns"
          >
            Campaigns
          </Link>
          <Link
            className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-emerald-800 transition hover:bg-emerald-50"
            href="/transparency"
          >
            Transparency
          </Link>
          <Link
            className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
            href="/auth/sign-in"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <section className="grid gap-8 rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-xl backdrop-blur md:grid-cols-[2fr_1fr] md:p-12">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-emerald-700">
            Daily Giving, Reimagined
          </p>
          <h1 className="mb-6 text-4xl leading-tight text-slate-900 sm:text-5xl">
            Build a habit of kindness from just{" "}
            <span className="text-emerald-700">Rs1 a day</span>.
          </h1>
          <p className="mb-8 max-w-xl text-lg text-slate-600">
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
              href="/auth/sign-up"
            >
              Create account
            </Link>
          </div>
        </div>

        <aside className="grid gap-3">
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
      </section>
    </main>
  );
}
