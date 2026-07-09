"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

export default function TiersManagement() {
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [tiers, setTiers] = useState<TierRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
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
    const data = await adminRequest<TierRecord[]>(`/admin/campaigns/${campaignId}/tiers`);
    setTiers(data);
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadCampaigns();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load campaigns");
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Support Tiers</h1>
        <p className="text-sm text-slate-500">
          Configure 3-5 support tiers per campaign and keep impact descriptions current.
        </p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tier Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedCampaignId} onChange={(e) => setSelectedCampaignId(e.target.value)}>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </Select>
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <Input value={form.title} placeholder="Tier title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea value={form.description} placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Textarea value={form.impact_description} placeholder="Impact description" onChange={(e) => setForm({ ...form, impact_description: e.target.value })} />
              <div className="grid gap-3 md:grid-cols-3">
                <Input value={form.daily_amount} placeholder="Daily" onChange={(e) => setForm({ ...form, daily_amount: e.target.value })} />
                <Input value={form.monthly_equivalent} placeholder="Monthly" onChange={(e) => setForm({ ...form, monthly_equivalent: e.target.value })} />
                <Input value={form.display_order} placeholder="Order" onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
              </div>
              <Button type="submit" disabled={saving || loading}>
                {saving ? "Saving..." : editingTierId ? "Update Tier" : "Add Tier"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading tiers...</p>
            ) : !tiers.length ? (
              <p className="text-sm text-slate-500">No tiers configured yet.</p>
            ) : (
              tiers.map((tier) => (
                <div key={tier.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{tier.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{tier.description}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p>{formatCurrency(tier.daily_amount)} / day</p>
                      <p>{formatCurrency(tier.monthly_equivalent)} / month</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{tier.impact_description}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingTierId(tier.id);
                        setForm({
                          title: tier.title,
                          description: tier.description || "",
                          impact_description: tier.impact_description || "",
                          daily_amount: String(tier.daily_amount),
                          monthly_equivalent: String(tier.monthly_equivalent),
                          display_order: String(tier.display_order),
                        });
                      }}
                    >
                      Edit Tier
                    </Button>
                    <Button variant="destructive" onClick={() => removeTier(tier.id)}>
                      Delete Tier
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}