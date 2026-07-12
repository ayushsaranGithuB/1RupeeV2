"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { ImageUploadField } from "@/components/ImageUploadField";
import { adminRequest, formatCurrency, formatDate } from "@/lib/admin";
import { CAMPAIGN_CATEGORY_OPTIONS, type CampaignCategory } from "@/lib/public";
import { cn } from "@/lib/utils";
import { OverviewTab } from "./components/OverviewTab";
import { AnalyticsTab } from "./components/AnalyticsTab";

interface CampaignRecord {
  id: string;
  ngo_id: string;
  title: string;
  slug: string;
  category: CampaignCategory | null;
  description: string | null;
  mobile_hero_image: string | null;
  desktop_hero_image: string | null;
  logo_url: string | null;
  impact_highlights: string[] | null;
  goal_amount: number | null;
  raised_amount: number;
  supporter_count: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
}

interface NgoOption {
  id: string;
  name: string;
}

interface TierRecord {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  features: string[] | null;
  featured: boolean;
  daily_amount: number;
  monthly_equivalent: number;
  display_order: number;
  active: boolean;
}

interface DonationRecord {
  id: string;
  amount: number;
  donated_at: string;
  campaign_title: string;
  ngo_name: string;
  user_name: string;
  user_email: string;
}

interface FormState {
  title: string;
  category: string;
  description: string;
  mobile_hero_image: string;
  desktop_hero_image: string;
  logo_url: string;
  impact_highlights: string;
  status: CampaignRecord["status"];
  goal_amount: string;
}

type CampaignTab = "overview" | "tiers" | "analytics" | "settings";

const TAB_ITEMS: Array<{ key: CampaignTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "tiers", label: "Support Tiers" },
  { key: "analytics", label: "Analytics" },
  { key: "settings", label: "Settings" },
];

const emptyTierForm = {
  title: "",
  description: "",
  features: "",
  featured: false,
  daily_amount: "1",
  monthly_equivalent: "30",
  display_order: "0",
};

type TierDrawerMode = "create" | "edit" | null;

export default function CampaignDetailsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading...</div>}>
      <CampaignDetailsContent />
    </Suspense>
  );
}

function CampaignDetailsContent() {
  const params = useParams<{ campaignId: string }>();
  const searchParams = useSearchParams();
  const campaignId = params.campaignId;

  const [ngos, setNgos] = useState<NgoOption[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [tiers, setTiers] = useState<TierRecord[]>([]);
  const [recentDonations, setRecentDonations] = useState<DonationRecord[]>([]);
  const [activeTab, setActiveTab] = useState<CampaignTab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    category: "",
    description: "",
    mobile_hero_image: "",
    desktop_hero_image: "",
    logo_url: "",
    impact_highlights: "",
    status: "DRAFT",
    goal_amount: "",
  });
  const [tierForm, setTierForm] = useState(emptyTierForm);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierDrawerMode, setTierDrawerMode] = useState<TierDrawerMode>(null);
  const [tierSaving, setTierSaving] = useState(false);

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === campaignId) || null,
    [campaignId, campaigns],
  );

  const ngoName = useMemo(() => {
    if (!selectedCampaign) return "Unknown NGO";
    return (
      ngos.find((ngo) => ngo.id === selectedCampaign.ngo_id)?.name ||
      "Unknown NGO"
    );
  }, [ngos, selectedCampaign]);

  const completionPercent = useMemo(() => {
    if (!selectedCampaign || !selectedCampaign.goal_amount) return 0;
    return Math.min(
      100,
      Math.round(
        (selectedCampaign.raised_amount / selectedCampaign.goal_amount) * 100,
      ),
    );
  }, [selectedCampaign]);

  const tierSummary = useMemo(() => {
    if (!tiers.length) {
      return { min: 0, max: 0 };
    }
    const values = tiers.map((tier) => tier.daily_amount);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [tiers]);

  useEffect(() => {
    async function loadData() {
      if (!campaignId) {
        setError("Invalid campaign id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [campaignData, ngoData, tierData, donationData] =
          await Promise.all([
            adminRequest<CampaignRecord[]>("/admin/campaigns"),
            adminRequest<NgoOption[]>("/admin/ngos"),
            adminRequest<TierRecord[]>(`/admin/campaigns/${campaignId}/tiers`),
            adminRequest<DonationRecord[]>(
              `/admin/donations?campaign_id=${encodeURIComponent(
                campaignId,
              )}&limit=8`,
            ),
          ]);

        setCampaigns(campaignData);
        setNgos(ngoData);
        setTiers(tierData);
        setRecentDonations(donationData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load campaign workspace",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [campaignId]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_ITEMS.some((item) => item.key === tabParam)) {
      setActiveTab(tabParam as CampaignTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedCampaign) {
      return;
    }

    setForm({
      title: selectedCampaign.title,
      category: selectedCampaign.category || "",
      description: selectedCampaign.description || "",
      mobile_hero_image: selectedCampaign.mobile_hero_image || "",
      desktop_hero_image: selectedCampaign.desktop_hero_image || "",
      logo_url: selectedCampaign.logo_url || "",
      impact_highlights: (selectedCampaign.impact_highlights ?? []).join("\n"),
      status: selectedCampaign.status,
      goal_amount: String(selectedCampaign.goal_amount || ""),
    });
  }, [selectedCampaign]);

  async function saveCampaign(statusOverride?: CampaignRecord["status"]) {
    if (!selectedCampaign) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await adminRequest(`/admin/campaigns/${selectedCampaign.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          category: form.category || undefined,
          description: form.description,
          mobile_hero_image: form.mobile_hero_image || undefined,
          desktop_hero_image: form.desktop_hero_image || undefined,
          logo_url: form.logo_url || undefined,
          impact_highlights: form.impact_highlights
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          goal_amount: form.goal_amount ? Number(form.goal_amount) : undefined,
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

  async function loadTiers() {
    const data = await adminRequest<TierRecord[]>(
      `/admin/campaigns/${campaignId}/tiers`,
    );
    setTiers(data);
  }

  function openCreateTier() {
    setEditingTierId(null);
    setTierForm(emptyTierForm);
    setTierDrawerMode("create");
  }

  function openEditTier(tier: TierRecord) {
    setEditingTierId(tier.id);
    setTierForm({
      title: tier.title,
      description: tier.description || "",
      features: (tier.features ?? []).join("\n"),
      featured: tier.featured,
      daily_amount: String(tier.daily_amount),
      monthly_equivalent: String(tier.monthly_equivalent),
      display_order: String(tier.display_order),
    });
    setTierDrawerMode("edit");
  }

  async function handleTierSubmit(e: FormEvent) {
    e.preventDefault();
    if (!campaignId) return;

    setTierSaving(true);
    setError(null);

    const payload = {
      campaign_id: campaignId,
      title: tierForm.title,
      description: tierForm.description,
      features: tierForm.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      featured: tierForm.featured,
      daily_amount: Number(tierForm.daily_amount),
      monthly_equivalent: Number(tierForm.monthly_equivalent),
      display_order: Number(tierForm.display_order),
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
      setTierForm(emptyTierForm);
      setEditingTierId(null);
      setTierDrawerMode(null);
      await loadTiers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tier");
    } finally {
      setTierSaving(false);
    }
  }

  async function removeTier(id: string) {
    setTierSaving(true);
    setError(null);
    try {
      await adminRequest(`/admin/tiers/${id}`, { method: "DELETE" });
      await loadTiers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tier");
    } finally {
      setTierSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-500">
          <Link href="/admin" className="hover:text-slate-700">Admin</Link>
          {' / '}
          <Link href="/admin/campaigns" className="hover:text-slate-700">Campaigns</Link>
          {' / Campaign Workspace'}
        </p>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-[30px] font-semibold leading-tight text-slate-900">
                {selectedCampaign?.title || "Campaign"}
              </h1>
              {selectedCampaign ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    selectedCampaign.status === "ACTIVE"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600",
                  )}
                >
                  {selectedCampaign.status}
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-slate-500">{ngoName}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/campaigns"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Back
            </Link>
            <Button
              onClick={() => saveCampaign()}
              disabled={saving || !selectedCampaign}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b mb-3 border-slate-200 py-2">
          <div className="flex flex-wrap gap-1">
            {TAB_ITEMS.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.key)}
                className={
                  activeTab === tab.key
                    ? "bg-emerald-100 "
                    : "hover:bg-slate-100"
                }
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => saveCampaign("ACTIVE")}
              disabled={saving || !selectedCampaign}
            >
              Publish
            </Button>
            <Button
              variant="outline"
              onClick={() => saveCampaign("ARCHIVED")}
              disabled={saving || !selectedCampaign}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Archive
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Loading campaign workspace...
          </div>
        ) : !selectedCampaign ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Campaign not found.
          </div>
        ) : (
          <div className="">
            <div className="space-y-6 p-6">
              {activeTab === "overview" ? (
                <OverviewTab
                  selectedCampaign={selectedCampaign}
                  tiers={tiers}
                  recentDonations={recentDonations}
                  completionPercent={completionPercent}
                />
              ) : null}

              {activeTab === "tiers" ? (
                <div className="space-y-4 ">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-[18px] font-semibold text-slate-900">
                        Support Tiers
                      </h2>
                      <p className="text-sm text-slate-500">
                        Content and pricing here are unique to this campaign.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={openCreateTier}
                      className="bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      Add Tier
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tier Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Daily</TableHead>
                        <TableHead>Monthly</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tiers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-sm text-slate-500"
                          >
                            No tiers configured.
                          </TableCell>
                        </TableRow>
                      ) : (
                        tiers
                          .slice()
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((tier) => (
                            <TableRow key={tier.id}>
                              <TableCell className="font-medium text-slate-900">
                                {tier.title}
                                {tier.featured ? (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                                  >
                                    Featured
                                  </Badge>
                                ) : null}
                              </TableCell>
                              <TableCell>{tier.description || "-"}</TableCell>
                              <TableCell>
                                {formatCurrency(tier.daily_amount)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(tier.monthly_equivalent)}
                              </TableCell>
                              <TableCell>
                                {tier.active ? "Active" : "Inactive"}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditTier(tier)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => removeTier(tier.id)}
                                    disabled={tierSaving}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              {activeTab === "analytics" ? (
                <AnalyticsTab
                  selectedCampaign={selectedCampaign}
                  tiers={tiers}
                  recentDonations={recentDonations}
                  completionPercent={completionPercent}
                  tierSummary={tierSummary}
                />
              ) : null}

              {activeTab === "settings" ? (
                <div className="space-y-6">
                  <section className="space-y-4">
                    <h2 className="text-[18px] font-semibold text-slate-900">
                      Basic Information
                    </h2>
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
                          Publishing Status
                        </label>
                        <Select
                          id="campaign-status"
                          value={form.status}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              status: e.target
                                .value as CampaignRecord["status"],
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
                          htmlFor="campaign-goal"
                          className="text-sm font-medium text-slate-700"
                        >
                          Fundraising Goal (₹)
                        </label>
                        <Input
                          id="campaign-goal"
                          type="number"
                          value={form.goal_amount}
                          onChange={(e) =>
                            setForm({ ...form, goal_amount: e.target.value })
                          }
                          placeholder="e.g., 100000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="campaign-category"
                          className="text-sm font-medium text-slate-700"
                        >
                          Cause Category
                        </label>
                        <Select
                          id="campaign-category"
                          value={form.category}
                          onChange={(e) =>
                            setForm({ ...form, category: e.target.value })
                          }
                        >
                          <option value="">No category</option>
                          {CAMPAIGN_CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="xl:col-span-2 space-y-2">
                        <label
                          htmlFor="campaign-description"
                          className="text-sm font-medium text-slate-700"
                        >
                          Description
                        </label>
                        <Textarea
                          id="campaign-description"
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                          className="min-h-36"
                        />
                        <p className="text-xs text-slate-400">
                          Supports Markdown: **bold**, *italic*, - lists, and
                          line breaks.
                        </p>
                      </div>
                      <div className="xl:col-span-2 space-y-2">
                        <label
                          htmlFor="campaign-impact-highlights"
                          className="text-sm font-medium text-slate-700"
                        >
                          Impact Highlights (one per line)
                        </label>
                        <Textarea
                          id="campaign-impact-highlights"
                          value={form.impact_highlights}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              impact_highlights: e.target.value,
                            })
                          }
                          placeholder={
                            "18,500+ people provided with clean water\n42 villages supported\n67 wells repaired or installed"
                          }
                          className="min-h-28"
                        />
                      </div>
                      <div className="xl:col-span-2">
                        <ImageUploadField
                          label="Campaign Logo"
                          value={form.logo_url}
                          onChange={(url) =>
                            setForm({ ...form, logo_url: url })
                          }
                          onError={(err) => setError(err)}
                          minSize={500}
                          aspectRatio="square"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="campaign-mobile-hero-image"
                          className="text-sm font-medium text-slate-700"
                        >
                          Mobile Hero URL (3:4)
                        </label>
                        <Input
                          id="campaign-mobile-hero-image"
                          value={form.mobile_hero_image}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              mobile_hero_image: e.target.value,
                            })
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="campaign-desktop-hero-image"
                          className="text-sm font-medium text-slate-700"
                        >
                          Desktop Hero URL (4:3)
                        </label>
                        <Input
                          id="campaign-desktop-hero-image"
                          value={form.desktop_hero_image}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              desktop_hero_image: e.target.value,
                            })
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 border-t border-slate-200 pt-6">
                    <h2 className="text-[18px] font-semibold text-slate-900">
                      Danger Zone
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => saveCampaign("ARCHIVED")}
                      disabled={saving}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Archive Campaign
                    </Button>
                  </section>

                  <details className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-medium text-slate-700">
                      Developer
                    </summary>
                    <div className="mt-3 grid gap-3 text-sm text-slate-600 xl:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Campaign ID
                        </p>
                        <p className="mt-1 break-all rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                          {selectedCampaign.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Slug
                        </p>
                        <p className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                          /{selectedCampaign.slug}
                        </p>
                      </div>
                      <div className="xl:col-span-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Mobile Hero URL
                        </p>
                        <p className="mt-1 break-all rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                          {selectedCampaign.mobile_hero_image || "-"}
                        </p>
                      </div>
                      <div className="xl:col-span-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Desktop Hero URL
                        </p>
                        <p className="mt-1 break-all rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                          {selectedCampaign.desktop_hero_image || "-"}
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {tierDrawerMode ? (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-900/20"
              onClick={() => setTierDrawerMode(null)}
            />
            <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[520px] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">
                    {selectedCampaign?.title || "Campaign"} / Support Tiers
                  </p>
                  <h2 className="text-[22px] font-semibold text-slate-900">
                    {tierDrawerMode === "create" ? "Add Tier" : "Edit Tier"}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setTierDrawerMode(null)}
                >
                  Close
                </Button>
              </div>

              <form className="grid gap-3" onSubmit={handleTierSubmit}>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Tier Title</p>
                  <Input
                    value={tierForm.title}
                    onChange={(e) =>
                      setTierForm({ ...tierForm, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Daily Amount (₹)</p>
                  <Input
                    value={tierForm.daily_amount}
                    onChange={(e) =>
                      setTierForm({ ...tierForm, daily_amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    Monthly Equivalent (₹)
                  </p>
                  <Input
                    value={tierForm.monthly_equivalent}
                    onChange={(e) =>
                      setTierForm({
                        ...tierForm,
                        monthly_equivalent: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Display Order</p>
                  <Input
                    value={tierForm.display_order}
                    onChange={(e) =>
                      setTierForm({
                        ...tierForm,
                        display_order: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Link
                    href={`?tab=settings`}
                    className="text-xs text-slate-400 hover:text-emerald-600 hover:underline"
                  >
                    Description
                  </Link>
                  <Textarea
                    value={tierForm.description}
                    onChange={(e) =>
                      setTierForm({ ...tierForm, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    Features (one per line)
                  </p>
                  <Textarea
                    rows={5}
                    value={tierForm.features}
                    onChange={(e) =>
                      setTierForm({ ...tierForm, features: e.target.value })
                    }
                    placeholder={
                      "Emergency drinking water\nWater purification tablets\nSupports one family"
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={tierForm.featured}
                    onChange={(e) =>
                      setTierForm({ ...tierForm, featured: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Featured tier (highlighted on the campaign page)
                </label>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={tierSaving}
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    {tierSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTierDrawerMode(null)}
                  >
                    Close
                  </Button>
                </div>
              </form>
            </aside>
          </>
        ) : null}
      </div>{" "}
    </div>
  );
}
