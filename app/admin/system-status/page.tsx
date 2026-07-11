"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminRequest, formatDate } from "@/lib/admin";
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

type JobRun = {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
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
    (run) => run.job_type === "daily-donation-processing",
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

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          Recent job runs (CRON / payouts)
        </div>
        <div className="p-2">
          {jobRunsError ? (
            <p className="px-2 py-3 text-sm text-red-700">{jobRunsError}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Finished</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobRuns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-slate-500">
                      No job runs recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium text-slate-900">
                        {run.job_type}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            run.status === "COMPLETED" &&
                              "bg-emerald-50 text-emerald-700",
                            run.status === "FAILED" && "bg-red-50 text-red-700",
                            run.status === "RUNNING" &&
                              "bg-amber-50 text-amber-700",
                          )}
                        >
                          {run.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(run.started_at)}</TableCell>
                      <TableCell>{formatDate(run.finished_at)}</TableCell>
                      <TableCell className="max-w-[240px] truncate text-red-700">
                        {run.error_message || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
