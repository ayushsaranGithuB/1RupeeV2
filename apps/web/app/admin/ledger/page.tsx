"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedEntry =
    entries.find((entry) => entry.id === selectedEntryId) || null;

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
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-500">Admin / Ledger</p>
        <h1 className="text-[30px] font-semibold">Platform Ledger</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-[220px]"
        >
          <option value="">All transaction types</option>
          <option value="TOPUP">Top-ups</option>
          <option value="DONATION">Donations</option>
          <option value="REFUND">Refunds</option>
          <option value="ADJUSTMENT">Adjustments</option>
        </Select>
        <Button
          onClick={loadLedger}
          className="bg-emerald-600 text-white hover:bg-emerald-500"
        >
          Apply
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          Ledger Entries
        </div>
        <div className="p-2">
          {loading ? (
            <p className="px-2 py-3 text-sm text-slate-500">
              Loading ledger...
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-slate-500">
                      No ledger entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedEntryId(entry.id);
                        setDrawerOpen(true);
                      }}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {entry.user_name}
                        <div className="text-xs text-slate-500">
                          {entry.user_email}
                        </div>
                      </TableCell>
                      <TableCell>{entry.type}</TableCell>
                      <TableCell>{formatCurrency(entry.amount)}</TableCell>
                      <TableCell>{entry.description || "-"}</TableCell>
                      <TableCell>{formatDate(entry.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {drawerOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[520px] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Ledger Drawer</p>
                <h2 className="text-[22px] font-semibold text-slate-900">
                  Transaction Details
                </h2>
              </div>
              <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                Close
              </Button>
            </div>

            {selectedEntry ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">User</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedEntry.user_name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedEntry.user_email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="text-sm text-slate-700">{selectedEntry.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(selectedEntry.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Description</p>
                  <p className="text-sm text-slate-700">
                    {selectedEntry.description || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="text-sm text-slate-700">
                    {formatDate(selectedEntry.created_at)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Select a transaction from the table.
              </p>
            )}
          </aside>
        </>
      ) : null}
    </div>
  );
}
