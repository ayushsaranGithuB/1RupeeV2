"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import { adminRequest, formatCurrency, formatDate } from "@/lib/admin";
import { cn } from "@/lib/utils";

interface CampaignRecord {
  id: string;
  ngo_id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  hero_image: string | null;
  mobile_hero_image: string | null;
  tablet_hero_image: string | null;
  desktop_hero_image: string | null;
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
  impact_description: string | null;
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
  short_description: string;
  description: string;
  hero_image: string;
  mobile_hero_image: string;
  tablet_hero_image: string;
  desktop_hero_image: string;
  status: CampaignRecord["status"];
}

type CampaignTab = "overview" | "tiers" | "analytics" | "settings";

const TAB_ITEMS: Array<{ key: CampaignTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "tiers", label: "Support Tiers" },
  { key: "analytics", label: "Analytics" },
  { key: "settings", label: "Settings" },
];

export default function CampaignDetailsPage() {
  const params = useParams<{ campaignId: string }>();
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
    short_description: "",
    description: "",
    hero_image: "",
    mobile_hero_image: "",
    tablet_hero_image: "",
    desktop_hero_image: "",
    status: "DRAFT",
  });

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
    if (!selectedCampaign) {
      return;
    }

    setForm({
      title: selectedCampaign.title,
      short_description: selectedCampaign.short_description || "",
      description: selectedCampaign.description || "",
      hero_image: selectedCampaign.hero_image || "",
      mobile_hero_image: selectedCampaign.mobile_hero_image || "",
      tablet_hero_image: selectedCampaign.tablet_hero_image || "",
      desktop_hero_image: selectedCampaign.desktop_hero_image || "",
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
      await adminRequest(`/admin/campaigns/${selectedCampaign.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          short_description: form.short_description,
          description: form.description,
          hero_image: form.hero_image || undefined,
          mobile_hero_image: form.mobile_hero_image || undefined,
          tablet_hero_image: form.tablet_hero_image || undefined,
          desktop_hero_image: form.desktop_hero_image || undefined,
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
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-500">
          Admin / Campaigns / Campaign Workspace
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-200 py-2">
        <div className="flex flex-wrap gap-1">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                activeTab === tab.key
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {tab.label}
            </button>
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
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-6 p-6">
            {activeTab === "overview" ? (
              <div className="space-y-6">
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Raised</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatCurrency(selectedCampaign.raised_amount)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Goal</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatCurrency(selectedCampaign.goal_amount || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Supporters</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedCampaign.supporter_count}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedCampaign.status}
                    </p>
                  </div>
                </section>

                <section className="space-y-2 border-t border-slate-200 pt-6">
                  <h2 className="text-[18px] font-semibold text-slate-900">
                    Description
                  </h2>
                  <p className="text-sm text-slate-700">
                    {selectedCampaign.description ||
                      selectedCampaign.short_description ||
                      "No description added yet."}
                  </p>
                </section>

                <section className="space-y-3 border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-slate-900">
                      Support Tiers
                    </h2>
                    <Link
                      href="/admin/tiers"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Edit Tiers
                    </Link>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tier</TableHead>
                        <TableHead>Daily</TableHead>
                        <TableHead>Monthly</TableHead>
                        <TableHead>Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tiers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
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
                              </TableCell>
                              <TableCell>
                                {formatCurrency(tier.daily_amount)}/day
                              </TableCell>
                              <TableCell>
                                {formatCurrency(tier.monthly_equivalent)}
                              </TableCell>
                              <TableCell>
                                {tier.active ? "Yes" : "No"}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </section>

                <section className="space-y-3 border-t border-slate-200 pt-6">
                  <h2 className="text-[18px] font-semibold text-slate-900">
                    Recent Activity
                  </h2>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDonations.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-sm text-slate-500"
                          >
                            No recent donations.
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentDonations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell className="font-medium text-slate-900">
                              {donation.user_name}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(donation.amount)}
                            </TableCell>
                            <TableCell>
                              {formatDate(donation.donated_at)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </section>
              </div>
            ) : null}

            {activeTab === "tiers" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[18px] font-semibold text-slate-900">
                    Support Tiers
                  </h2>
                  <Link
                    href="/admin/tiers"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    Manage in Tier Editor
                  </Link>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Daily</TableHead>
                      <TableHead>Monthly</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
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
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : null}

            {activeTab === "analytics" ? (
              <div className="space-y-6">
                <section className="space-y-3">
                  <h2 className="text-[18px] font-semibold text-slate-900">
                    Funding Progress
                  </h2>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-600">
                    {completionPercent}% of goal reached
                  </p>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Daily Tier Range</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {tiers.length
                        ? `${formatCurrency(
                            tierSummary.min,
                          )} - ${formatCurrency(tierSummary.max)}`
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Recent Donations</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {recentDonations.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Campaign Status</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedCampaign.status}
                    </p>
                  </div>
                </section>
              </div>
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
                        htmlFor="campaign-short-description"
                        className="text-sm font-medium text-slate-700"
                      >
                        One-line Summary
                      </label>
                      <Input
                        id="campaign-short-description"
                        value={form.short_description}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            short_description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="xl:col-span-2 space-y-2">
                      <label
                        htmlFor="campaign-description"
                        className="text-sm font-medium text-slate-700"
                      >
                        Full Description
                      </label>
                      <Textarea
                        id="campaign-description"
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        className="min-h-36"
                      />
                    </div>
                    <div className="xl:col-span-2 space-y-2">
                      <label
                        htmlFor="campaign-hero-image"
                        className="text-sm font-medium text-slate-700"
                      >
                        Fallback Hero URL
                      </label>
                      <Input
                        id="campaign-hero-image"
                        value={form.hero_image}
                        onChange={(e) =>
                          setForm({ ...form, hero_image: e.target.value })
                        }
                        placeholder="https://..."
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
                        htmlFor="campaign-tablet-hero-image"
                        className="text-sm font-medium text-slate-700"
                      >
                        Tablet Hero URL (5:3)
                      </label>
                      <Input
                        id="campaign-tablet-hero-image"
                        value={form.tablet_hero_image}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tablet_hero_image: e.target.value,
                          })
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="xl:col-span-2 space-y-2">
                      <label
                        htmlFor="campaign-desktop-hero-image"
                        className="text-sm font-medium text-slate-700"
                      >
                        Desktop Hero URL (9:3)
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
                        Fallback Hero URL
                      </p>
                      <p className="mt-1 break-all rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                        {selectedCampaign.hero_image || "-"}
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
                        Tablet Hero URL
                      </p>
                      <p className="mt-1 break-all rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                        {selectedCampaign.tablet_hero_image || "-"}
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
    </div>
  );
}
