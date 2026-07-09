"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDonations() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (campaignId) params.set("campaign_id", campaignId);
      if (ngoId) params.set("ngo_id", ngoId);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await adminRequest<DonationRecord[]>(`/admin/donations${query}`);
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
    const header = ["id", "ngo", "campaign", "user", "email", "amount", "donated_at"];
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Donations</h1>
          <p className="text-sm text-slate-500">Search donations and export the filtered list as CSV.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr,1fr,160px]">
          <Input value={ngoId} placeholder="Filter by NGO id" onChange={(e) => setNgoId(e.target.value)} />
          <Input value={campaignId} placeholder="Filter by campaign id" onChange={(e) => setCampaignId(e.target.value)} />
          <Button onClick={loadDonations}>Apply Filters</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Donation Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading donations...</p>
          ) : donations.map((donation) => (
            <div key={donation.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{donation.campaign_title}</p>
                  <p className="text-sm text-slate-500">{donation.ngo_name}</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{formatCurrency(donation.amount)}</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">{donation.user_name} · {donation.user_email}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDate(donation.donated_at)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}