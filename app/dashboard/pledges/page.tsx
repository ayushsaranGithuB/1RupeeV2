"use client";

import { useEffect, useState } from "react";
import { formatInrPaisa } from "@/lib/public";
import { dashboardRequest } from "@/lib/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Pledge = {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  campaign_title?: string;
  tier_title?: string;
  daily_amount?: number;
  monthly_equivalent?: number;
};

const STATUS_VARIANT: Record<Pledge["status"], "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  PAUSED: "secondary",
  CANCELLED: "destructive",
};

export default function PledgesPage() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await dashboardRequest<Pledge[]>("/pledges");
      setPledges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pledges");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Pledge["status"]) {
    if (status === "CANCELLED" && !window.confirm("Cancel this pledge? This can't be undone.")) {
      return;
    }
    setUpdatingId(id);
    setError(null);
    try {
      await dashboardRequest(`/pledges/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pledge");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">Pledges</p>
        <h1 className="text-3xl font-semibold text-slate-900">Your pledges</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : pledges.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            You haven&apos;t pledged to any campaigns yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pledges.map((pledge) => (
              <li key={pledge.id} className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-900">
                      {pledge.campaign_title || "Campaign"}
                    </p>
                    <Badge variant={STATUS_VARIANT[pledge.status]}>
                      {pledge.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {pledge.tier_title || "Support tier"}
                    {typeof pledge.daily_amount === "number" &&
                      ` · ${formatInrPaisa(pledge.daily_amount)}/day`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {pledge.status === "ACTIVE" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingId === pledge.id}
                        onClick={() => updateStatus(pledge.id, "PAUSED")}
                      >
                        Pause
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={updatingId === pledge.id}
                        onClick={() => updateStatus(pledge.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {pledge.status === "PAUSED" && (
                    <>
                      <Button
                        size="sm"
                        disabled={updatingId === pledge.id}
                        onClick={() => updateStatus(pledge.id, "ACTIVE")}
                        className="bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        Resume
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={updatingId === pledge.id}
                        onClick={() => updateStatus(pledge.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
