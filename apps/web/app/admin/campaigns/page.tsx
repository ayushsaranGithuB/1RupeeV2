"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { adminRequest, formatCurrency } from "@/lib/admin";
import { cn } from "@/lib/utils";

interface CampaignRecord {
  id: string;
  ngo_id: string;
  title: string;
  slug: string;
  short_description: string | null;
  goal_amount: number | null;
  raised_amount: number;
  supporter_count: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
}

interface NgoOption {
  id: string;
  name: string;
}

export default function CampaignManagement() {
  const [ngos, setNgos] = useState<NgoOption[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ngoFilter, setNgoFilter] = useState("");

  const ngoNameById = useMemo(() => {
    const map = new Map<string, string>();
    ngos.forEach((ngo) => map.set(ngo.id, ngo.name));
    return map;
  }, [ngos]);

  async function loadCampaigns() {
    setLoading(true);
    setError(null);

    try {
      const [campaignData, ngoData] = await Promise.all([
        adminRequest<CampaignRecord[]>("/admin/campaigns"),
        adminRequest<NgoOption[]>("/admin/ngos"),
      ]);
      setCampaigns(campaignData);
      setNgos(ngoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesStatus = statusFilter
        ? campaign.status === statusFilter
        : true;
      const matchesNgo = ngoFilter ? campaign.ngo_id === ngoFilter : true;
      const matchesSearch = normalizedSearch
        ? campaign.title.toLowerCase().includes(normalizedSearch) ||
          campaign.slug.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesStatus && matchesNgo && matchesSearch;
    });
  }, [campaigns, ngoFilter, search, statusFilter]);

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Campaigns</h1>
          <p className="text-sm text-slate-500">
            Browse campaigns and open a dedicated detail view to edit each one.
          </p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-emerald-600 text-white shadow-[0_16px_34px_-16px_rgba(5,150,105,0.95)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-[0_22px_44px_-18px_rgba(5,150,105,0.95)] focus-visible:ring-emerald-500/70",
          )}
        >
          + Create Campaign
        </Link>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              placeholder="Search by title or slug"
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-[240px] flex-1"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-[220px]"
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
            <Select
              value={ngoFilter}
              onChange={(e) => setNgoFilter(e.target.value)}
              className="w-full sm:w-[220px]"
            >
              <option value="">All NGOs</option>
              {ngos.map((ngo) => (
                <option key={ngo.id} value={ngo.id}>
                  {ngo.name}
                </option>
              ))}
            </Select>
            <Button
              variant="outline"
              onClick={loadCampaigns}
              className="w-full sm:w-auto"
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading campaigns...</p>
          ) : filteredCampaigns.length === 0 ? (
            <p className="text-sm text-slate-500">No campaigns found.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/admin/campaigns/${campaign.id}`}
                  className="block h-full rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                >
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {campaign.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          /{campaign.slug}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          NGO:{" "}
                          {ngoNameById.get(campaign.ngo_id) || "Unknown NGO"}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {campaign.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">
                        {formatCurrency(campaign.raised_amount)} raised of{" "}
                        {formatCurrency(campaign.goal_amount || 0)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {campaign.supporter_count} supporters
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
