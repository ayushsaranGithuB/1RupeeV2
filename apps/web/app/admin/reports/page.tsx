"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
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
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Transparency Reports</h1>
        <p className="text-sm text-slate-500">
          Publish transparency reports and upload annual or audit report links for operations review.
        </p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Publish Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <Input value={form.title} placeholder="Report title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input value={form.file_url} placeholder="Public file URL" onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
              <Select value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })}>
                <option value="Transparency Report">Transparency Report</option>
                <option value="Annual Report">Annual Report</option>
                <option value="Audit Report">Audit Report</option>
              </Select>
              <Button type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish Report"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Published Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading reports...</p>
            ) : reports.map((report) => (
              <a key={report.id} href={report.file_url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{report.title}</p>
                    <p className="text-sm text-slate-500">{report.report_type}</p>
                  </div>
                  <p className="text-xs text-slate-400">{formatDate(report.created_at)}</p>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}