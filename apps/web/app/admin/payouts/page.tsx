"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { adminRequest, formatCurrency, formatDate } from "@/lib/admin";

interface NgoOption {
  id: string;
  name: string;
}

interface PayoutRecord {
  id: string;
  ngo_id: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  receipt_url?: string | null;
}

interface PayoutDetail extends PayoutRecord {
  line_items: Array<{
    campaign_title: string;
    total_amount: number;
    donation_count: number;
  }>;
}

const initialForm = {
  ngo_id: "",
  start_date: new Date().toISOString(),
  end_date: new Date().toISOString(),
  receipt_url: "",
};

export default function PayoutManagement() {
  const [ngos, setNgos] = useState<NgoOption[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutDetail | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [ngoData, payoutData] = await Promise.all([
        adminRequest<NgoOption[]>("/admin/ngos"),
        adminRequest<PayoutRecord[]>("/admin/payouts"),
      ]);
      setNgos(ngoData);
      setPayouts(payoutData);
      if (!form.ngo_id && ngoData[0]) {
        setForm((current) => ({ ...current, ngo_id: ngoData[0].id }));
      }
      if (!selectedPayoutId && payoutData[0]) {
        setSelectedPayoutId(payoutData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  }

  async function loadPayoutDetails(id: string) {
    try {
      const data = await adminRequest<PayoutDetail>(`/admin/payouts/${id}`);
      setSelectedPayout(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payout details");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPayoutId) {
      loadPayoutDetails(selectedPayoutId);
    }
  }, [selectedPayoutId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminRequest("/admin/payouts", {
        method: "POST",
        body: JSON.stringify(form),
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate payout");
    } finally {
      setSaving(false);
    }
  }

  async function approvePayout() {
    if (!selectedPayout) return;
    setSaving(true);
    setError(null);
    try {
      await adminRequest(`/admin/payouts/${selectedPayout.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ payout_id: selectedPayout.id, notes: "Reviewed in admin console" }),
      });
      await loadData();
      await loadPayoutDetails(selectedPayout.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve payout");
    } finally {
      setSaving(false);
    }
  }

  async function processPayout() {
    if (!selectedPayout) return;
    setSaving(true);
    setError(null);
    try {
      await adminRequest(`/admin/payouts/${selectedPayout.id}/process`, {
        method: "POST",
        body: JSON.stringify({
          payout_id: selectedPayout.id,
          razorpay_transfer_id: `manual-${selectedPayout.id}`,
          receipt_url: form.receipt_url || undefined,
        }),
      });
      await loadData();
      await loadPayoutDetails(selectedPayout.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payout");
    } finally {
      setSaving(false);
    }
  }

  function downloadHistory() {
    const header = ["payout_id", "ngo_id", "status", "period_start", "period_end", "total_amount"];
    const rows = payouts.map((payout) => [
      payout.id,
      payout.ngo_id,
      payout.status,
      payout.period_start,
      payout.period_end,
      String(payout.total_amount),
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "payout-history.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Payout Workflow</h1>
          <p className="text-sm text-slate-500">
            Generate payout reports, review totals, upload receipts, and download payout history.
          </p>
        </div>
        <Button variant="outline" onClick={downloadHistory}>Download History</Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Generate Monthly Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handleCreate}>
              <Select value={form.ngo_id} onChange={(e) => setForm({ ...form, ngo_id: e.target.value })}>
                {ngos.map((ngo) => (
                  <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
                ))}
              </Select>
              <Input type="datetime-local" value={form.start_date.slice(0, 16)} onChange={(e) => setForm({ ...form, start_date: new Date(e.target.value).toISOString() })} />
              <Input type="datetime-local" value={form.end_date.slice(0, 16)} onChange={(e) => setForm({ ...form, end_date: new Date(e.target.value).toISOString() })} />
              <Input value={form.receipt_url} placeholder="Receipt URL for completion" onChange={(e) => setForm({ ...form, receipt_url: e.target.value })} />
              <Button type="submit" disabled={saving || !ngos.length}>{saving ? "Generating..." : "Generate Payout"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {loading ? (
                <p className="text-sm text-slate-500">Loading payouts...</p>
              ) : payouts.map((payout) => (
                <button
                  key={payout.id}
                  type="button"
                  onClick={() => setSelectedPayoutId(payout.id)}
                  className={
                    "rounded-2xl border p-4 text-left transition " +
                    (selectedPayoutId === payout.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:border-slate-300")
                  }
                >
                  <p className="font-medium">{formatCurrency(payout.total_amount)}</p>
                  <p className="mt-1 text-sm opacity-80">{formatDate(payout.period_start)} to {formatDate(payout.period_end)}</p>
                  <p className="mt-2 text-xs opacity-70">{payout.status}</p>
                </button>
              ))}
            </div>

            {selectedPayout ? (
              <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">Payout Detail</p>
                    <p className="text-sm text-slate-500">{formatCurrency(selectedPayout.total_amount)} · {selectedPayout.status}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={approvePayout} disabled={saving}>Approve</Button>
                    <Button onClick={processPayout} disabled={saving}>Mark Complete</Button>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  {selectedPayout.line_items.map((item) => (
                    <div key={item.campaign_title} className="rounded-xl bg-slate-50 p-3">
                      <p className="font-medium text-slate-900">{item.campaign_title}</p>
                      <p>{formatCurrency(item.total_amount)} from {item.donation_count} donations</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}