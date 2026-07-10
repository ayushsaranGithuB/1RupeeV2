"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { adminRequest, formatCurrency } from "@/lib/admin";
import { Textarea } from "@/components/ui/textarea";

interface CampaignRecord {
  id: string;
  ngo_id: string;
  title: string;
  slug: string;
  goal_amount: number | null;
  raised_amount: number;
  supporter_count: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  description?: string | null;
  impact_highlights?: string[] | null;
  mobile_hero_image?: string | null;
  desktop_hero_image?: string | null;
}

interface NgoOption {
  id: string;
  name: string;
}

type DrawerMode = "create" | "edit" | null;

const emptyForm = {
  ngo_id: "",
  title: "",
  slug: "",
  description: "",
  impact_highlights: "",
  mobile_hero_image: "",
  desktop_hero_image: "",
  goal_amount: "",
  status: "DRAFT" as CampaignRecord["status"],
};

export default function CampaignManagement() {
  const [ngos, setNgos] = useState<NgoOption[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ngoFilter, setNgoFilter] = useState("");
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );
  const [form, setForm] = useState(emptyForm);

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

  const selectedCampaign = useMemo(
    () =>
      campaigns.find((campaign) => campaign.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId],
  );

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedCampaignId(null);
  }

  async function saveCampaign() {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ngo_id: form.ngo_id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        impact_highlights: form.impact_highlights
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        mobile_hero_image: form.mobile_hero_image || undefined,
        desktop_hero_image: form.desktop_hero_image || undefined,
        goal_amount: Math.round(Number(form.goal_amount || 0) * 100),
        status: form.status,
      };

      if (drawerMode === "edit" && selectedCampaignId) {
        await adminRequest(`/admin/campaigns/${selectedCampaignId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await adminRequest("/admin/campaigns", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeDrawer();
      setForm(emptyForm);
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const ngoParam = new URLSearchParams(window.location.search).get("ngo");
    if (ngoParam) {
      setNgoFilter(ngoParam);
    }
  }, []);

  useEffect(() => {
    if (!selectedCampaign) {
      return;
    }

    setForm({
      ngo_id: selectedCampaign.ngo_id,
      title: selectedCampaign.title,
      slug: selectedCampaign.slug,
      description: selectedCampaign.description || "",
      impact_highlights: (selectedCampaign.impact_highlights ?? []).join("\n"),
      mobile_hero_image: selectedCampaign.mobile_hero_image || "",
      desktop_hero_image: selectedCampaign.desktop_hero_image || "",
      goal_amount: String((selectedCampaign.goal_amount || 0) / 100),
      status: selectedCampaign.status,
    });
  }, [selectedCampaign]);

  useEffect(() => {
    if (!form.ngo_id && ngos[0]) {
      setForm((current) => ({ ...current, ngo_id: ngos[0].id }));
    }
  }, [form.ngo_id, ngos]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Admin / Campaigns
          </p>
          <h1 className="text-[30px] font-semibold">Campaigns</h1>
        </div>
        <Button
          onClick={() => {
            setDrawerMode("create");
            setSelectedCampaignId(null);
            setForm((current) => ({
              ...emptyForm,
              ngo_id: ngos[0]?.id || current.ngo_id,
            }));
          }}
          className="bg-emerald-600 text-white hover:bg-emerald-500"
        >
          + Create Campaign
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            placeholder="Search by title or slug"
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[240px] flex-1 bg-white"
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2">
        {loading ? (
          <p className="px-2 py-3 text-sm text-slate-500">
            Loading campaigns...
          </p>
        ) : filteredCampaigns.length === 0 ? (
          <p className="px-2 py-3 text-sm text-slate-500">
            No campaigns found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>NGO</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Raised</TableHead>
                <TableHead>Supporters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCampaignId(campaign.id);
                    setDrawerMode("edit");
                  }}
                >
                  <TableCell className="font-medium text-slate-900">
                    {campaign.title}
                    <div className="text-xs text-slate-500">
                      /{campaign.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ngoNameById.get(campaign.ngo_id) || "Unknown NGO"}
                  </TableCell>
                  <TableCell>{campaign.status}</TableCell>
                  <TableCell>
                    {formatCurrency(campaign.raised_amount)} /{" "}
                    {formatCurrency(campaign.goal_amount || 0)}
                  </TableCell>
                  <TableCell>{campaign.supporter_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {drawerMode ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={closeDrawer}
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[540px] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Campaign Drawer</p>
                <h2 className="text-[22px] font-semibold text-slate-900">
                  {drawerMode === "create"
                    ? "Create Campaign"
                    : selectedCampaign?.title || "Campaign"}
                </h2>
              </div>
              <Button variant="outline" onClick={closeDrawer}>
                Close
              </Button>
            </div>

            <div className="grid gap-3">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">NGO</p>
                <Select
                  value={form.ngo_id}
                  onChange={(e) => setForm({ ...form, ngo_id: e.target.value })}
                >
                  {ngos.map((ngo) => (
                    <option key={ngo.id} value={ngo.id}>
                      {ngo.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Title</p>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Campaign title"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Slug</p>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  placeholder="campaign-slug"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Description</p>
                <Textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Campaign description"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">
                  Impact Highlights (one per line)
                </p>
                <Textarea
                  rows={4}
                  value={form.impact_highlights}
                  onChange={(e) =>
                    setForm({ ...form, impact_highlights: e.target.value })
                  }
                  placeholder={"18,500+ people reached\n42 villages supported"}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Mobile Hero URL (3:4)</p>
                <Input
                  value={form.mobile_hero_image}
                  onChange={(e) =>
                    setForm({ ...form, mobile_hero_image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Desktop Hero URL (4:3)</p>
                <Input
                  value={form.desktop_hero_image}
                  onChange={(e) =>
                    setForm({ ...form, desktop_hero_image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Goal Amount (₹)</p>
                <Input
                  value={form.goal_amount}
                  onChange={(e) =>
                    setForm({ ...form, goal_amount: e.target.value })
                  }
                  placeholder="Goal"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Status</p>
                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as CampaignRecord["status"],
                    })
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </div>

              {drawerMode === "edit" && selectedCampaign ? (
                <Link
                  href={`/admin/campaigns/${selectedCampaign.id}`}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Open full workspace
                </Link>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={saveCampaign}
                  disabled={saving}
                  className="bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={closeDrawer}>
                  Close
                </Button>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
