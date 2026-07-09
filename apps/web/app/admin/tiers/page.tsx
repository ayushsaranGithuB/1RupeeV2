"use client";

import { FormEvent, useEffect, useState } from "react";
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
import { adminRequest, formatCurrency } from "@/lib/admin";

interface CampaignOption {
  id: string;
  title: string;
}

interface TierRecord {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  impact_description: string | null;
  daily_amount: number;
  monthly_equivalent: number;
  display_order: number;
  active: boolean;
}

const emptyForm = {
  title: "",
  description: "",
  impact_description: "",
  daily_amount: "1",
  monthly_equivalent: "30",
  display_order: "0",
};

type DrawerMode = "create" | "edit" | null;

export default function TiersManagement() {
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [tiers, setTiers] = useState<TierRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCampaigns() {
    const data = await adminRequest<CampaignOption[]>("/admin/campaigns");
    setCampaigns(data);
    if (!selectedCampaignId && data[0]) {
      setSelectedCampaignId(data[0].id);
    }
  }

  async function loadTiers(campaignId: string) {
    if (!campaignId) return;
    const data = await adminRequest<TierRecord[]>(
      `/admin/campaigns/${campaignId}/tiers`,
    );
    setTiers(data);
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadCampaigns();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load campaigns",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) return;
    loadTiers(selectedCampaignId).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load tiers");
    });
  }, [selectedCampaignId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedCampaignId) return;

    setSaving(true);
    setError(null);

    const payload = {
      campaign_id: selectedCampaignId,
      title: form.title,
      description: form.description,
      impact_description: form.impact_description,
      daily_amount: Number(form.daily_amount),
      monthly_equivalent: Number(form.monthly_equivalent),
      display_order: Number(form.display_order),
    };

    try {
      if (editingTierId) {
        await adminRequest(`/admin/tiers/${editingTierId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await adminRequest("/admin/tiers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setForm(emptyForm);
      setEditingTierId(null);
      setDrawerMode(null);
      await loadTiers(selectedCampaignId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tier");
    } finally {
      setSaving(false);
    }
  }

  async function removeTier(id: string) {
    setSaving(true);
    setError(null);
    try {
      await adminRequest(`/admin/tiers/${id}`, { method: "DELETE" });
      await loadTiers(selectedCampaignId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tier");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-500">
          Admin / Support Tiers
        </p>
        <h1 className="text-[30px] font-semibold">Support Tiers</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full sm:w-[320px]"
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </Select>
          <Button
            onClick={() => {
              setDrawerMode("create");
              setEditingTierId(null);
              setForm(emptyForm);
            }}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            Add Tier
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          Campaign Tiers
        </div>
        <div className="p-2">
          {loading ? (
            <p className="px-2 py-3 text-sm text-slate-500">Loading tiers...</p>
          ) : !tiers.length ? (
            <p className="px-2 py-3 text-sm text-slate-500">
              No tiers configured yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Daily</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers
                  .slice()
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium text-slate-900">
                        {tier.title}
                        <div className="text-xs text-slate-500">
                          {tier.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(tier.daily_amount)}</TableCell>
                      <TableCell>
                        {formatCurrency(tier.monthly_equivalent)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTierId(tier.id);
                              setDrawerMode("edit");
                              setForm({
                                title: tier.title,
                                description: tier.description || "",
                                impact_description:
                                  tier.impact_description || "",
                                daily_amount: String(tier.daily_amount),
                                monthly_equivalent: String(
                                  tier.monthly_equivalent,
                                ),
                                display_order: String(tier.display_order),
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => removeTier(tier.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {drawerMode ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={() => setDrawerMode(null)}
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[520px] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Tier Drawer</p>
                <h2 className="text-[22px] font-semibold text-slate-900">
                  {drawerMode === "create" ? "Add Tier" : "Edit Tier"}
                </h2>
              </div>
              <Button variant="outline" onClick={() => setDrawerMode(null)}>
                Close
              </Button>
            </div>

            <form className="grid gap-3" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Tier Title</p>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Daily Amount</p>
                <Input
                  value={form.daily_amount}
                  onChange={(e) =>
                    setForm({ ...form, daily_amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Monthly Equivalent</p>
                <Input
                  value={form.monthly_equivalent}
                  onChange={(e) =>
                    setForm({ ...form, monthly_equivalent: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Display Order</p>
                <Input
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({ ...form, display_order: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Description</p>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Impact Description</p>
                <Textarea
                  value={form.impact_description}
                  onChange={(e) =>
                    setForm({ ...form, impact_description: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={saving || loading}
                  className="bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDrawerMode(null)}
                >
                  Close
                </Button>
              </div>
            </form>
          </aside>
        </>
      ) : null}
    </div>
  );
}
