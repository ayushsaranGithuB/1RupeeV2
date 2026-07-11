"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { adminRequest, formatDate, formatDateTime, formatDuration } from "@/lib/admin";
import { cn } from "@/lib/utils";

type HealthResponse = {
  status: "ok" | "degraded" | "unhealthy";
  timestamp: string;
  database: {
    connected: boolean;
    healthy: boolean;
    tables: { name: string; rowCount: number; hasData: boolean }[];
  };
};

type JobRunSummary = {
  run_date?: string;
  total_active_pledges?: number;
  processed?: number;
  successful_donations?: number;
  skipped_already_processed?: number;
  skipped_missing_wallet?: number;
  skipped_insufficient_balance?: number;
  failed?: number;
  total_amount_donated?: number;
};

type JobRun = {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
  summary: JobRunSummary | null;
};

type CheckState = {
  state: "checking" | "ok" | "error";
  latencyMs?: number;
  message?: string;
};

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/api/health");
  return (await res.json()) as HealthResponse;
}

function StatusCard({
  title,
  check,
  detail,
}: {
  title: string;
  check: CheckState;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {check.state === "checking" && (
          <Loader2 size={18} className="animate-spin text-slate-400" />
        )}
        {check.state === "ok" && (
          <CheckCircle2 size={18} className="text-emerald-600" />
        )}
        {check.state === "error" && (
          <XCircle size={18} className="text-red-600" />
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-lg font-semibold",
          check.state === "ok" && "text-emerald-700",
          check.state === "error" && "text-red-700",
          check.state === "checking" && "text-slate-400",
        )}
      >
        {check.state === "checking"
          ? "Checking…"
          : check.state === "ok"
            ? "Operational"
            : "Down"}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {check.state === "error"
          ? check.message
          : check.latencyMs !== undefined
            ? `${check.latencyMs}ms response time`
            : detail}
      </p>
    </div>
  );
}

export default function SystemStatusPage() {
  const [apiHealth, setApiHealth] = useState<CheckState>({ state: "checking" });
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [publicApi, setPublicApi] = useState<CheckState>({ state: "checking" });
  const [adminApi, setAdminApi] = useState<CheckState>({ state: "checking" });
  const [jobRuns, setJobRuns] = useState<JobRun[]>([]);
  const [jobRunsError, setJobRunsError] = useState<string | null>(null);

  async function runChecks() {
    setApiHealth({ state: "checking" });
    setPublicApi({ state: "checking" });
    setAdminApi({ state: "checking" });
    setJobRunsError(null);

    const started = performance.now();
    try {
      const result = await fetchHealth();
      setHealth(result);
      setApiHealth({
        state: result.status === "ok" ? "ok" : "error",
        latencyMs: Math.round(performance.now() - started),
        message: `Status: ${result.status}`,
      });
    } catch (err) {
      setApiHealth({
        state: "error",
        message: err instanceof Error ? err.message : "Health check failed",
      });
    }

    const publicStarted = performance.now();
    try {
      await adminRequest("/stats");
      setPublicApi({
        state: "ok",
        latencyMs: Math.round(performance.now() - publicStarted),
      });
    } catch (err) {
      setPublicApi({
        state: "error",
        message: err instanceof Error ? err.message : "Public API unreachable",
      });
    }

    const adminStarted = performance.now();
    try {
      const runs = await adminRequest<JobRun[]>("/admin/jobs/runs?limit=20");
      setJobRuns(runs);
      setAdminApi({
        state: "ok",
        latencyMs: Math.round(performance.now() - adminStarted),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Admin API unreachable";
      setAdminApi({ state: "error", message });
      setJobRunsError(message);
    }
  }

  useEffect(() => {
    runChecks();
  }, []);

  const latestCronRun = jobRuns.find(
    (run) => run.job_type === WALLET_JOB_TYPE,
  );
  const cronHoursSinceLastRun = latestCronRun
    ? (Date.now() - new Date(latestCronRun.started_at).getTime()) / 3_600_000
    : null;
  // Daily cron runs once every 24h at 00:00 IST; 26h gives a small buffer
  // before flagging a missed run.
  const cronStale = cronHoursSinceLastRun === null || cronHoursSinceLastRun > 26;
  const cronFailed = latestCronRun?.status === "FAILED";

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Admin / System Status
          </p>
          <h1 className="text-[30px] font-semibold">System Status</h1>
        </div>
        <Button variant="outline" onClick={runChecks}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {!jobRunsError && (cronStale || cronFailed) ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {cronFailed
                ? "Daily wallet cron last run failed"
                : "Daily wallet cron hasn't run recently"}
            </p>
            <p className="mt-1 text-xs text-amber-700">
              {latestCronRun
                ? `Last run started ${formatDate(latestCronRun.started_at)} (status: ${latestCronRun.status}).`
                : "No daily-donation-processing job run found."}{" "}
              Check the GitHub Actions "Daily Wallet Deductions" workflow.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard title="API Health" check={apiHealth} />
        <StatusCard title="Public API" check={publicApi} detail="GET /stats" />
        <StatusCard title="Admin API" check={adminApi} detail="GET /admin/jobs/runs" />
      </div>

      {health ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Database tables</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {health.database.tables.map((table) => (
              <div
                key={table.name}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <p className="text-xs text-slate-500">{table.name}</p>
                <p className="text-sm font-semibold text-slate-900">
                  {table.rowCount}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {jobRunsError ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
            Recent job runs
          </div>
          <p className="px-4 py-3 text-sm text-red-700">{jobRunsError}</p>
        </div>
      ) : (
        <>
          <JobRunSection
            title="Wallet jobs (CRON)"
            runs={jobRuns.filter(
              (run) => run.job_type === WALLET_JOB_TYPE,
            )}
            dateAsTitle
          />
          <JobRunSection
            title="Payout jobs"
            runs={jobRuns.filter(
              (run) => run.job_type !== WALLET_JOB_TYPE,
            )}
          />
        </>
      )}
    </div>
  );
}

const WALLET_JOB_TYPE = "daily-donation-processing";

function JobRunSection({
  title,
  runs,
  dateAsTitle,
}: {
  title: string;
  runs: JobRun[];
  dateAsTitle?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
        {title}
      </div>
      <div className="p-4">
        {runs.length === 0 ? (
          <p className="px-2 py-3 text-sm text-slate-500">
            No job runs recorded yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {runs.map((run) => (
              <JobRunCard key={run.id} run={run} dateAsTitle={dateAsTitle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobRunCard({
  run,
  dateAsTitle,
}: {
  run: JobRun;
  dateAsTitle?: boolean;
}) {
  const s = run.summary;
  const title = dateAsTitle
    ? formatDate(s?.run_date || run.started_at)
    : run.job_type;

  const bigStats = [
    { label: "Active pledges", value: s?.total_active_pledges },
    { label: "Processed", value: s?.processed },
    { label: "Donated", value: s?.successful_donations },
    { label: "Amount (₹)", value: s?.total_amount_donated },
  ];

  const smallStats = [
    { label: "Already done", value: s?.skipped_already_processed },
    { label: "No wallet", value: s?.skipped_missing_wallet },
    { label: "Low balance", value: s?.skipped_insufficient_balance },
    {
      label: "Failed",
      value: s?.failed,
      highlight: !!s?.failed && s.failed > 0,
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-slate-900">{title}</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            run.status === "COMPLETED" && "bg-emerald-50 text-emerald-700",
            run.status === "FAILED" && "bg-red-50 text-red-700",
            run.status === "RUNNING" && "bg-amber-50 text-amber-700",
          )}
        >
          {run.status}
        </span>
      </div>

      {s ? (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {bigStats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-xl font-semibold text-slate-900">
                {stat.value ?? "-"}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        {s ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {smallStats.map((stat) => (
              <span
                key={stat.label}
                className={cn(stat.highlight && "font-semibold text-red-700")}
              >
                {stat.label}: {stat.value ?? "-"}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}

        <Tooltip
          content={
            <div className="flex flex-col gap-0.5">
              <span>Started: {formatDateTime(run.started_at)}</span>
              <span>Finished: {formatDateTime(run.finished_at)}</span>
            </div>
          }
        >
          <span className="cursor-default underline decoration-dotted">
            {formatDuration(run.started_at, run.finished_at)}
          </span>
        </Tooltip>
      </div>

      {run.error_message ? (
        <p className="mt-2 truncate text-xs text-red-700">
          Error: {run.error_message}
        </p>
      ) : null}
    </Card>
  );
}
