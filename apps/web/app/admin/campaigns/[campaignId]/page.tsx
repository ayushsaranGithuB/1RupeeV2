"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminRequest, formatCurrency } from "@/lib/admin";
import { cn } from "@/lib/utils";

interface CampaignRecord {
  id: string;
  ngo_id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  hero_image: string | null;
  goal_amount: number | null;
  raised_amount: number;
  supporter_count: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
}

interface FormState {
  title: string;
  short_description: string;
  description: string;
  hero_image: string;
  status: CampaignRecord["status"];
}

export default function CampaignDetailsPage() {
  const params = useParams<{ campaignId: string }>();
  const campaignId = params.campaignId;

  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    short_description: "",
    description: "",
    hero_image: "",
    status: "DRAFT",
  });

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === campaignId) || null,
    [campaignId, campaigns],
  );

  useEffect(() => {
    async function loadCampaigns() {
      setLoading(true);
      setError(null);

      try {
        const data = await adminRequest<CampaignRecord[]>("/admin/campaigns");
        setCampaigns(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load campaign details",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, []);

  useEffect(() => {
    if (!selectedCampaign) {
      return;
    }

    setForm({
      title: selectedCampaign.title,
      short_description: selectedCampaign.short_description || "",
      description: selectedCampaign.description || "",
      hero_image: selectedCampaign.hero_image || "",
      status: selectedCampaign.status,
    });
  }, [selectedCampaign]);

  async function saveCampaign(statusOverride?: CampaignRecord["status"]) {
    if (!selectedCampaign) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await adminRequest("/admin/campaigns/" + selectedCampaign.id, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          short_description: form.short_description,
          description: form.description,
          hero_image: form.hero_image || undefined,
          status: statusOverride || form.status,
        }),
      });

      const updatedCampaigns = await adminRequest<CampaignRecord[]>(
        "/admin/campaigns",
      );
      setCampaigns(updatedCampaigns);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update campaign",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Campaign Details</h1>
          <p className="text-sm text-slate-500">
            Review metrics and edit this campaign in its own dedicated view.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/campaigns"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to Campaign List
          </Link>
          <Link
            href="/admin/campaigns/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Create Campaign
          </Link>
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-slate-500">
            Loading campaign details...
          </CardContent>
        </Card>
      ) : !selectedCampaign ? (
        <Card>
          <CardContent className="pt-6 text-sm text-slate-500">
            Campaign not found. Return to the campaign list to pick a valid
            campaign.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px,minmax(620px,1fr)] xl:grid-cols-[300px,minmax(680px,1fr)] 2xl:grid-cols-[360px,minmax(760px,1fr)]">
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Performance Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Status
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {selectedCampaign.status}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Raised
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {formatCurrency(selectedCampaign.raised_amount)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Goal
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {formatCurrency(selectedCampaign.goal_amount || 0)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Supporters
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {selectedCampaign.supporter_count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Campaign ID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {selectedCampaign.id}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Slug
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-700">
                    /{selectedCampaign.slug}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Edit Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="xl:col-span-2 space-y-2">
                  <label
                    htmlFor="campaign-title"
                    className="text-sm font-medium text-slate-700"
                  >
                    Campaign Title
                  </label>
                  <Input
                    id="campaign-title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="campaign-status"
                    className="text-sm font-medium text-slate-700"
                  >
                    Campaign Status
                  </label>
                  <Select
                    id="campaign-status"
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

                <div className="space-y-2">
                  <label
                    htmlFor="campaign-slug"
                    className="text-sm font-medium text-slate-700"
                  >
                    Slug
                  </label>
                  <Input
                    id="campaign-slug"
                    value={`/${selectedCampaign.slug}`}
                    disabled
                  />
                </div>

                <div className="xl:col-span-2 space-y-2">
                  <label
                    htmlFor="campaign-hero-image"
                    className="text-sm font-medium text-slate-700"
                  >
                    Hero Image URL
                  </label>
                  <Input
                    id="campaign-hero-image"
                    value={form.hero_image}
                    onChange={(e) =>
                      setForm({ ...form, hero_image: e.target.value })
                    }
                  />
                </div>

                <div className="xl:col-span-2 space-y-2">
                  <label
                    htmlFor="campaign-short-description"
                    className="text-sm font-medium text-slate-700"
                  >
                    Short Description
                  </label>
                  <Textarea
                    id="campaign-short-description"
                    value={form.short_description}
                    onChange={(e) =>
                      setForm({ ...form, short_description: e.target.value })
                    }
                    className="min-h-[96px]"
                  />
                </div>

                <div className="xl:col-span-2 space-y-2">
                  <label
                    htmlFor="campaign-description"
                    className="text-sm font-medium text-slate-700"
                  >
                    Detailed Description
                  </label>
                  <Textarea
                    id="campaign-description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="min-h-[180px]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                <Button onClick={() => saveCampaign()} disabled={saving}>
                  {saving ? "Saving..." : "Save Campaign"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => saveCampaign("ACTIVE")}
                  disabled={saving}
                >
                  Publish
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => saveCampaign("ARCHIVED")}
                  disabled={saving}
                >
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
