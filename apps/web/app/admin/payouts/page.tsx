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

type DrawerMode = "create" | "detail" | null;

export default function PayoutManagement() {
  const [ngos, setNgos] = useState<NgoOption[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutDetail | null>(
    null,
  );
  const [form, setForm] = useState(initialForm);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
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
      setError(
        err instanceof Error ? err.message : "Failed to load payout details",
      );
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
      setError(
        err instanceof Error ? err.message : "Failed to generate payout",
      );
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
        body: JSON.stringify({
          payout_id: selectedPayout.id,
          notes: "Reviewed in admin console",
        }),
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
    const header = [
      "payout_id",
      "ngo_id",
      "status",
      "period_start",
      "period_end",
      "total_amount",
    ];
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
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Admin / Payouts</p>
          <h1 className="text-[30px] font-semibold">Payout Workflow</h1>
        </div>
        <Button variant="outline" onClick={downloadHistory}>
          Download CSV
        </Button>
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
              setDrawerMode("create");
              setForm((current) => ({
                ...current,
                ngo_id: ngos[0]?.id || current.ngo_id,
              }));
            }}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            Generate Payout
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="rounded-lg border border-slate-200">
          {loading ? (
            <p className="px-3 py-3 text-sm text-slate-500">
              Loading payouts...
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow
                    key={payout.id}
                    className={
                      selectedPayoutId === payout.id
                        ? "bg-slate-100"
                        : "cursor-pointer"
                    }
                    onClick={() => {
                      setSelectedPayoutId(payout.id);
                      setDrawerMode("detail");
                    }}
                  >
                    <TableCell>
                      {formatDate(payout.period_start)} to{" "}
                      {formatDate(payout.period_end)}
                    </TableCell>
                    <TableCell>{payout.status}</TableCell>
                    <TableCell>{formatCurrency(payout.total_amount)}</TableCell>
                  </TableRow>
                ))}
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
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[560px] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Payout Drawer</p>
                <h2 className="text-[22px] font-semibold text-slate-900">
                  {drawerMode === "create"
                    ? "Generate Payout"
                    : "Payout Detail"}
                </h2>
              </div>
              <Button variant="outline" onClick={() => setDrawerMode(null)}>
                Close
              </Button>
            </div>

            {drawerMode === "create" ? (
              <form className="grid gap-3" onSubmit={handleCreate}>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">NGO</p>
                  <Select
                    value={form.ngo_id}
                    onChange={(e) =>
                      setForm({ ...form, ngo_id: e.target.value })
                    }
                  >
                    {ngos.map((ngo) => (
                      <option key={ngo.id} value={ngo.id}>
                        {ngo.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Start Date</p>
                  <Input
                    type="datetime-local"
                    value={form.start_date.slice(0, 16)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        start_date: new Date(e.target.value).toISOString(),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">End Date</p>
                  <Input
                    type="datetime-local"
                    value={form.end_date.slice(0, 16)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        end_date: new Date(e.target.value).toISOString(),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Receipt URL</p>
                  <Input
                    value={form.receipt_url}
                    onChange={(e) =>
                      setForm({ ...form, receipt_url: e.target.value })
                    }
                    placeholder="Receipt URL for completion"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={saving || !ngos.length}
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    {saving ? "Generating..." : "Save"}
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
            ) : selectedPayout ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {formatCurrency(selectedPayout.total_amount)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedPayout.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={approvePayout}
                      disabled={saving}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={processPayout}
                      disabled={saving}
                      className="bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Donations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPayout.line_items.map((item) => (
                        <TableRow key={item.campaign_title}>
                          <TableCell>{item.campaign_title}</TableCell>
                          <TableCell>
                            {formatCurrency(item.total_amount)}
                          </TableCell>
                          <TableCell>{item.donation_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Select a payout from table.
              </p>
            )}
          </aside>
        </>
      ) : null}
    </div>
  );
}
