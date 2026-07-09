"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { adminRequest, formatCurrency, formatDate } from "@/lib/admin";

interface LedgerEntry {
  id: string;
  created_at: string;
  type: "TOPUP" | "DONATION" | "REFUND" | "ADJUSTMENT";
  amount: number;
  description: string | null;
  user_name: string;
  user_email: string;
}

export default function LedgerPage() {
  const [type, setType] = useState("");
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLedger() {
    setLoading(true);
    setError(null);
    try {
      const query = type ? `?type=${type}` : "";
      const data = await adminRequest<LedgerEntry[]>(`/admin/ledger${query}`);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLedger();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Platform Ledger</h1>
        <p className="text-sm text-slate-500">View immutable wallet transactions across the platform.</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Ledger Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select value={type} onChange={(e) => setType(e.target.value)} className="w-[220px]">
            <option value="">All transaction types</option>
            <option value="TOPUP">Top-ups</option>
            <option value="DONATION">Donations</option>
            <option value="REFUND">Refunds</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </Select>
          <Button onClick={loadLedger}>Apply Filter</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ledger Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading ledger...</p>
          ) : entries.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{entry.user_name}</p>
                  <p className="text-sm text-slate-500">{entry.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{formatCurrency(entry.amount)}</p>
                  <p className="text-xs text-slate-400">{entry.type}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{entry.description}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDate(entry.created_at)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}