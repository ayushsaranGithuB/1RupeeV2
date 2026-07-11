import Link from "next/link";
import { getPublicStats, getTransparencyReports } from "../../lib/public";

export const dynamic = "force-dynamic";

export default async function TransparencyPage() {
  const [reports, stats] = await Promise.all([
    getTransparencyReports(),
    getPublicStats(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:px-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">
            Trust and Accountability
          </p>
          <h1 className="text-4xl text-slate-900">Transparency Reports</h1>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back home
        </Link>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">Platform Donation Volume</p>
          <p className="text-2xl font-bold text-emerald-900">
            {stats
              ? `Rs ${Math.round(stats.total_raised).toLocaleString(
                  "en-IN",
                )}`
              : "Loading"}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">Active Campaigns</p>
          <p className="text-2xl font-bold text-amber-900">
            {stats?.active_campaigns ?? "-"}
          </p>
        </div>
      </section>

      {reports.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-slate-600">
          Reports are being prepared. This page is live and connected; it will
          list the latest transparency documents as they are published.
        </section>
      ) : (
        <section className="space-y-3">
          {reports.map((report) => (
            <article
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4"
            >
              <div>
                <h2 className="text-xl text-slate-900">{report.title}</h2>
                <p className="text-sm text-slate-600">
                  {report.report_type || "REPORT"} •{" "}
                  {new Date(report.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <a
                href={report.file_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Open report
              </a>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
