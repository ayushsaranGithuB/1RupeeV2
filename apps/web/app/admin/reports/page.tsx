"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminRequest, formatDate } from "@/lib/admin";

interface ReportRecord {
  id: string;
  title: string;
  file_url: string;
  report_type: string;
  created_at: string;
}

const emptyForm = {
  title: "",
  file_url: "",
  report_type: "Transparency Report",
};

type DrawerMode = "create" | "detail" | null;

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminRequest<ReportRecord[]>("/admin/reports");
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminRequest("/admin/reports", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      setDrawerMode(null);
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report");
    } finally {
      setSaving(false);
    }
  }

  const selectedReport =
    reports.find((report) => report.id === selectedReportId) || null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-500">Admin / Reports</p>
        <h1 className="text-[30px] font-semibold">Transparency Reports</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setForm(emptyForm);
              setDrawerMode("create");
            }}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            Publish Report
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          Published Reports
        </div>
        <div className="p-2">
          {loading ? (
            <p className="px-2 py-3 text-sm text-slate-500">
              Loading reports...
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-slate-500">
                      No reports published yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setDrawerMode("detail");
                      }}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {report.title}
                      </TableCell>
                      <TableCell>{report.report_type}</TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <a
                          href={report.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline"
                        >
                          Open
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {drawerMode ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={() => setDrawerMode(null)}
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[520px] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Report Drawer</p>
                <h2 className="text-[22px] font-semibold text-slate-900">
                  {drawerMode === "create"
                    ? "Publish Report"
                    : selectedReport?.title || "Report Details"}
                </h2>
              </div>
              <Button variant="outline" onClick={() => setDrawerMode(null)}>
                Close
              </Button>
            </div>

            {drawerMode === "create" ? (
              <form className="grid gap-3" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Title</p>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Report title"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">File URL</p>
                  <Input
                    value={form.file_url}
                    onChange={(e) =>
                      setForm({ ...form, file_url: e.target.value })
                    }
                    placeholder="Public file URL"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Report Type</p>
                  <Select
                    value={form.report_type}
                    onChange={(e) =>
                      setForm({ ...form, report_type: e.target.value })
                    }
                  >
                    <option value="Transparency Report">
                      Transparency Report
                    </option>
                    <option value="Annual Report">Annual Report</option>
                    <option value="Audit Report">Audit Report</option>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    {saving ? "Publishing..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDrawerMode(null)}
                  >
                    Close
                  </Button>
                </div>
              </form>
            ) : selectedReport ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">Title</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedReport.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="text-sm text-slate-700">
                    {selectedReport.report_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Published</p>
                  <p className="text-sm text-slate-700">
                    {formatDate(selectedReport.created_at)}
                  </p>
                </div>
                <a
                  href={selectedReport.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Open Report
                </a>
              </div>
            ) : null}
          </aside>
        </>
      ) : null}
    </div>
  );
}
