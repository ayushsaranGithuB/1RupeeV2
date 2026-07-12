"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/ImageUploadField";
import { adminRequest } from "@/lib/admin";
import { CAMPAIGN_CATEGORY_OPTIONS } from "@/lib/public";
import { cn } from "@/lib/utils";

interface NgoOption {
  id: string;
  name: string;
}

const emptyForm = {
  ngo_id: "",
  title: "",
  slug: "",
  category: "",
  description: "",
  impact_highlights: "",
  mobile_hero_image: "",
  desktop_hero_image: "",
  logo_url: "",
  goal_amount: "",
  status: "DRAFT",
};

export default function CreateCampaignPage() {
  const router = useRouter();
  const [ngos, setNgos] = useState<NgoOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNgos() {
      setLoading(true);
      setError(null);

      try {
        const ngoData = await adminRequest<NgoOption[]>("/admin/ngos");
        setNgos(ngoData);
        if (ngoData[0]) {
          setForm((current) => ({ ...current, ngo_id: ngoData[0].id }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load NGOs");
      } finally {
        setLoading(false);
      }
    }

    loadNgos();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await adminRequest("/admin/campaigns", {
        method: "POST",
        body: JSON.stringify({
          ngo_id: form.ngo_id,
          title: form.title,
          slug: form.slug,
          category: form.category || undefined,
          description: form.description,
          impact_highlights: form.impact_highlights
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          mobile_hero_image: form.mobile_hero_image || undefined,
          desktop_hero_image: form.desktop_hero_image || undefined,
          logo_url: form.logo_url || undefined,
          goal_amount: Number(form.goal_amount),
          status: form.status,
        }),
      });

      router.push("/admin/campaigns");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Admin / Campaigns / New
          </p>
          <h1 className="text-[30px] font-semibold">Create Campaign</h1>
        </div>
        <Link
          href="/admin/campaigns"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Back to Campaign List
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading NGOs...</p>
        ) : (
          <form className="grid gap-3 xl:grid-cols-2" onSubmit={handleCreate}>
            <div className="xl:col-span-2">
              <Select
                value={form.ngo_id}
                onChange={(e) => setForm({ ...form, ngo_id: e.target.value })}
                disabled={!ngos.length}
              >
                {ngos.map((ngo) => (
                  <option key={ngo.id} value={ngo.id}>
                    {ngo.name}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              value={form.title}
              placeholder="Title"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              value={form.slug}
              placeholder="Slug"
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
            />
            <div className="xl:col-span-2">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select a cause category</option>
                {CAMPAIGN_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="xl:col-span-2">
              <Textarea
                value={form.description}
                placeholder="Campaign description"
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="xl:col-span-2">
              <Textarea
                value={form.impact_highlights}
                placeholder={"Impact highlights (one per line)"}
                onChange={(e) =>
                  setForm({ ...form, impact_highlights: e.target.value })
                }
              />
            </div>
            <div className="xl:col-span-2">
              <ImageUploadField
                label="Campaign Logo"
                value={form.logo_url}
                onChange={(url) => setForm({ ...form, logo_url: url })}
                onError={(err) => setError(err)}
                minSize={500}
                aspectRatio="square"
              />
            </div>
            <Input
              value={form.mobile_hero_image}
              placeholder="Mobile hero image URL (3:4)"
              onChange={(e) =>
                setForm({ ...form, mobile_hero_image: e.target.value })
              }
            />
            <Input
              value={form.desktop_hero_image}
              placeholder="Desktop hero image URL (4:3)"
              onChange={(e) =>
                setForm({ ...form, desktop_hero_image: e.target.value })
              }
            />
            <Input
              value={form.goal_amount}
              placeholder="Goal amount (₹)"
              onChange={(e) =>
                setForm({ ...form, goal_amount: e.target.value })
              }
            />
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
            </Select>
            <div className="xl:col-span-2">
              <Button
                type="submit"
                disabled={saving || !ngos.length}
                className="bg-emerald-600 text-white hover:bg-emerald-500"
              >
                {saving ? "Saving..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
