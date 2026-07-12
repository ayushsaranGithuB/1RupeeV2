"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { adminRequest, formatCurrency, formatDate } from "@/lib/admin";

interface NgoRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  verification_status: "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  payout_account?: {
    verification_notes?: string;
  } | null;
  created_at?: string;
}

interface CampaignSummary {
  id: string;
  ngo_id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  goal_amount: number | null;
  raised_amount: number;
  supporter_count: number;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  logo_url: "",
  website: "",
  email: "",
  phone: "",
  verification_notes: "",
  verification_status: "PENDING" as NgoRecord["verification_status"],
};

type DrawerMode = "create" | "edit" | null;

export default function NGOManagement() {
  const [ngos, setNgos] = useState<NgoRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const selectedNgo = useMemo(
    () => ngos.find((ngo) => ngo.id === selectedNgoId) || null,
    [ngos, selectedNgoId],
  );

  const activeCampaignsForSelectedNgo = useMemo(() => {
    if (!selectedNgoId) {
      return [];
    }

    return campaigns.filter(
      (campaign) =>
        campaign.ngo_id === selectedNgoId && campaign.status === "ACTIVE",
    );
  }, [campaigns, selectedNgoId]);

  const filteredNgos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return ngos.filter((ngo) => {
      const matchesSearch = normalizedSearch
        ? ngo.name.toLowerCase().includes(normalizedSearch) ||
          ngo.slug.toLowerCase().includes(normalizedSearch) ||
          (ngo.email || "").toLowerCase().includes(normalizedSearch)
        : true;
      const matchesStatus = statusFilter
        ? ngo.verification_status === statusFilter
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [ngos, search, statusFilter]);

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedNgoId(null);
  }

  async function loadNgos() {
    setLoading(true);
    setError(null);

    try {
      const [ngoData, campaignData] = await Promise.all([
        adminRequest<NgoRecord[]>("/admin/ngos"),
        adminRequest<CampaignSummary[]>("/admin/campaigns"),
      ]);
      setNgos(ngoData);
      setCampaigns(campaignData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load NGOs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNgos();
  }, []);

  useEffect(() => {
    if (!selectedNgo) {
      setEditForm(emptyForm);
      return;
    }

    setEditForm({
      name: selectedNgo.name,
      slug: selectedNgo.slug,
      description: selectedNgo.description || "",
      logo_url: selectedNgo.logo_url || "",
      website: selectedNgo.website || "",
      email: selectedNgo.email || "",
      phone: selectedNgo.phone || "",
      verification_notes: selectedNgo.payout_account?.verification_notes || "",
      verification_status: selectedNgo.verification_status,
    });
  }, [selectedNgo]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await adminRequest("/admin/ngos", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      setCreateForm(emptyForm);
      setDrawerMode(null);
      await loadNgos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create NGO");
    } finally {
      setSaving(false);
    }
  }

  async function saveSelectedNgo() {
    if (!selectedNgo) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await adminRequest("/admin/ngos/" + selectedNgo.id, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      setDrawerMode(null);
      setSelectedNgoId(null);
      await loadNgos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update NGO");
    } finally {
      setSaving(false);
    }
  }

  async function archiveSelectedNgo() {
    if (!selectedNgo) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await adminRequest("/admin/ngos/" + selectedNgo.id, {
        method: "PATCH",
        body: JSON.stringify({ archived: true }),
      });
      closeDrawer();
      await loadNgos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive NGO");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <p className="text-xs text-slate-400">Admin / NGOs</p>
        <h1 className="text-[30px] font-semibold">NGO Management</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[220px] flex-1 space-y-1">
            <p className="text-xs text-slate-400">Search</p>
            <Input
              placeholder="Search by name, slug, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full space-y-1 sm:w-[200px]">
            <p className="text-xs text-slate-400">Status</p>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </div>
          <Button variant="outline" onClick={loadNgos}>
            Refresh
          </Button>
          <Button
            onClick={() => {
              setCreateForm(emptyForm);
              setDrawerMode("create");
            }}
            className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
          >
            Add NGO
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-2">
        {loading ? (
          <p className="px-3 py-3 text-sm text-slate-500">Loading NGOs...</p>
        ) : filteredNgos.length === 0 ? (
          <p className="px-3 py-3 text-sm text-slate-500">No NGOs found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNgos.map((ngo) => (
                <TableRow
                  key={ngo.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedNgoId(ngo.id);
                    setDrawerMode("edit");
                  }}
                >
                  <TableCell className="font-medium text-slate-900">
                    {ngo.name}
                    <div className="text-xs text-slate-500">/{ngo.slug}</div>
                  </TableCell>
                  <TableCell>{ngo.email || "-"}</TableCell>
                  <TableCell>{ngo.verification_status}</TableCell>
                  <TableCell>{formatDate(ngo.created_at)}</TableCell>
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
                <p className="text-xs text-slate-400">NGO Details</p>
                <h2 className="text-[22px] font-semibold text-slate-900">
                  {drawerMode === "create"
                    ? "Create NGO"
                    : selectedNgo?.name || "NGO Details"}
                </h2>
              </div>
              <Button variant="outline" onClick={closeDrawer}>
                Close
              </Button>
            </div>

            {drawerMode === "create" ? (
              <form className="grid gap-3" onSubmit={handleCreate}>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Name</p>
                  <Input
                    placeholder="Name"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Slug</p>
                  <Input
                    placeholder="Slug"
                    value={createForm.slug}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Email</p>
                  <Input
                    placeholder="Email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Phone</p>
                  <Input
                    placeholder="Phone"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Website</p>
                  <Input
                    placeholder="Website"
                    value={createForm.website}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, website: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Logo URL</p>
                  <Input
                    placeholder="Logo URL"
                    value={createForm.logo_url}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, logo_url: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Description</p>
                  <Textarea
                    placeholder="Description"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Verification Notes</p>
                  <Textarea
                    placeholder="Verification notes"
                    value={createForm.verification_notes}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        verification_notes: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDrawer}>
                    Close
                  </Button>
                </div>
              </form>
            ) : selectedNgo ? (
              <div className="grid gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Name</p>
                  <Input
                    placeholder="Name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Slug</p>
                  <Input
                    placeholder="Slug"
                    value={editForm.slug}
                    onChange={(e) =>
                      setEditForm({ ...editForm, slug: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Email</p>
                  <Input
                    placeholder="Email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Phone</p>
                  <Input
                    placeholder="Phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Website</p>
                  <Input
                    placeholder="Website"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Logo URL</p>
                  <Input
                    placeholder="Logo URL"
                    value={editForm.logo_url}
                    onChange={(e) =>
                      setEditForm({ ...editForm, logo_url: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Verification Status</p>
                  <Select
                    value={editForm.verification_status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        verification_status: e.target
                          .value as NgoRecord["verification_status"],
                      })
                    }
                  >
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SUSPENDED">Suspended</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Description</p>
                  <Textarea
                    placeholder="Description"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Verification Notes</p>
                  <Textarea
                    placeholder="Verification notes"
                    value={editForm.verification_notes}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        verification_notes: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">
                      Active Campaigns ({activeCampaignsForSelectedNgo.length})
                    </p>
                    <Link
                      href={`/admin/campaigns?ngo=${selectedNgo.id}`}
                      className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                    >
                      View all Campaigns for this NGO
                    </Link>
                  </div>
                  {activeCampaignsForSelectedNgo.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No active campaigns for this NGO.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {activeCampaignsForSelectedNgo.map((campaign) => (
                        <li key={campaign.id}>
                          <Link
                            href={`/admin/campaigns/${campaign.id}`}
                            className="block rounded-md border border-slate-200 bg-white px-3 py-2 hover:border-[hsl(var(--primary))]/30 hover:bg-[hsl(var(--primary))]/5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-medium text-slate-900">
                                {campaign.title}
                              </span>
                              <span className="shrink-0 text-xs text-slate-500">
                                {campaign.supporter_count} supporters
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              {formatCurrency(campaign.raised_amount)} raised
                              {campaign.goal_amount
                                ? ` / ${formatCurrency(campaign.goal_amount)} goal`
                                : ""}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Added {formatDate(selectedNgo.created_at)}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    onClick={saveSelectedNgo}
                    disabled={saving}
                    className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={closeDrawer}>
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={archiveSelectedNgo}
                    disabled={saving}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Archive
                  </Button>
                </div>
              </div>
            ) : null}
          </aside>
        </>
      ) : null}
    </div>
  );
}
