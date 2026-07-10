"use client";

import { useEffect, useState } from "react";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest, formatDate, toQueryString } from "@/lib/dashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Donation = {
  id: string;
  amount: number;
  donated_at: string;
  campaign_title: string;
  ngo_name: string;
};

const PAGE_SIZE = 25;

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const query = toQueryString({
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        });
        const data = await dashboardRequest<Donation[]>(`/donations${query}`);
        if (!active) return;
        setDonations(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load donations");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">Donations</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Donation history
        </h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>NGO</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-slate-500">
                    No donations yet.
                  </TableCell>
                </TableRow>
              ) : (
                donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>{formatDate(donation.donated_at)}</TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {donation.campaign_title}
                    </TableCell>
                    <TableCell>{donation.ngo_name}</TableCell>
                    <TableCell>{formatInrPaisa(donation.amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={donations.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
