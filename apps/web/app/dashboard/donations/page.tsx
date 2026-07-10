"use client";

import { useEffect, useState } from "react";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest, formatDate } from "@/lib/dashboard";
import { ChevronDown, ChevronUp } from "lucide-react";

type Donation = {
  id: string;
  amount: number;
  donated_at: string;
  campaign_title: string;
  ngo_name: string;
};

type DonationMonth = {
  yearMonth: string;
  displayMonth: string;
  total: number;
  donations: Donation[];
};

function groupDonationsByMonth(donations: Donation[]): DonationMonth[] {
  const grouped = new Map<string, Donation[]>();

  donations.forEach((donation) => {
    const date = new Date(donation.donated_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(donation);
  });

  return Array.from(grouped.entries())
    .map(([key, donations]) => {
      const [year, month] = key.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        yearMonth: key,
        displayMonth: date.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        total: donations.reduce((sum, d) => sum + d.amount, 0),
        donations: donations.sort((a, b) => new Date(b.donated_at).getTime() - new Date(a.donated_at).getTime()),
      };
    })
    .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        // Fetch all donations (we could paginate later if needed)
        const data = await dashboardRequest<Donation[]>(`/donations?limit=500`);
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
  }, []);

  const toggleMonth = (yearMonth: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(yearMonth)) {
      newExpanded.delete(yearMonth);
    } else {
      newExpanded.add(yearMonth);
    }
    setExpandedMonths(newExpanded);
  };

  const monthlyGroups = groupDonationsByMonth(donations);
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

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

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">No donations yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {monthlyGroups.map((month) => (
            <div
              key={month.yearMonth}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              {/* Month header - always visible, clickable to expand */}
              <button
                onClick={() => toggleMonth(month.yearMonth)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition"
              >
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{month.displayMonth}</p>
                  <p className="text-sm text-slate-500">{month.donations.length} donations</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-emerald-600">{formatInrPaisa(month.total)}</p>
                  {expandedMonths.has(month.yearMonth) ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Daily donations - shown when expanded */}
              {expandedMonths.has(month.yearMonth) && (
                <div className="border-t border-slate-200">
                  <div className="divide-y divide-slate-100">
                    {month.donations.map((donation) => (
                      <div
                        key={donation.id}
                        className="px-6 py-3 flex justify-between items-center hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(donation.donated_at).toLocaleDateString("en-IN", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {donation.campaign_title} → {donation.ngo_name}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900 ml-4">
                          {formatInrPaisa(donation.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && donations.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-1">Total donated</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatInrPaisa(totalDonated)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
