"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminRequest, formatCurrency, formatDate } from "@/lib/admin";

interface DonationRecord {
  id: string;
  amount: number;
  donated_at: string;
  campaign_title: string;
  ngo_name: string;
  user_name: string;
  user_email: string;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [ngoId, setNgoId] = useState("");
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedDonation =
    donations.find((donation) => donation.id === selectedDonationId) || null;

  async function loadDonations() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (campaignId) params.set("campaign_id", campaignId);
      if (ngoId) params.set("ngo_id", ngoId);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await adminRequest<DonationRecord[]>(
        `/admin/donations${query}`,
      );
      setDonations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load donations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDonations();
  }, []);

  function exportCsv() {
    const header = [
      "id",
      "ngo",
      "campaign",
      "user",
      "email",
      "amount",
      "donated_at",
    ];
    const rows = donations.map((donation) => [
      donation.id,
      donation.ngo_name,
      donation.campaign_title,
      donation.user_name,
      donation.user_email,
      String(donation.amount),
      donation.donated_at,
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "donations.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Admin / Donations
          </p>
          <h1 className="text-[30px] font-semibold">Donations</h1>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <Input
          value={ngoId}
          placeholder="Filter by NGO id"
          onChange={(e) => setNgoId(e.target.value)}
        />
        <Input
          value={campaignId}
          placeholder="Filter by campaign id"
          onChange={(e) => setCampaignId(e.target.value)}
        />
        <Button
          onClick={loadDonations}
          className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
        >
          Apply
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          Donation Feed
        </div>
        <div className="p-2">
          {loading ? (
            <p className="px-2 py-3 text-sm text-slate-500">
              Loading donations...
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>NGO</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-slate-500">
                      No donations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  donations.map((donation) => (
                    <TableRow
                      key={donation.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedDonationId(donation.id);
                        setDrawerOpen(true);
                      }}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {donation.campaign_title}
                      </TableCell>
                      <TableCell>{donation.ngo_name}</TableCell>
                      <TableCell>
                        {donation.user_name} · {donation.user_email}
                      </TableCell>
                      <TableCell>{formatCurrency(donation.amount)}</TableCell>
                      <TableCell>{formatDate(donation.donated_at)}</TableCell>
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
                <p className="text-xs text-slate-400">Donation Drawer</p>
                <h2 className="text-[22px] font-semibold text-slate-900">
                  Donation Details
                </h2>
              </div>
              <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                Close
              </Button>
            </div>

            {selectedDonation ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">Campaign</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedDonation.campaign_title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">NGO</p>
                  <p className="text-sm text-slate-700">
                    {selectedDonation.ngo_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Donor</p>
                  <p className="text-sm text-slate-700">
                    {selectedDonation.user_name} · {selectedDonation.user_email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(selectedDonation.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="text-sm text-slate-700">
                    {formatDate(selectedDonation.donated_at)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Select a donation from the table.
              </p>
            )}
          </aside>
        </>
      ) : null}
    </div>
  );
}
